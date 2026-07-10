import type { EventSink, RecordedRun } from '../contracts.ts'
import type { StoneMergeObjective, StoneMergeResult } from './index.ts'

export interface StoneMergeIntervalEvent {
  type: 'interval'
  length: number
  left: number
  right: number
  sum: number
  candidates: readonly number[]
  bestBase: number
  bestSplit: number
  cost: number
}

export function executeStoneMerge(
  values: readonly number[],
  objective: StoneMergeObjective,
  emit: EventSink<StoneMergeIntervalEvent>,
): StoneMergeResult {
  for (const value of values) if (!Number.isFinite(value)) throw new RangeError('stone values must be finite')

  const size = values.length
  const prefix = Array<number>(size + 1).fill(0)
  for (let index = 0; index < size; index++) prefix[index + 1] = prefix[index] + values[index]
  const rangeSum = (left: number, right: number) => prefix[right + 1] - prefix[left]
  const costs: (number | null)[][] = Array.from({ length: size }, () => Array<number | null>(size).fill(null))
  const splits = Array.from({ length: size }, () => Array<number>(size).fill(-1))
  for (let index = 0; index < size; index++) costs[index][index] = 0

  for (let length = 2; length <= size; length++) {
    for (let left = 0; left + length - 1 < size; left++) {
      const right = left + length - 1
      const candidates: number[] = []
      let bestBase = objective === 'min' ? Infinity : -Infinity
      let bestSplit = left
      for (let split = left; split < right; split++) {
        const candidate = (costs[left][split] as number) + (costs[split + 1][right] as number)
        candidates.push(candidate)
        const better = objective === 'min' ? candidate < bestBase : candidate > bestBase
        if (better) {
          bestBase = candidate
          bestSplit = split
        }
      }
      const sum = rangeSum(left, right)
      const cost = bestBase + sum
      costs[left][right] = cost
      splits[left][right] = bestSplit
      emit({ type: 'interval', length, left, right, sum, candidates, bestBase, bestSplit, cost })
    }
  }

  return {
    cost: size < 2 ? 0 : (costs[0][size - 1] as number),
    objective,
    costs,
    splits,
  }
}

export function recordStoneMerge(
  values: readonly number[],
  objective: StoneMergeObjective = 'min',
): RecordedRun<StoneMergeResult, StoneMergeIntervalEvent> {
  const events: StoneMergeIntervalEvent[] = []
  const result = executeStoneMerge(values, objective, (event) => events.push(event))
  return { result, events }
}

