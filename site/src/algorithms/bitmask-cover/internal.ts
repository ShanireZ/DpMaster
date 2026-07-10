import type { EventSink, RecordedRun } from '../contracts.ts'
import type { BitmaskCoverChoice, BitmaskCoverResult } from './index.ts'

const INF = Number.POSITIVE_INFINITY

export interface BitmaskCoverEvent {
  type: 'transition'
  covered: number
  choice: number
  next: number
  before: number
  candidate: number
  updated: boolean
  table: readonly number[]
}

export function executeBitmaskCover(
  universe: number,
  choices: readonly BitmaskCoverChoice[],
  emit: EventSink<BitmaskCoverEvent>,
): BitmaskCoverResult {
  if (!Number.isInteger(universe) || universe < 0 || universe > 20) {
    throw new RangeError('cover universe must be between 0 and 20')
  }
  const full = (1 << universe) - 1
  for (const choice of choices) {
    if (!Number.isInteger(choice.cover) || choice.cover < 0 || (choice.cover | full) !== full) {
      throw new RangeError('cover masks must stay inside the universe')
    }
    if (!Number.isFinite(choice.cost) || choice.cost < 0) throw new RangeError('cover costs must be non-negative')
  }
  const table = Array<number>(full + 1).fill(INF)
  table[0] = 0
  const snapshot = () => table.map((value) => Number.isFinite(value) ? value : -1)
  for (let covered = 0; covered <= full; covered++) {
    if (!Number.isFinite(table[covered])) continue
    for (let choice = 0; choice < choices.length; choice++) {
      const next = covered | choices[choice].cover
      if (next === covered) continue
      const before = table[next]
      const candidate = table[covered] + choices[choice].cost
      const updated = candidate < before
      if (updated) table[next] = candidate
      emit({
        type: 'transition',
        covered,
        choice,
        next,
        before: Number.isFinite(before) ? before : -1,
        candidate,
        updated,
        table: snapshot(),
      })
    }
  }
  return { cost: Number.isFinite(table[full]) ? table[full] : -1, full, universe, table: snapshot() }
}

export function recordBitmaskCover(
  universe: number,
  choices: readonly BitmaskCoverChoice[],
): RecordedRun<BitmaskCoverResult, BitmaskCoverEvent> {
  const events: BitmaskCoverEvent[] = []
  const result = executeBitmaskCover(universe, choices, (event) => events.push(event))
  return { result, events }
}
