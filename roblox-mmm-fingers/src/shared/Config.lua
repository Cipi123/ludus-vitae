--!strict
-- Config.lua
-- Central, tunable configuration for the Mmm Fingers game.
-- Every gameplay number lives here so balancing never means hunting
-- through the game loop.

local Config = {}

-- ── Player ("the finger") ────────────────────────────────────────────────
Config.Player = {
	Radius = 22, -- collision + visual radius, in pixels
	-- How quickly the blob catches up to the pointer. 1 = instant snap,
	-- lower = a smooth, slightly laggy follow that feels more "alive".
	FollowResponsiveness = 18,
	Color = Color3.fromRGB(120, 220, 90),
	OutlineColor = Color3.fromRGB(70, 160, 50),
	EyeColor = Color3.fromRGB(255, 255, 255),
	PupilColor = Color3.fromRGB(30, 40, 30),
}

-- ── Enemies ("the monsters") ─────────────────────────────────────────────
Config.Enemy = {
	-- Don't spawn a monster closer than this (pixels) to the player, so the
	-- game never feels like a cheap instant death.
	MinSpawnDistanceFromPlayer = 220,
	BaseSpeed = 170, -- pixels / second at difficulty 0
	BaseRadius = 24,
	Color = Color3.fromRGB(235, 70, 70),
	OutlineColor = Color3.fromRGB(150, 30, 30),
	EyeColor = Color3.fromRGB(255, 255, 255),
	PupilColor = Color3.fromRGB(40, 0, 0),
	ToothColor = Color3.fromRGB(255, 255, 255),
}

-- ── Difficulty curve ─────────────────────────────────────────────────────
-- Difficulty climbs from 0 upward over time and drives spawn rate / speed.
Config.Difficulty = {
	-- Seconds of survival to gain +1 difficulty. Lower = ramps up faster.
	SecondsPerLevel = 8,
	MaxLevel = 12,

	-- Enemy cap and spawn cadence interpolate between these endpoints as
	-- difficulty goes from 0 -> MaxLevel.
	StartMaxEnemies = 3,
	EndMaxEnemies = 16,
	StartSpawnInterval = 1.6, -- seconds between spawns
	EndSpawnInterval = 0.45,

	-- Speed multiplier applied on top of Enemy.BaseSpeed.
	StartSpeedMul = 0.85,
	EndSpeedMul = 1.9,
}

-- ── Scoring ──────────────────────────────────────────────────────────────
Config.Score = {
	PointsPerSecond = 10,
}

-- ── Theme / UI ───────────────────────────────────────────────────────────
Config.Theme = {
	Background = Color3.fromRGB(28, 32, 44),
	PlayfieldTint = Color3.fromRGB(22, 25, 36),
	Accent = Color3.fromRGB(120, 220, 90),
	Danger = Color3.fromRGB(235, 70, 70),
	TextPrimary = Color3.fromRGB(245, 245, 250),
	TextMuted = Color3.fromRGB(170, 178, 195),
	PanelColor = Color3.fromRGB(38, 43, 58),
	Font = Enum.Font.FredokaOne,
}

return Config
