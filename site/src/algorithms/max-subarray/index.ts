import { ignoreEvents } from '../contracts.ts'
import { executeSubarray } from './internal.ts'

export interface SubarrayResult {
  sum: number
  start: number | null
  end: number | null
  sums: number[]
  starts: number[]
}

export function solveMaxSubarray(values: readonly number[]): SubarrayResult {
  return executeSubarray(values, 'max', ignoreEvents)
}

export function solveMinSubarray(values: readonly number[]): SubarrayResult {
  return executeSubarray(values, 'min', ignoreEvents)
}
