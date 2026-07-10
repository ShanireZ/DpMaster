import { ignoreEvents } from '../contracts.ts'
import { executeMerge248, executeTakeEnds } from './internal.ts'

export interface TakeEndsResult {
  difference: number
  total: number
  first: number
  second: number
  table: number[][]
}

export interface Merge248Result {
  value: number
  bestStart: number
  bestEnd: number
  table: number[][]
}

export function solveTakeEnds(values: readonly number[]): TakeEndsResult {
  return executeTakeEnds(values, ignoreEvents)
}

export function solveMerge248(values: readonly number[]): Merge248Result {
  return executeMerge248(values, ignoreEvents)
}
