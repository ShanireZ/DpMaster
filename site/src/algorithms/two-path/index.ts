import { ignoreEvents } from '../contracts.ts'
import { executeTwoPath } from './internal.ts'

export interface TwoPathResult {
  value: number
  table: number[][]
}

export function solveTwoPath(grid: readonly (readonly number[])[]): TwoPathResult {
  return executeTwoPath(grid, ignoreEvents)
}
