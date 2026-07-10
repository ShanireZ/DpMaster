import assert from 'node:assert/strict'
import test from 'node:test'
import {
  clampPlaybackIndex,
  nextPlaybackIndex,
  normalizePlaybackSpeed,
  previousPlaybackIndex,
} from '../src/components/dp-engine/playback/state.ts'

test('playback index is always a valid non-negative frame', () => {
  assert.equal(clampPlaybackIndex(-4, 0), 0)
  assert.equal(clampPlaybackIndex(8, 0), 0)
  assert.equal(clampPlaybackIndex(-1, 1), 0)
  assert.equal(clampPlaybackIndex(3, 1), 0)
  assert.equal(clampPlaybackIndex(-2, 4), 0)
  assert.equal(clampPlaybackIndex(2, 4), 2)
  assert.equal(clampPlaybackIndex(99, 4), 3)
})

test('previous and next stop at both track boundaries', () => {
  assert.equal(previousPlaybackIndex(0, 0), 0)
  assert.equal(nextPlaybackIndex(0, 0), 0)
  assert.equal(previousPlaybackIndex(0, 1), 0)
  assert.equal(nextPlaybackIndex(0, 1), 0)
  assert.equal(previousPlaybackIndex(2, 4), 1)
  assert.equal(nextPlaybackIndex(2, 4), 3)
  assert.equal(previousPlaybackIndex(0, 4), 0)
  assert.equal(nextPlaybackIndex(3, 4), 3)
})

test('playback speed accepts only the supported teaching speeds', () => {
  assert.equal(normalizePlaybackSpeed(0.5), 0.5)
  assert.equal(normalizePlaybackSpeed(1), 1)
  assert.equal(normalizePlaybackSpeed(2), 2)
  assert.equal(normalizePlaybackSpeed(0), 1)
  assert.equal(normalizePlaybackSpeed(1.5), 1)
  assert.equal(normalizePlaybackSpeed(Number.NaN), 1)
})
