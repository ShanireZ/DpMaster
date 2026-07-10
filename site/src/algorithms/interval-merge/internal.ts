import type { EventSink, RecordedRun } from '../contracts.ts'
import type { Merge248Result, TakeEndsResult } from './index.ts'

export interface TakeEndsEvent {
  type: 'settled'
  left: number
  right: number
  takeLeft: number
  takeRight: number
  pickedLeft: boolean
  value: number
}

export interface Merge248Attempt {
  split: number
  leftValue: number
  rightValue: number
  matched: boolean
}

export interface Merge248Event {
  type: 'settled'
  left: number
  right: number
  split: number
  value: number
  attempts: readonly Merge248Attempt[]
  bestValue: number
  bestStart: number
  bestEnd: number
}

function validate(values: readonly number[]): void {
  if (values.length === 0) throw new RangeError('interval merge requires at least one value')
  for (const value of values) if (!Number.isFinite(value)) throw new RangeError('interval values must be finite')
}

export function executeTakeEnds(
  values: readonly number[],
  emit: EventSink<TakeEndsEvent>,
): TakeEndsResult {
  validate(values)
  const n = values.length
  const table = Array.from({ length: n }, () => Array<number>(n).fill(0))
  for (let index = 0; index < n; index++) table[index][index] = values[index]
  for (let length = 2; length <= n; length++) {
    for (let left = 0; left + length <= n; left++) {
      const right = left + length - 1
      const takeLeft = values[left] - table[left + 1][right]
      const takeRight = values[right] - table[left][right - 1]
      const pickedLeft = takeLeft >= takeRight
      table[left][right] = pickedLeft ? takeLeft : takeRight
      emit({ type: 'settled', left, right, takeLeft, takeRight, pickedLeft, value: table[left][right] })
    }
  }
  const total = values.reduce((sum, value) => sum + value, 0)
  const difference = table[0][n - 1]
  const first = (total + difference) / 2
  return { difference, total, first, second: total - first, table }
}

export function recordTakeEnds(values: readonly number[]): RecordedRun<TakeEndsResult, TakeEndsEvent> {
  const events: TakeEndsEvent[] = []
  const result = executeTakeEnds(values, (event) => events.push(event))
  return { result, events }
}

export function executeMerge248(
  values: readonly number[],
  emit: EventSink<Merge248Event>,
): Merge248Result {
  validate(values)
  const n = values.length
  const table = Array.from({ length: n }, () => Array<number>(n).fill(0))
  let bestValue = Number.NEGATIVE_INFINITY
  let bestStart = 0
  let bestEnd = 0
  for (let index = 0; index < n; index++) {
    table[index][index] = values[index]
    if (values[index] >= bestValue) {
      bestValue = values[index]
      bestStart = index
      bestEnd = index
    }
  }
  for (let length = 2; length <= n; length++) {
    for (let left = 0; left + length <= n; left++) {
      const right = left + length - 1
      const attempts: Merge248Attempt[] = []
      let value = 0
      let bestSplit = -1
      for (let split = left; split < right; split++) {
        const leftValue = table[left][split]
        const rightValue = table[split + 1][right]
        const matched = leftValue > 0 && leftValue === rightValue
        attempts.push({ split, leftValue, rightValue, matched })
        if (matched && leftValue + 1 > value) {
          value = leftValue + 1
          bestSplit = split
        }
      }
      table[left][right] = value
      if (value > bestValue) {
        bestValue = value
        bestStart = left
        bestEnd = right
      }
      emit({
        type: 'settled',
        left,
        right,
        split: bestSplit,
        value,
        attempts,
        bestValue,
        bestStart,
        bestEnd,
      })
    }
  }
  return { value: bestValue, bestStart, bestEnd, table }
}

export function recordMerge248(values: readonly number[]): RecordedRun<Merge248Result, Merge248Event> {
  const events: Merge248Event[] = []
  const result = executeMerge248(values, (event) => events.push(event))
  return { result, events }
}
