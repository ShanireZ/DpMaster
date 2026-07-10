import type { EventSink, RecordedRun } from '../contracts.ts'
import type { SubarrayResult } from './index.ts'

export type SubarrayObjective = 'max' | 'min'

export interface SubarrayEvent {
  type: 'settled'
  objective: SubarrayObjective
  index: number
  value: number
  continuation: number
  fresh: number
  sum: number
  continued: boolean
  segmentStart: number
  best: number
  bestStart: number
  bestEnd: number
}

export function executeSubarray(
  values: readonly number[],
  objective: SubarrayObjective,
  emit: EventSink<SubarrayEvent>,
): SubarrayResult {
  for (const value of values) if (!Number.isFinite(value)) throw new RangeError('subarray values must be finite')
  if (values.length === 0) return { sum: 0, start: null, end: null, sums: [], starts: [] }

  const sums = Array<number>(values.length)
  const starts = Array<number>(values.length)
  let best = objective === 'max' ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY
  let bestStart = 0
  let bestEnd = 0

  for (let index = 0; index < values.length; index++) {
    const fresh = values[index]
    const continuation = index === 0 ? fresh : sums[index - 1] + fresh
    const continued = index > 0 && (objective === 'max' ? continuation >= fresh : continuation <= fresh)
    sums[index] = continued ? continuation : fresh
    starts[index] = continued ? starts[index - 1] : index
    const improves = objective === 'max' ? sums[index] > best : sums[index] < best
    if (improves) {
      best = sums[index]
      bestStart = starts[index]
      bestEnd = index
    }
    emit({
      type: 'settled',
      objective,
      index,
      value: fresh,
      continuation,
      fresh,
      sum: sums[index],
      continued,
      segmentStart: starts[index],
      best,
      bestStart,
      bestEnd,
    })
  }

  return { sum: best, start: bestStart, end: bestEnd, sums, starts }
}

export function recordSubarray(
  values: readonly number[],
  objective: SubarrayObjective,
): RecordedRun<SubarrayResult, SubarrayEvent> {
  const events: SubarrayEvent[] = []
  const result = executeSubarray(values, objective, (event) => events.push(event))
  return { result, events }
}
