--!strict
-- MmmFingers.client.lua
-- A Roblox re-imagining of Noodlecake's "Mmm Fingers".
--
-- You hold and drag a little green creature around a 2D arena. Red monsters
-- drift, weave and chase across the field trying to bite you. Touch one and
-- it's game over. Survive as long as you can — the longer you last, the more
-- monsters appear and the faster everything moves.
--
-- The whole game is a screen-space GUI simulation: positions are tracked in
-- pixels relative to the playfield frame, so it scales to any device and
-- works with both mouse and touch.

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("MmmFingers")
local Config = require(Shared:WaitForChild("Config"))
local EnemyTypes = require(Shared:WaitForChild("EnemyTypes"))
local Utils = require(Shared:WaitForChild("Utils"))
local Remotes = require(Shared:WaitForChild("Remotes"))

local UI = require(script.Parent:WaitForChild("UI"))

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local refs = UI.build(playerGui)
local remotes = Remotes.waitFor()

local rng = Random.new()

-- ── Game state ─────────────────────────────────────────────────────────────

type Enemy = {
	frame: Frame,
	pos: Vector2, -- playfield-local pixels (center)
	vel: Vector2, -- pixels / second
	radius: number,
	speed: number, -- target speed magnitude (used by chasers)
	behavior: string,
	wigglePhase: number,
	wiggleFreq: number,
	wiggleAmp: number,
}

local STATE_MENU = "Menu"
local STATE_PLAYING = "Playing"
local STATE_GAMEOVER = "GameOver"

local state = STATE_MENU
local enemies: { Enemy } = {}
local playerBlob: Frame
local playerPos = Vector2.new(0, 0)
local score = 0
local bestScore = 0
local elapsed = 0
local spawnTimer = 0

-- ── Pointer tracking ───────────────────────────────────────────────────────
-- We keep the most recent touch position (if a finger is down). On pure-touch
-- devices, lifting your finger means the blob stops — exactly the tension the
-- original game is built around.

local activeTouchPos: Vector2? = nil

local function isTouchOnlyDevice(): boolean
	return UserInputService.TouchEnabled and not UserInputService.MouseEnabled
end

UserInputService.InputBegan:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.Touch then
		activeTouchPos = Vector2.new(input.Position.X, input.Position.Y)
	end
end)

UserInputService.InputChanged:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.Touch then
		activeTouchPos = Vector2.new(input.Position.X, input.Position.Y)
	end
end)

UserInputService.InputEnded:Connect(function(input)
	if input.UserInputType == Enum.UserInputType.Touch then
		activeTouchPos = nil
	end
end)

-- Returns the desired target in *screen* coordinates, or nil if the player is
-- a touch user with no finger down.
local function getTargetScreenPos(): Vector2?
	if activeTouchPos then
		return activeTouchPos
	end
	if isTouchOnlyDevice() then
		return nil
	end
	return UserInputService:GetMouseLocation()
end

-- ── Helpers ────────────────────────────────────────────────────────────────

local function playfieldSize(): Vector2
	return refs.playfield.AbsoluteSize
end

local function rotateVec(v: Vector2, a: number): Vector2
	local c, s = math.cos(a), math.sin(a)
	return Vector2.new(v.X * c - v.Y * s, v.X * s + v.Y * c)
end

-- Convert a screen position to playfield-local pixels.
local function toLocal(screenPos: Vector2): Vector2
	return screenPos - refs.playfield.AbsolutePosition
end

local function setBlobPosition(pos: Vector2)
	playerBlob.Position = UDim2.fromOffset(pos.X, pos.Y)
end

-- ── Difficulty ─────────────────────────────────────────────────────────────

local D = Config.Difficulty

local function difficultyAlpha(): number
	local level = math.min(D.MaxLevel, elapsed / D.SecondsPerLevel)
	return level / D.MaxLevel
end

local function currentMaxEnemies(): number
	return math.floor(Utils.lerp(D.StartMaxEnemies, D.EndMaxEnemies, difficultyAlpha()) + 0.5)
end

local function currentSpawnInterval(): number
	return Utils.lerp(D.StartSpawnInterval, D.EndSpawnInterval, difficultyAlpha())
