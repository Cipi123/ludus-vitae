--!strict
-- Utils.lua
-- Tiny math/UI helpers shared by the client.

local Utils = {}

-- Linear interpolation.
function Utils.lerp(a: number, b: number, t: number): number
	return a + (b - a) * t
end

-- Clamp a Vector2 inside [min, max] on both axes.
function Utils.clampVec(v: Vector2, minX: number, minY: number, maxX: number, maxY: number): Vector2
	return Vector2.new(math.clamp(v.X, minX, maxX), math.clamp(v.Y, minY, maxY))
end

-- Frame-rate independent smoothing factor for an exponential approach.
-- `responsiveness` is roughly "how many e-folds per second".
function Utils.smoothAlpha(responsiveness: number, dt: number): number
	return 1 - math.exp(-responsiveness * dt)
end

-- Format a number with thousands separators (e.g. 12345 -> "12,345").
function Utils.commafy(n: number): string
	local s = tostring(math.floor(n))
	local out = ""
	local count = 0
	for i = #s, 1, -1 do
		out = string.sub(s, i, i) .. out
		count += 1
		if count % 3 == 0 and i > 1 then
			out = "," .. out
		end
	end
	return out
end

return Utils
