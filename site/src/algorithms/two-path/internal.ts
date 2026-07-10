import type { EventSink, RecordedRun } from '../contracts.ts'
import type { TwoPathResult } from './index.ts'

export interface TwoPathEvent {
  type: 'settled'
  step: number
  rowOne: number
  columnOne: number
  rowTwo: number
  columnTwo: number
  previousRowOne: number
  previousRowTwo: number
  previousValue: number
  addition: number
  value: number
  sameCell: boolean
}

function validateGrid(grid: readonly (readonly number[])[]): void {
  if (grid.length === 0 || grid[0].length === 0) throw new RangeError('two-path grid must be non-empty')
  const columns = grid[0].length
  for (const row of grid) {
    if (row.length !== columns) throw new RangeError('two-path grid must be rectangular')
    for (const value of row) if (!Number.isFinite(value)) throw new RangeError('two-path values must be finite')
  }
}

export function executeTwoPath(
  grid: readonly (readonly number[])[],
  emit: EventSink<TwoPathEvent>,
): TwoPathResult {
  validateGrid(grid)
  const rows = grid.length
  const columns = grid[0].length
  const lastStep = rows + columns - 2
  let previous = Array.from({ length: rows }, () => Array<number>(rows).fill(Number.NEGATIVE_INFINITY))
  previous[0][0] = grid[0][0]
  emit({
    type: 'settled',
    step: 0,
    rowOne: 0,
    columnOne: 0,
    rowTwo: 0,
    columnTwo: 0,
    previousRowOne: 0,
    previousRowTwo: 0,
    previousValue: 0,
    addition: grid[0][0],
    value: grid[0][0],
    sameCell: true,
  })

  for (let step = 1; step <= lastStep; step++) {
    const current = Array.from({ length: rows }, () => Array<number>(rows).fill(Number.NEGATIVE_INFINITY))
    for (let rowOne = 0; rowOne <= Math.min(step, rows - 1); rowOne++) {
      const columnOne = step - rowOne
      if (columnOne < 0 || columnOne >= columns) continue
      for (let rowTwo = 0; rowTwo <= Math.min(step, rows - 1); rowTwo++) {
        const columnTwo = step - rowTwo
        if (columnTwo < 0 || columnTwo >= columns) continue
        let previousValue = Number.NEGATIVE_INFINITY
        let previousRowOne = -1
        let previousRowTwo = -1
        for (const candidateRowOne of [rowOne - 1, rowOne]) {
          for (const candidateRowTwo of [rowTwo - 1, rowTwo]) {
            if (candidateRowOne < 0 || candidateRowTwo < 0) continue
            const candidate = previous[candidateRowOne][candidateRowTwo]
            if (candidate > previousValue) {
              previousValue = candidate
              previousRowOne = candidateRowOne
              previousRowTwo = candidateRowTwo
            }
          }
        }
        if (!Number.isFinite(previousValue)) continue
        const sameCell = rowOne === rowTwo
        const addition = grid[rowOne][columnOne] + (sameCell ? 0 : grid[rowTwo][columnTwo])
        const value = previousValue + addition
        current[rowOne][rowTwo] = value
        emit({
          type: 'settled',
          step,
          rowOne,
          columnOne,
          rowTwo,
          columnTwo,
          previousRowOne,
          previousRowTwo,
          previousValue,
          addition,
          value,
          sameCell,
        })
      }
    }
    previous = current
  }

  return { value: previous[rows - 1][rows - 1], table: previous }
}

export function recordTwoPath(
  grid: readonly (readonly number[])[],
): RecordedRun<TwoPathResult, TwoPathEvent> {
  const events: TwoPathEvent[] = []
  const result = executeTwoPath(grid, (event) => events.push(event))
  return { result, events }
}
