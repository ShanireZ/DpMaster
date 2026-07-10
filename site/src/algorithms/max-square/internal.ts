import type { EventSink, RecordedRun } from '../contracts.ts'
import type { MaxSquareResult } from './index.ts'

export interface MaxSquareEvent {
  type: 'settled'
  row: number
  column: number
  bit: number
  up: number
  left: number
  diagonal: number
  side: number
  bottleneck: 'up' | 'left' | 'diagonal' | null
  bestSide: number
  bestRow: number
  bestColumn: number
}

function validateGrid(grid: readonly (readonly number[])[]): void {
  if (grid.length === 0 || grid[0].length === 0) throw new RangeError('maximum-square grid must be non-empty')
  const columns = grid[0].length
  for (const row of grid) {
    if (row.length !== columns) throw new RangeError('maximum-square grid must be rectangular')
    for (const value of row) if (value !== 0 && value !== 1) throw new RangeError('maximum-square values must be 0 or 1')
  }
}

export function executeMaxSquare(
  grid: readonly (readonly number[])[],
  emit: EventSink<MaxSquareEvent>,
): MaxSquareResult {
  validateGrid(grid)
  const table = Array.from({ length: grid.length }, () => Array<number>(grid[0].length).fill(0))
  let bestSide = 0
  let bestRow = -1
  let bestColumn = -1
  for (let row = 0; row < grid.length; row++) {
    for (let column = 0; column < grid[0].length; column++) {
      const bit = grid[row][column]
      const up = row > 0 ? table[row - 1][column] : 0
      const left = column > 0 ? table[row][column - 1] : 0
      const diagonal = row > 0 && column > 0 ? table[row - 1][column - 1] : 0
      let bottleneck: MaxSquareEvent['bottleneck'] = null
      if (bit === 1 && row > 0 && column > 0) {
        const shortest = Math.min(up, left, diagonal)
        table[row][column] = shortest + 1
        bottleneck = up === shortest ? 'up' : left === shortest ? 'left' : 'diagonal'
      } else {
        table[row][column] = bit
      }
      if (table[row][column] > bestSide) {
        bestSide = table[row][column]
        bestRow = row
        bestColumn = column
      }
      emit({
        type: 'settled',
        row,
        column,
        bit,
        up,
        left,
        diagonal,
        side: table[row][column],
        bottleneck,
        bestSide,
        bestRow,
        bestColumn,
      })
    }
  }
  return {
    side: bestSide,
    area: bestSide * bestSide,
    table,
    bottomRight: bestRow < 0 ? null : { row: bestRow, column: bestColumn },
  }
}

export function recordMaxSquare(
  grid: readonly (readonly number[])[],
): RecordedRun<MaxSquareResult, MaxSquareEvent> {
  const events: MaxSquareEvent[] = []
  const result = executeMaxSquare(grid, (event) => events.push(event))
  return { result, events }
}
