import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createSeededRandom,
  randomInt,
} from '../src/components/games/runtime/random.ts'
import { recordRound, startRound } from '../src/components/games/runtime/round.ts'

test('seeded random sources repeat exactly and stay inside [0, 1)', () => {
  const first = createSeededRandom(20260710)
  const second = createSeededRandom(20260710)
  const sequence = Array.from({ length: 20 }, () => first())
  assert.deepEqual(sequence, Array.from({ length: 20 }, () => second()))
  assert.ok(sequence.every((value) => value >= 0 && value < 1))
  assert.ok(new Set(sequence).size > 1)
})

test('randomInt includes both integer boundaries', () => {
  assert.equal(randomInt(() => 0, 3, 8), 3)
  assert.equal(randomInt(() => 0.999999999999, 3, 8), 8)
  assert.equal(randomInt(createSeededRandom(7), 5, 5), 5)
})

test('randomInt rejects inverted or non-integer boundaries', () => {
  assert.throws(() => randomInt(() => 0.5, 4, 3), RangeError)
  assert.throws(() => randomInt(() => 0.5, 1.2, 3), RangeError)
  assert.throws(() => randomInt(() => 0.5, 1, Number.NaN), RangeError)
})

test('a round is recorded at most once', () => {
  const initial = { played: 0, matched: 0, counted: false }
  const recorded = recordRound(initial, true)
  assert.deepEqual(recorded, { played: 1, matched: 1, counted: true })
  assert.equal(recordRound(recorded, false), recorded)
})

test('starting a round preserves totals and clears the counted guard', () => {
  const started = startRound({ played: 4, matched: 2, counted: true })
  assert.deepEqual(started, { played: 4, matched: 2, counted: false })
  assert.deepEqual(recordRound(started, false), { played: 5, matched: 2, counted: true })
})
