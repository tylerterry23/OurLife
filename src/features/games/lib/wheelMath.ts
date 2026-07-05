// Shared by any wheel-based game: given the wheel's current cumulative
// rotation and a target resting angle (mod 360, measured clockwise from the
// fixed pointer at 12 o'clock), returns a new cumulative rotation that (a)
// always spins forward, (b) includes a few extra full turns for effect, and
// (c) lands exactly on the target angle.
export function nextRotation(
  current: number,
  targetMod: number,
  minSpins: number
): number {
  const currentMod = ((current % 360) + 360) % 360
  let delta = targetMod - currentMod
  if (delta <= 0) delta += 360
  return current + minSpins * 360 + delta
}
