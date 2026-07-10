import { ignoreEvents } from '../contracts.ts'
import { executeLcs } from './internal.ts'

export interface LcsPathCell {
  row: number
  column: number
  matched: boolean
}

export interface LcsResult {
  length: number
  subsequence: string
  table: number[][]
  path: LcsPathCell[]
}

export function solveLcs(first: string, second: string): LcsResult {
  return executeLcs(first, second, ignoreEvents)
}
