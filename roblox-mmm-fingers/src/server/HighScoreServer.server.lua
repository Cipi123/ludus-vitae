--!strict
-- HighScoreServer.server.lua
-- Persists each player's best score with a DataStore and serves it back to
-- the client. All DataStore access is pcall-guarded so the game still runs
-- in Studio / unpublished places where the API is unavailable.

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Remotes = require(ReplicatedStorage:WaitForChild("MmmFingers"):WaitForChild("Remotes"))

local remotes = Remotes.create()

local STORE_NAME = "MmmFingersHighScores_v1"

local highScoreStore: DataStore? = nil
do
	local ok, store = pcall(function()
		return DataStoreService:GetDataStore(STORE_NAME)
	end)
	if ok then
		highScoreStore = store
	else
		warn("MmmFingers: DataStore unavailable, high scores will not persist:", store)
	end
end

-- In-memory cache so we never block the client on a DataStore read mid-game,
-- and so scores survive even when persistence is off.
local cache: { [number]: number } = {}

local function key(userId: number): string
	return "u_" .. userId
end

local function loadScore(userId: number): number
	if cache[userId] ~= nil then
		return cache[userId]
	end

	local value = 0
	if highScoreStore then
		local ok, result = pcall(function()
			return highScoreStore:GetAsync(key(userId))
		end)
		if ok and typeof(result) == "number" then
			value = result
		elseif not ok then
			warn("MmmFingers: failed to load high score for", userId, result)
		end
	end

	cache[userId] = value
	return value
end

local function saveScore(userId: number, score: number)
	if not highScoreStore then
		return
	end
	local ok, err = pcall(function()
		highScoreStore:SetAsync(key(userId), score)
	end)
	if not ok then
		warn("MmmFingers: failed to save high score for", userId, err)
	end
end

Players.PlayerAdded:Connect(function(player)
	-- Warm the cache so the first GetHighScore call is instant.
	loadScore(player.UserId)
end)

Players.PlayerRemoving:Connect(function(player)
	cache[player.UserId] = nil
end)

remotes.GetHighScore.OnServerInvoke = function(player: Player): number
	return loadScore(player.UserId)
end

remotes.SubmitScore.OnServerEvent:Connect(function(player: Player, score: any)
	-- Validate: clients are not to be trusted.
	if typeof(score) ~= "number" or score ~= score or score < 0 or score > 1e9 then
		return
	end
	score = math.floor(score)

	local best = loadScore(player.UserId)
	if score > best then
		cache[player.UserId] = score
		saveScore(player.UserId, score)
	end
end)
