import type { EventSink, RecordedRun } from '../contracts.ts'
import type { EditDistanceResult } from './index.ts'

export interface EditDistanceEvent {
  type: 'settled'
  row: number
  column: number
  same: boolean
  deleteCost: number
  insertCost: number
  substituteCost: number
  distance: number
  choice: 'diagonal' | 'delete' | 'insert'
}

export function executeEditDistance(
  source: string,
  target: string,
  emit: EventSink<EditDistanceEvent>,
): EditDistanceResult {
  const table = Array.from({ length: source.length + 1 }, () => Array<number>(target.length + 1).fill(0))
  for (let row = 0; row <= source.length; row++) table[row][0] = row
  for (let column = 0; column <= target.length; column++) table[0][column] = column

  for (let row = 1; row <= source.length; row++) {
    for (let column = 1; column <= target.length; column++) {
      const same = source[row - 1] === target[column - 1]
      const deleteCost = table[row - 1][column] + 1
      const insertCost = table[row][column - 1] + 1
      const substituteCost = table[row - 1][column - 1] + (same ? 0 : 1)
      const distance = Math.min(deleteCost, insertCost, substituteCost)
      const choice = substituteCost === distance ? 'diagonal' : deleteCost === distance ? 'delete' : 'insert'
      table[row][column] = distance
      emit({
        type: 'settled',
        row,
        column,
        same,
        deleteCost,
        insertCost,
        substituteCost,
        distance,
        choice,
      })
    }
  }
  return { distance: table[source.length][target.length], table }
}

export function recordEditDistance(
  source: string,
  target: string,
): RecordedRun<EditDistanceResult, EditDistanceEvent> {
  const events: EditDistanceEvent[] = []
  const result = executeEditDistance(source, target, (event) => events.push(event))
  return { result, events }
}
