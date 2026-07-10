import type { EventSink, RecordedRun } from '../contracts.ts'
import type { LcsPathCell, LcsResult } from './index.ts'

export interface LcsEvent {
  type: 'settled'
  row: number
  column: number
  equal: boolean
  diagonal: number
  up: number
  left: number
  length: number
  choice: 'diagonal' | 'up' | 'left'
}

export function executeLcs(first: string, second: string, emit: EventSink<LcsEvent>): LcsResult {
  const table = Array.from({ length: first.length + 1 }, () => Array<number>(second.length + 1).fill(0))

  for (let row = 1; row <= first.length; row++) {
    for (let column = 1; column <= second.length; column++) {
      const equal = first[row - 1] === second[column - 1]
      const diagonal = table[row - 1][column - 1]
      const up = table[row - 1][column]
      const left = table[row][column - 1]
      const length = equal ? diagonal + 1 : Math.max(up, left)
      const choice = equal ? 'diagonal' : up >= left ? 'up' : 'left'
      table[row][column] = length
      emit({ type: 'settled', row, column, equal, diagonal, up, left, length, choice })
    }
  }

  const path: LcsPathCell[] = []
  const picked: string[] = []
  let row = first.length
  let column = second.length
  while (row > 0 && column > 0) {
    const matched = first[row - 1] === second[column - 1]
    path.push({ row, column, matched })
    if (matched) {
      picked.push(first[row - 1])
      row--
      column--
    } else if (table[row - 1][column] >= table[row][column - 1]) {
      row--
    } else {
      column--
    }
  }

  return {
    length: table[first.length][second.length],
    subsequence: picked.reverse().join(''),
    table,
    path,
  }
}

export function recordLcs(first: string, second: string): RecordedRun<LcsResult, LcsEvent> {
  const events: LcsEvent[] = []
  const result = executeLcs(first, second, (event) => events.push(event))
  return { result, events }
}
