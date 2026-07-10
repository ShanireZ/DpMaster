import { ignoreEvents } from '../contracts.ts'
import { executeMaxSquare } from './internal.ts'

export interface SquareCorner {
  row: number
  column: number
}

export interface MaxSquareResult {
  side: number
  area: number
  table: number[][]
  bottomRight: SquareCorner | null
}

export function solveMaxSquare(grid: readonly (readonly number[])[]): MaxSquareResult {
  return executeMaxSquare(grid, ignoreEvents)
}
