import type { EventSink, RecordedRun } from '../contracts.ts'
import type { KingsBoardResult } from './index.ts'

export interface KingsBoardEvent {
  type: 'transition'
  row: number
  kings: number
  mask: number
  previousMask: number
  addition: number
  value: number
}

export function isLegalKingRow(mask: number): boolean {
  return (mask & (mask << 1)) === 0
}

export function areCompatibleKingRows(mask: number, previous: number): boolean {
  return (mask & previous) === 0 && (mask & (previous << 1)) === 0 && (mask & (previous >> 1)) === 0
}

export function countBits(value: number): number {
  let count = 0
  while (value !== 0) {
    value &= value - 1
    count++
  }
  return count
}

export function legalKingRows(size: number): number[] {
  const rows: number[] = []
  for (let mask = 0; mask < 1 << size; mask++) if (isLegalKingRow(mask)) rows.push(mask)
  return rows
}

function findLayout(size: number, kings: number, masks: readonly number[], counts: readonly number[]): number[] | null {
  const rows: number[] = []
  const visit = (row: number, placed: number): boolean => {
    if (placed === kings) {
      while (rows.length < size) rows.push(0)
      return true
    }
    if (row >= size) return false
    for (let index = 0; index < masks.length; index++) {
      const mask = masks[index]
      const count = counts[index]
      if (placed + count > kings) continue
      if (row > 0 && !areCompatibleKingRows(mask, rows[row - 1])) continue
      rows.push(mask)
      if (visit(row + 1, placed + count)) return true
      rows.pop()
    }
    return false
  }
  return visit(0, 0) ? rows : null
}

export function executeKingsBoard(
  size: number,
  kings: number,
  emit: EventSink<KingsBoardEvent>,
): KingsBoardResult {
  if (!Number.isInteger(size) || size < 1 || size > 10) throw new RangeError('board size must be between 1 and 10')
  if (!Number.isInteger(kings) || kings < 0 || kings > size * size) throw new RangeError('king count is out of range')
  const masks = legalKingRows(size)
  const counts = masks.map(countBits)
  let table = Array.from({ length: kings + 1 }, () => Array<number>(masks.length).fill(0))
  for (let index = 0; index < masks.length; index++) {
    if (counts[index] <= kings) table[counts[index]][index] = 1
  }
  for (let row = 2; row <= size; row++) {
    const next = Array.from({ length: kings + 1 }, () => Array<number>(masks.length).fill(0))
    for (let maskIndex = 0; maskIndex < masks.length; maskIndex++) {
      for (let placed = counts[maskIndex]; placed <= kings; placed++) {
        for (let previousIndex = 0; previousIndex < masks.length; previousIndex++) {
          const addition = table[placed - counts[maskIndex]][previousIndex]
          if (addition === 0 || !areCompatibleKingRows(masks[maskIndex], masks[previousIndex])) continue
          next[placed][maskIndex] += addition
          emit({
            type: 'transition',
            row,
            kings: placed,
            mask: masks[maskIndex],
            previousMask: masks[previousIndex],
            addition,
            value: next[placed][maskIndex],
          })
        }
      }
    }
    table = next
  }
  const total = table[kings].reduce((sum, value) => sum + value, 0)
  return { total, layout: findLayout(size, kings, masks, counts), masks, counts, table }
}

export function recordKingsBoard(size: number, kings: number): RecordedRun<KingsBoardResult, KingsBoardEvent> {
  const events: KingsBoardEvent[] = []
  const result = executeKingsBoard(size, kings, (event) => events.push(event))
  return { result, events }
}
