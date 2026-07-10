import { ignoreEvents } from '../contracts.ts'
import { executeStoneMerge } from './internal.ts'

export type StoneMergeObjective = 'min' | 'max'

export interface StoneMergeResult {
  cost: number
  objective: StoneMergeObjective
  costs: (number | null)[][]
  splits: number[][]
}

export function solveStoneMerge(
  values: readonly number[],
  objective: StoneMergeObjective = 'min',
): StoneMergeResult {
  return executeStoneMerge(values, objective, ignoreEvents)
}

