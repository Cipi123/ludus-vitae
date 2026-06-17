--!strict
-- UI.lua
-- Builds the entire game interface in code and hands back references the
-- game loop manipulates. Also exposes small factories for the round
-- "creature" frames (the player blob and the monsters).

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage:WaitForChild("MmmFingers"):WaitForChild("Config"))

local Theme = Config.Theme

local UI = {}

-- ── small builders ───────────────────────────────────────────────────────

local function corner(parent: Instance, radius: number)
	local c = Instance.new("UICorner")
	c.CornerRadius = UDim.new(0, radius)
	c.Parent = parent
end

local function stroke(parent: Instance, color: Color3, thickness: number)
	local s = Instance.new("UIStroke")
	s.Color = color
	s.Thickness = thickness
	s.Parent = parent
	return s
end

local function label(parent: Instance, text: string, textSize: number, color: Color3): TextLabel
	local l = Instance.new("TextLabel")
	l.BackgroundTransparency = 1
	l.Font = Theme.Font
	l.Text = text
	l.TextSize = textSize
	l.TextColor3 = color
	l.TextScaled = false
	l.Parent = parent
	return l
end

-- A round frame, sized by radius in pixels, anchored at its center.
function UI.makeCircle(parent: Instance, radius: number, color: Color3, outline: Color3?): Frame
	local f = Instance.new("Frame")
	f.AnchorPoint = Vector2.new(0.5, 0.5)
	f.Size = UDim2.fromOffset(radius * 2, radius * 2)
	f.BackgroundColor3 = color
	f.BorderSizePixel = 0
	f.Parent = parent
	corner(f, radius)
	if outline then
		stroke(f, outline, math.max(2, radius * 0.12))
	end
	return f
end

-- Give a circle a little cartoon face: two eyes and (optionally) teeth.
function UI.decorateFace(circle: Frame, eyeColor: Color3, pupilColor: Color3, teeth: boolean)
	for _, side in { -1, 1 } do
		local eye = Instance.new("Frame")
		eye.AnchorPoint = Vector2.new(0.5, 0.5)
		eye.Size = UDim2.fromScale(0.26, 0.26)
		eye.Position = UDim2.fromScale(0.5 + 0.2 * side, 0.4)
		eye.BackgroundColor3 = eyeColor
		eye.BorderSizePixel = 0
		eye.ZIndex = circle.ZIndex + 1
		eye.Parent = circle
		corner(eye, 999)

		local pupil = Instance.new("Frame")
		pupil.AnchorPoint = Vector2.new(0.5, 0.5)
		pupil.Size = UDim2.fromScale(0.5, 0.5)
		pupil.Position = UDim2.fromScale(0.5, 0.55)
		pupil.BackgroundColor3 = pupilColor
		pupil.BorderSizePixel = 0
		pupil.ZIndex = eye.ZIndex + 1
		pupil.Parent = eye
		corner(pupil, 999)
	end

	if teeth then
		local mouth = Instance.new("Frame")
		mouth.AnchorPoint = Vector2.new(0.5, 0.5)
		mouth.Size = UDim2.fromScale(0.55, 0.18)
		mouth.Position = UDim2.fromScale(0.5, 0.78)
		mouth.BackgroundColor3 = Color3.fromRGB(40, 0, 0)
		mouth.BorderSizePixel = 0
		mouth.ZIndex = circle.ZIndex + 1
		mouth.Parent = circle
		corner(mouth, 4)

		for i = 0, 3 do
			local tooth = Instance.new("Frame")
			tooth.AnchorPoint = Vector2.new(0.5, 0)
			tooth.Size = UDim2.fromScale(0.18, 0.7)
			tooth.Position = UDim2.fromScale(0.18 + i * 0.21, 0)
			tooth.BackgroundColor3 = Config.Enemy.ToothColor
			tooth.BorderSizePixel = 0
			tooth.ZIndex = mouth.ZIndex + 1
			tooth.Parent = mouth
		end
	end
end

local function makeButton(parent: Instance, text: string, color: Color3): TextButton
	local b = Instance.new("TextButton")
	b.AnchorPoint = Vector2.new(0.5, 0.5)
	b.Size = UDim2.fromOffset(240, 64)
	b.Position = UDim2.fromScale(0.5, 0.66)
	b.BackgroundColor3 = color
	b.AutoButtonColor = true
	b.BorderSizePixel = 0
	b.Font = Theme.Font
	b.Text = text
	b.TextSize = 30
	b.TextColor3 = Color3.fromRGB(20, 24, 18)
	b.Parent = parent
	corner(b, 16)
	return b
end

-- ── the full tree ─────────────────────────────────────────────────────────

export type Refs = {
	gui: ScreenGui,
	playfield: Frame,
	creatureLayer: Frame,
	scoreLabel: TextLabel,
	menu: Frame,
	playButton: TextButton,
	gameOver: Frame,
	gameOverScore: TextLabel,
	gameOverBest: TextLabel,
	retryButton: TextButton,
	hint: TextLabel,
}

