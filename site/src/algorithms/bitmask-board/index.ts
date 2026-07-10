import { ignoreEvents } from '../contracts.ts'
import { executeKingsBoard } from './internal.ts'

export { areCompatibleKingRows, countBits, isLegalKingRow, legalKingRows } from './internal.ts'

export interface KingsBoardResult {
  total: number
  layout: number[] | null
  masks: number[]
  counts: number[]
  table: number[][]
}

export function solveKingsBoard(size: number, kings: number): KingsBoardResult {
  return executeKingsBoard(size, kings, ignoreEvents)
}
