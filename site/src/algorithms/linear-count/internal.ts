import type { EventSink, RecordedRun } from '../contracts.ts'
import type { IntegerPartitionResult, StairCountResult } from './index.ts'

export type StairCountEvent =
  | { type: 'initialized'; step: number; count: number }
  | { type: 'settled'; step: number; fromOne: number; fromTwo: number; count: number }

export interface IntegerPartitionEvent {
  type: 'settled'
  total: number
  maximum: number
  withoutMaximum: number
  withMaximum: number
  canUseMaximum: boolean
  count: number
}

function requireNonNegativeInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value < 0) throw new RangeError(`${label} must be a non-negative integer`)
}

export function executeStairCount(step: number, emit: EventSink<StairCountEvent>): StairCountResult {
  requireNonNegativeInteger(step, 'step')
  const counts = Array<number>(step + 1).fill(0)
  counts[0] = 1
  emit({ type: 'initialized', step: 0, count: 1 })
  if (step >= 1) {
    counts[1] = 1
    emit({ type: 'initialized', step: 1, count: 1 })
  }
  for (let current = 2; current <= step; current++) {
    const fromOne = counts[current - 1]
    const fromTwo = counts[current - 2]
    counts[current] = fromOne + fromTwo
    emit({ type: 'settled', step: current, fromOne, fromTwo, count: counts[current] })
  }
  return { count: counts[step], counts }
}

export function recordStairCount(step: number): RecordedRun<StairCountResult, StairCountEvent> {
  const events: StairCountEvent[] = []
  const result = executeStairCount(step, (event) => events.push(event))
  return { result, events }
}

export function executeIntegerPartition(
  total: number,
  emit: EventSink<IntegerPartitionEvent>,
): IntegerPartitionResult {
  requireNonNegativeInteger(total, 'total')
  const table = Array.from({ length: total + 1 }, () => Array<number>(total + 1).fill(0))
  for (let maximum = 0; maximum <= total; maximum++) table[0][maximum] = 1

  for (let value = 1; value <= total; value++) {
    for (let maximum = 1; maximum <= total; maximum++) {
      const withoutMaximum = table[value][maximum - 1]
      const canUseMaximum = value >= maximum
      const withMaximum = canUseMaximum ? table[value - maximum][maximum] : 0
      table[value][maximum] = withoutMaximum + withMaximum
      emit({
        type: 'settled',
        total: value,
        maximum,
        withoutMaximum,
        withMaximum,
        canUseMaximum,
        count: table[value][maximum],
      })
    }
  }
  return { count: table[total][total], table }
}

export function recordIntegerPartition(
  total: number,
): RecordedRun<IntegerPartitionResult, IntegerPartitionEvent> {
  const events: IntegerPartitionEvent[] = []
  const result = executeIntegerPartition(total, (event) => events.push(event))
  return { result, events }
}
