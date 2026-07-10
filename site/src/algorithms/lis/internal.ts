import type { EventSink, RecordedRun } from '../contracts.ts'
import type { LisResult } from './index.ts'

export type LisEvent =
  | { type: 'initialized'; index: number }
  | {
      type: 'compared'
      index: number
      previousIndex: number
      canExtend: boolean
      candidate: number
      before: number
      after: number
      chosen: boolean
    }
  | { type: 'settled'; index: number; predecessor: number }

export function executeLis(values: readonly number[], emit: EventSink<LisEvent>): LisResult {
  for (const value of values) if (!Number.isFinite(value)) throw new RangeError('LIS values must be finite')

  const lengths = Array<number>(values.length).fill(1)
  const previous = Array<number>(values.length).fill(-1)

  for (let index = 0; index < values.length; index++) {
    emit({ type: 'initialized', index })
    for (let previousIndex = 0; previousIndex < index; previousIndex++) {
      const canExtend = values[previousIndex] < values[index]
      const candidate = lengths[previousIndex] + 1
      const before = lengths[index]
      const chosen = canExtend && candidate > before
      if (chosen) {
        lengths[index] = candidate
        previous[index] = previousIndex
      }
      emit({
        type: 'compared',
        index,
        previousIndex,
        canExtend,
        candidate,
        before,
        after: lengths[index],
        chosen,
      })
    }
    emit({ type: 'settled', index, predecessor: previous[index] })
  }

  let endIndex: number | null = null
  for (let index = 0; index < values.length; index++) {
    if (endIndex === null || lengths[index] > lengths[endIndex]) endIndex = index
  }

  const indices: number[] = []
  for (let index = endIndex; index !== null && index >= 0; index = previous[index]) indices.push(index)
  indices.reverse()
  const pick = Array<boolean>(values.length).fill(false)
  for (const index of indices) pick[index] = true

  return {
    length: endIndex === null ? 0 : lengths[endIndex],
    pick,
    indices,
    lengths,
    previous,
    endIndex,
  }
}

export function recordLis(values: readonly number[]): RecordedRun<LisResult, LisEvent> {
  const events: LisEvent[] = []
  const result = executeLis(values, (event) => events.push(event))
  return { result, events }
}

