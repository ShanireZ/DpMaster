import { ignoreEvents } from '../contracts.ts'
import { executeLis } from './internal.ts'

export interface LisResult {
  length: number
  pick: boolean[]
  indices: number[]
  lengths: number[]
  previous: number[]
  endIndex: number | null
}

export function solveLis(values: readonly number[]): LisResult {
  return executeLis(values, ignoreEvents)
}