end

local function currentSpeedMul(): number
	return Utils.lerp(D.StartSpeedMul, D.EndSpeedMul, difficultyAlpha())
end

-- ── Enemy lifecycle ──────────────────────────────────────────────────────--

local function spawnEnemy()
	local size = playfieldSize()
	if size.X < 50 or size.Y < 50 then
		return
	end

	local def = EnemyTypes.pick(rng)
	local radius = Config.Enemy.BaseRadius * def.RadiusMul
	local speed = Config.Enemy.BaseSpeed * currentSpeedMul() * def.SpeedMul

	-- Choose a spawn point on one of the four edges, far enough from the
	-- player that it never feels like an unavoidable instant death.
	local pos = Vector2.new()
	for _ = 1, 8 do
		local edge = rng:NextInteger(1, 4)
		if edge == 1 then -- left
			pos = Vector2.new(radius, rng:NextNumber(radius, size.Y - radius))
		elseif edge == 2 then -- right
			pos = Vector2.new(size.X - radius, rng:NextNumber(radius, size.Y - radius))
		elseif edge == 3 then -- top
			pos = Vector2.new(rng:NextNumber(radius, size.X - radius), radius)
		else -- bottom
			pos = Vector2.new(rng:NextNumber(radius, size.X - radius), size.Y - radius)
		end
		if (pos - playerPos).Magnitude >= Config.Enemy.MinSpawnDistanceFromPlayer then
			break
		end
	end

	-- Aim roughly toward the field's interior, with some spread.
	local toCenter = (Vector2.new(size.X / 2, size.Y / 2) - pos)
	local baseAngle = math.atan2(toCenter.Y, toCenter.X) + rng:NextNumber(-0.7, 0.7)
	local dir = Vector2.new(math.cos(baseAngle), math.sin(baseAngle))

	local frame = UI.makeCircle(refs.creatureLayer, radius, def.Color or Config.Enemy.Color, Config.Enemy.OutlineColor)
	frame.ZIndex = 3
	UI.decorateFace(frame, Config.Enemy.EyeColor, Config.Enemy.PupilColor, true)
	frame.Position = UDim2.fromOffset(pos.X, pos.Y)

	local enemy: Enemy = {
		frame = frame,
		pos = pos,
		vel = dir * speed,
		radius = radius,
		speed = speed,
		behavior = def.Behavior,
		wigglePhase = rng:NextNumber(0, math.pi * 2),
		wiggleFreq = rng:NextNumber(4, 7),
		wiggleAmp = rng:NextNumber(3, 5),
	}
	table.insert(enemies, enemy)
end

local function clearEnemies()
	for _, e in enemies do
		e.frame:Destroy()
	end
	table.clear(enemies)
end

-- Move one enemy by dt, applying its behavior and wall handling.
local function updateEnemy(e: Enemy, dt: number, size: Vector2)
	if e.behavior == "chaser" then
		-- Steer the velocity toward the player, capped to the enemy's speed.
		local toPlayer = playerPos - e.pos
		if toPlayer.Magnitude > 0.001 then
			local desired = toPlayer.Unit * e.speed
			e.vel = e.vel:Lerp(desired, math.clamp(2.5 * dt, 0, 1))
			if e.vel.Magnitude > e.speed then
				e.vel = e.vel.Unit * e.speed
			end
		end
		e.pos += e.vel * dt
		-- Chasers don't bounce; they just can't leave the arena.
		e.pos = Utils.clampVec(e.pos, e.radius, e.radius, size.X - e.radius, size.Y - e.radius)
	else
		if e.behavior == "zigzag" then
			e.wigglePhase += e.wiggleFreq * dt
			local turn = math.sin(e.wigglePhase) * e.wiggleAmp * dt
			e.vel = rotateVec(e.vel, turn)
		end

		e.pos += e.vel * dt

		-- Bounce off the walls.
		if e.pos.X < e.radius then
			e.pos = Vector2.new(e.radius, e.pos.Y)
			e.vel = Vector2.new(math.abs(e.vel.X), e.vel.Y)
		elseif e.pos.X > size.X - e.radius then
			e.pos = Vector2.new(size.X - e.radius, e.pos.Y)
			e.vel = Vector2.new(-math.abs(e.vel.X), e.vel.Y)
		end
		if e.pos.Y < e.radius then
			e.pos = Vector2.new(e.pos.X, e.radius)
			e.vel = Vector2.new(e.vel.X, math.abs(e.vel.Y))
		elseif e.pos.Y > size.Y - e.radius then
			e.pos = Vector2.new(e.pos.X, size.Y - e.radius)
			e.vel = Vector2.new(e.vel.X, -math.abs(e.vel.Y))
		end
	end

	e.frame.Position = UDim2.fromOffset(e.pos.X, e.pos.Y)
