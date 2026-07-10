export type PlaybackSpeed = 0.5 | 1 | 2

const SPEEDS: readonly PlaybackSpeed[] = [0.5, 1, 2]

function frameCount(count: number): number {
  return Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0
}

export function clampPlaybackIndex(index: number, count: number): number {
  const last = Math.max(0, frameCount(count) - 1)
  const candidate = Number.isFinite(index) ? Math.trunc(index) : 0
  return Math.max(0, Math.min(last, candidate))
}

export function nextPlaybackIndex(index: number, count: number): number {
  return clampPlaybackIndex(index + 1, count)
}

export function previousPlaybackIndex(index: number, count: number): number {
  return clampPlaybackIndex(index - 1, count)
}

export function normalizePlaybackSpeed(value: number): PlaybackSpeed {
  return SPEEDS.includes(value as PlaybackSpeed) ? (value as PlaybackSpeed) : 1
}