function UI.build(parent: Instance): Refs
	local gui = Instance.new("ScreenGui")
	gui.Name = "MmmFingersGui"
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = false
	gui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
	gui.DisplayOrder = 10
	gui.Parent = parent

	-- Background
	local bg = Instance.new("Frame")
	bg.Size = UDim2.fromScale(1, 1)
	bg.BackgroundColor3 = Theme.Background
	bg.BorderSizePixel = 0
	bg.Parent = gui

	-- Playfield: the active area. Inset a touch so creatures read clearly.
	local playfield = Instance.new("Frame")
	playfield.Name = "Playfield"
	playfield.AnchorPoint = Vector2.new(0.5, 0.5)
	playfield.Position = UDim2.fromScale(0.5, 0.5)
	playfield.Size = UDim2.new(1, -24, 1, -24)
	playfield.BackgroundColor3 = Theme.PlayfieldTint
	playfield.BorderSizePixel = 0
	playfield.ClipsDescendants = true
	playfield.Parent = gui
	corner(playfield, 18)
	stroke(playfield, Color3.fromRGB(60, 66, 86), 2)

	-- Layer that holds the player + enemies (kept above the playfield bg).
	local creatureLayer = Instance.new("Frame")
	creatureLayer.Name = "Creatures"
	creatureLayer.Size = UDim2.fromScale(1, 1)
	creatureLayer.BackgroundTransparency = 1
	creatureLayer.ZIndex = 2
	creatureLayer.Parent = playfield

	-- HUD score (top-center)
	local scoreLabel = label(playfield, "0", 40, Theme.TextPrimary)
	scoreLabel.AnchorPoint = Vector2.new(0.5, 0)
	scoreLabel.Position = UDim2.new(0.5, 0, 0, 12)
	scoreLabel.Size = UDim2.fromOffset(300, 48)
	scoreLabel.ZIndex = 20
	scoreLabel.Visible = false

	-- Hint shown while playing ("Don't lift your finger!")
	local hint = label(playfield, "Hold and drag — don't get bitten!", 18, Theme.TextMuted)
	hint.AnchorPoint = Vector2.new(0.5, 1)
	hint.Position = UDim2.new(0.5, 0, 1, -12)
	hint.Size = UDim2.fromOffset(420, 24)
	hint.ZIndex = 20
	hint.Visible = false

	-- ── Menu overlay ─────────────────────────────────────────────────────
	local menu = Instance.new("Frame")
	menu.Name = "Menu"
	menu.Size = UDim2.fromScale(1, 1)
	menu.BackgroundColor3 = Theme.Background
	menu.BackgroundTransparency = 0.15
	menu.BorderSizePixel = 0
	menu.ZIndex = 30
	menu.Parent = gui

	local title = label(menu, "Mmm Fingers", 64, Theme.Accent)
	title.AnchorPoint = Vector2.new(0.5, 0.5)
	title.Position = UDim2.fromScale(0.5, 0.32)
	title.Size = UDim2.fromOffset(600, 80)
	title.ZIndex = 31

	local subtitle = label(menu, "Keep your finger down. Don't touch the monsters.", 22, Theme.TextMuted)
	subtitle.AnchorPoint = Vector2.new(0.5, 0.5)
	subtitle.Position = UDim2.fromScale(0.5, 0.44)
	subtitle.Size = UDim2.fromOffset(560, 30)
	subtitle.ZIndex = 31

	local playButton = makeButton(menu, "PLAY", Theme.Accent)
	playButton.ZIndex = 31

	-- ── Game over overlay ────────────────────────────────────────────────
	local gameOver = Instance.new("Frame")
	gameOver.Name = "GameOver"
	gameOver.Size = UDim2.fromScale(1, 1)
	gameOver.BackgroundColor3 = Theme.Background
	gameOver.BackgroundTransparency = 0.2
	gameOver.BorderSizePixel = 0
	gameOver.Visible = false
	gameOver.ZIndex = 40
	gameOver.Parent = gui

	local caught = label(gameOver, "Caught!", 60, Theme.Danger)
	caught.AnchorPoint = Vector2.new(0.5, 0.5)
	caught.Position = UDim2.fromScale(0.5, 0.30)
	caught.Size = UDim2.fromOffset(500, 70)
	caught.ZIndex = 41

	local gameOverScore = label(gameOver, "Score: 0", 34, Theme.TextPrimary)
	gameOverScore.AnchorPoint = Vector2.new(0.5, 0.5)
	gameOverScore.Position = UDim2.fromScale(0.5, 0.44)
	gameOverScore.Size = UDim2.fromOffset(420, 44)
	gameOverScore.ZIndex = 41

	local gameOverBest = label(gameOver, "Best: 0", 24, Theme.TextMuted)
	gameOverBest.AnchorPoint = Vector2.new(0.5, 0.5)
	gameOverBest.Position = UDim2.fromScale(0.5, 0.52)
	gameOverBest.Size = UDim2.fromOffset(420, 30)
	gameOverBest.ZIndex = 41

	local retryButton = makeButton(gameOver, "RETRY", Theme.Accent)
	retryButton.ZIndex = 41

	return {
		gui = gui,
		playfield = playfield,
		creatureLayer = creatureLayer,
		scoreLabel = scoreLabel,
		menu = menu,
		playButton = playButton,
		gameOver = gameOver,
		gameOverScore = gameOverScore,
		gameOverBest = gameOverBest,
		retryButton = retryButton,
		hint = hint,
	}
end

return UI