end

-- ── State transitions ──────────────────────────────────────────────────────

local function startGame()
	clearEnemies()
	score = 0
	elapsed = 0
	spawnTimer = 0.4 -- brief grace before the first monster
	state = STATE_PLAYING

	local size = playfieldSize()
	playerPos = Vector2.new(size.X / 2, size.Y * 0.7)
	setBlobPosition(playerPos)
	playerBlob.Visible = true

	refs.menu.Visible = false
	refs.gameOver.Visible = false
	refs.scoreLabel.Visible = true
	refs.scoreLabel.Text = "0"
	refs.hint.Visible = true
end

local function gameOver()
	state = STATE_GAMEOVER

	if score > bestScore then
		bestScore = score
	end
	-- Fire-and-forget; the server validates and persists.
	remotes.SubmitScore:FireServer(score)

	refs.scoreLabel.Visible = false
	refs.hint.Visible = false
	refs.gameOverScore.Text = "Score: " .. Utils.commafy(score)
	refs.gameOverBest.Text = "Best: " .. Utils.commafy(bestScore)
	refs.gameOver.Visible = true
end

-- ── Main loop ──────────────────────────────────────────────────────────────

local function step(dt: number)
	if state ~= STATE_PLAYING then
		return
	end

	dt = math.min(dt, 1 / 30) -- guard against hitches teleporting enemies through you
	local size = playfieldSize()

	-- Move the player blob toward the pointer with smooth, framerate-
	-- independent easing.
	local target = getTargetScreenPos()
	if target then
		local localTarget = Utils.clampVec(
			toLocal(target),
			Config.Player.Radius,
			Config.Player.Radius,
			size.X - Config.Player.Radius,
			size.Y - Config.Player.Radius
		)
		local alpha = Utils.smoothAlpha(Config.Player.FollowResponsiveness, dt)
		playerPos = playerPos:Lerp(localTarget, alpha)
		setBlobPosition(playerPos)
	end

	-- Score + difficulty advance with time survived.
	elapsed += dt
	score += Config.Score.PointsPerSecond * dt
	refs.scoreLabel.Text = Utils.commafy(score)

	-- Spawn monsters on a difficulty-scaled cadence.
	spawnTimer -= dt
	if spawnTimer <= 0 then
		if #enemies < currentMaxEnemies() then
			spawnEnemy()
		end
		spawnTimer = currentSpawnInterval()
	end

	-- Move enemies and test for the bite.
	for _, e in enemies do
		updateEnemy(e, dt, size)
		if (e.pos - playerPos).Magnitude <= e.radius + Config.Player.Radius then
			gameOver()
			return
		end
	end
end

-- ── Boot ───────────────────────────────────────────────────────────────────

-- Build the player's blob once and reuse it across rounds.
playerBlob = UI.makeCircle(refs.creatureLayer, Config.Player.Radius, Config.Player.Color, Config.Player.OutlineColor)
playerBlob.ZIndex = 5
UI.decorateFace(playerBlob, Config.Player.EyeColor, Config.Player.PupilColor, false)
playerBlob.Visible = false

-- Pull the persisted best score for the menu/game-over displays.
task.spawn(function()
	local ok, result = pcall(function()
		return remotes.GetHighScore:InvokeServer()
	end)
	if ok and typeof(result) == "number" then
		bestScore = result
	end
end)

refs.playButton.Activated:Connect(startGame)
refs.retryButton.Activated:Connect(startGame)

RunService.RenderStepped:Connect(step)
