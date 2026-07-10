import type { EventSink, RecordedRun } from '../contracts.ts'
import type { BitmaskSubsetResult } from './index.ts'

export interface BitmaskSubsetEvent {
  type: 'visited'
  subset: number
  step: number
  previous: number
  first: boolean
}

export function executeBitmaskSubsets(
  source: number,
  emit: EventSink<BitmaskSubsetEvent>,
): BitmaskSubsetResult {
  if (!Number.isInteger(source) || source < 0 || source > 0x3fffffff) {
    throw new RangeError('subset source must be a non-negative 30-bit integer')
  }
  const subsets: number[] = []
  for (let subset = source; subset > 0; subset = (subset - 1) & source) {
    emit({
      type: 'visited',
      subset,
      step: subsets.length + 1,
      previous: subsets.length === 0 ? source : subsets[subsets.length - 1],
      first: subsets.length === 0,
    })
    subsets.push(subset)
  }
  return { source, subsets }
}

export function recordBitmaskSubsets(source: number): RecordedRun<BitmaskSubsetResult, BitmaskSubsetEvent> {
  const events: BitmaskSubsetEvent[] = []
  const result = executeBitmaskSubsets(source, (event) => events.push(event))
  return { result, events }
}
