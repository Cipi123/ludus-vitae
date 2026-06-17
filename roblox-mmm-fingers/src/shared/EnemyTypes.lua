--!strict
-- EnemyTypes.lua
-- Data-only descriptions of the monster variants. The client's game loop
-- reads these to decide how each enemy looks and moves. Keeping them as
-- plain data (no closures) makes them trivial to tweak or extend.

export type EnemyType = {
	Id: string,
	Behavior: string, -- "straight" | "zigzag" | "chaser"
	RadiusMul: number, -- multiplies Config.Enemy.BaseRadius
	SpeedMul: number, -- multiplies the difficulty speed
	-- Relative spawn weight. Higher = appears more often.
	Weight: number,
	Color: Color3?,
}

-- The raw data lives in its own array so iterating it never trips over the
-- module's helper functions.
local Defs: { EnemyType } = {
	{
		Id = "Drifter",
		Behavior = "straight",
		RadiusMul = 1.0,
		SpeedMul = 1.0,
		Weight = 5,
	},
	{
		Id = "Runt",
		Behavior = "straight",
		RadiusMul = 0.7,
		SpeedMul = 1.45, -- small + fast
		Weight = 3,
		Color = Color3.fromRGB(245, 130, 60),
	},
	{
		Id = "Zigger",
		Behavior = "zigzag",
		RadiusMul = 1.0,
		SpeedMul = 1.05,
		Weight = 3,
		Color = Color3.fromRGB(210, 80, 200),
	},
	{
		Id = "Stalker",
		Behavior = "chaser",
		RadiusMul = 1.15,
		SpeedMul = 0.6, -- slow but homes in on you
		Weight = 2,
		Color = Color3.fromRGB(150, 60, 230),
	},
	{
		Id = "Brute",
		Behavior = "straight",
		RadiusMul = 1.6,
		SpeedMul = 0.8, -- big, slow, hard to dodge in tight spots
		Weight = 2,
		Color = Color3.fromRGB(200, 50, 50),
	},
}

local EnemyTypes = {}

EnemyTypes.Defs = Defs

-- Pick a weighted-random enemy type.
function EnemyTypes.pick(rng: Random): EnemyType
	local total = 0
	for _, t in Defs do
		total += t.Weight
	end
	local roll = rng:NextNumber(0, total)
	local acc = 0
	for _, t in Defs do
		acc += t.Weight
		if roll <= acc then
			return t
		end
	end
	return Defs[1]
end

return EnemyTypes
