--!strict
-- Remotes.lua
-- Lazily creates and returns the RemoteEvent/RemoteFunction instances used
-- for high-score persistence. Both client and server require this so they
-- agree on the same instances by name.

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Remotes = {}

local FOLDER_NAME = "MmmFingersRemotes"

local function ensureFolder(): Folder
	local folder = ReplicatedStorage:FindFirstChild(FOLDER_NAME)
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = FOLDER_NAME
		folder.Parent = ReplicatedStorage
	end
	return folder :: Folder
end

-- Server should call this to create the instances; client waits for them.
function Remotes.create(): { SubmitScore: RemoteEvent, GetHighScore: RemoteFunction }
	local folder = ensureFolder()

	local submit = folder:FindFirstChild("SubmitScore") :: RemoteEvent?
	if not submit then
		submit = Instance.new("RemoteEvent")
		submit.Name = "SubmitScore"
		submit.Parent = folder
	end

	local get = folder:FindFirstChild("GetHighScore") :: RemoteFunction?
	if not get then
		get = Instance.new("RemoteFunction")
		get.Name = "GetHighScore"
		get.Parent = folder
	end

	return { SubmitScore = submit :: RemoteEvent, GetHighScore = get :: RemoteFunction }
end

-- Client helper: wait for the instances the server created.
function Remotes.waitFor(): { SubmitScore: RemoteEvent, GetHighScore: RemoteFunction }
	local folder = ReplicatedStorage:WaitForChild(FOLDER_NAME, 15)
	if not folder then
		error("MmmFingers: remotes folder never appeared")
	end
	return {
		SubmitScore = folder:WaitForChild("SubmitScore") :: RemoteEvent,
		GetHighScore = folder:WaitForChild("GetHighScore") :: RemoteFunction,
	}
end

return Remotes
