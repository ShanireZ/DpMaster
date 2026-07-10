export type RandomSource = () => number

const UINT32_RANGE = 0x1_0000_0000

export const browserRandom: RandomSource = () => {
  if (globalThis.crypto && typeof globalThis.crypto.getRandomValues === 'function') {
    const value = new Uint32Array(1)
    globalThis.crypto.getRandomValues(value)
    return value[0] / UINT32_RANGE
  }
  return Math.random()
}

/** Mulberry32：只用于可复现的教学局面，不用于密码学。 */
export function createSeededRandom(seed: number): RandomSource {
  let state = Number.isFinite(seed) ? Math.trunc(seed) >>> 0 : 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / UINT32_RANGE
  }
}

export function randomInt(random: RandomSource, min: number, maxInclusive: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(maxInclusive) || min > maxInclusive) {
    throw new RangeError('randomInt bounds must be ordered integers')
  }
  const value = random()
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('RandomSource must return a value inside [0, 1)')
  }
  return min + Math.floor(value * (maxInclusive - min + 1))
}
