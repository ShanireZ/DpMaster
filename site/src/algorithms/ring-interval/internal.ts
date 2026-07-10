import type { EventSink, RecordedRun } from '../contracts.ts'
import type { RingIntervalResult, RingObjective } from './index.ts'

export interface RingIntervalEvent {
  type: 'settled'
  left: number
  right: number
  split: number
  splitValue: number
  sum: number
  value: number
  isWindow: boolean
}

export function executeRingInterval(
  values: readonly number[],
  objective: RingObjective,
  emit: EventSink<RingIntervalEvent>,
): RingIntervalResult {
  if (values.length === 0) throw new RangeError('ring interval requires at least one value')
  for (const value of values) if (!Number.isFinite(value)) throw new RangeError('ring values must be finite')
  const n = values.length
  const doubled = Array.from({ length: n * 2 }, (_, index) => values[index % n])
  const prefix = [0]
  for (const value of doubled) prefix.push(prefix[prefix.length - 1] + value)
  const table = Array.from({ length: n * 2 }, () => Array<number>(n * 2).fill(0))
  const better = objective === 'min'
    ? (candidate: number, current: number) => candidate < current
    : (candidate: number, current: number) => candidate > current

  for (let length = 2; length <= n; length++) {
    for (let left = 0; left + length <= doubled.length; left++) {
      const right = left + length - 1
      const sum = prefix[right + 1] - prefix[left]
      let splitValue = objective === 'min' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
      let bestSplit = left
      for (let split = left; split < right; split++) {
        const candidate = table[left][split] + table[split + 1][right]
        if (better(candidate, splitValue)) {
          splitValue = candidate
          bestSplit = split
        }
      }
      table[left][right] = splitValue + sum
      emit({
        type: 'settled',
        left,
        right,
        split: bestSplit,
        splitValue,
        sum,
        value: table[left][right],
        isWindow: length === n && left < n,
      })
    }
  }

  const windows = Array.from({ length: n }, (_, start) => table[start][start + n - 1])
  let start = 0
  for (let index = 1; index < n; index++) if (better(windows[index], windows[start])) start = index
  return { objective, cost: windows[start], start, windows, table, doubled }
}

export function recordRingInterval(
  values: readonly number[],
  objective: RingObjective = 'min',
): RecordedRun<RingIntervalResult, RingIntervalEvent> {
  const events: RingIntervalEvent[] = []
  const result = executeRingInterval(values, objective, (event) => events.push(event))
  return { result, events }
}
