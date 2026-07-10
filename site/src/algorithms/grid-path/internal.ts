import type { EventSink, RecordedRun } from '../contracts.ts'
import type { GridPathCountResult, TrianglePathResult } from './index.ts'

export type TrianglePathEvent =
  | { type: 'initialized'; row: number; column: number; value: number }
  | {
      type: 'settled'
      row: number
      column: number
      cell: number
      down: number
      downRight: number
      value: number
      rightWins: boolean
    }

export interface GridPathCountEvent {
  type: 'settled'
  row: number
  column: number
  blocked: boolean
  start: boolean
  up: number
  left: number
  count: number
}

function validateTriangle(triangle: readonly (readonly number[])[]): void {
  if (triangle.length === 0) throw new RangeError('triangle must be non-empty')
  for (let row = 0; row < triangle.length; row++) {
    if (triangle[row].length !== row + 1) throw new RangeError('triangle rows must have row + 1 values')
    for (const value of triangle[row]) if (!Number.isFinite(value)) throw new RangeError('triangle values must be finite')
  }
}

export function executeTrianglePath(
  triangle: readonly (readonly number[])[],
  emit: EventSink<TrianglePathEvent>,
): TrianglePathResult {
  validateTriangle(triangle)
  const size = triangle.length
  const table = triangle.map((row) => Array<number>(row.length).fill(0))
  for (let column = 0; column < size; column++) {
    table[size - 1][column] = triangle[size - 1][column]
    emit({ type: 'initialized', row: size - 1, column, value: table[size - 1][column] })
  }
  for (let row = size - 2; row >= 0; row--) {
    for (let column = 0; column <= row; column++) {
      const down = table[row + 1][column]
      const downRight = table[row + 1][column + 1]
      const rightWins = downRight > down
      table[row][column] = triangle[row][column] + Math.max(down, downRight)
      emit({
        type: 'settled',
        row,
        column,
        cell: triangle[row][column],
        down,
        downRight,
        value: table[row][column],
        rightWins,
      })
    }
  }
  return { value: table[0][0], table }
}

export function recordTrianglePath(
  triangle: readonly (readonly number[])[],
): RecordedRun<TrianglePathResult, TrianglePathEvent> {
  const events: TrianglePathEvent[] = []
  const result = executeTrianglePath(triangle, (event) => events.push(event))
  return { result, events }
}

export function executeGridPathCount(
  rows: number,
  columns: number,
  blocked: ReadonlySet<string>,
  emit: EventSink<GridPathCountEvent>,
): GridPathCountResult {
  if (!Number.isInteger(rows) || rows <= 0 || !Number.isInteger(columns) || columns <= 0) {
    throw new RangeError('grid dimensions must be positive integers')
  }
  const table = Array.from({ length: rows }, () => Array<number>(columns).fill(0))
  const valueAt = (row: number, column: number): number => row < 1 || column < 1 ? 0 : table[row - 1][column - 1]

  for (let row = 1; row <= rows; row++) {
    for (let column = 1; column <= columns; column++) {
      const isBlocked = blocked.has(`${row},${column}`)
      const start = row === 1 && column === 1
      const up = valueAt(row - 1, column)
      const left = valueAt(row, column - 1)
      const count = isBlocked ? 0 : start ? 1 : up + left
      table[row - 1][column - 1] = count
      emit({ type: 'settled', row, column, blocked: isBlocked, start, up, left, count })
    }
  }
  return { count: table[rows - 1][columns - 1], table }
}

export function recordGridPathCount(
  rows: number,
  columns: number,
  blocked: ReadonlySet<string>,
): RecordedRun<GridPathCountResult, GridPathCountEvent> {
  const events: GridPathCountEvent[] = []
  const result = executeGridPathCount(rows, columns, blocked, (event) => events.push(event))
  return { result, events }
}
