import type { EventSink, RecordedRun } from '../contracts.ts'
import type { GroupKnapsackResult, KnapsackGroup } from './index.ts'

export type GroupTrace = 'table' | 'rolling-correct' | 'rolling-wrong'

export interface GroupTableCellEvent {
  type: 'table-cell'
  groupIndex: number
  capacity: number
  items: KnapsackGroup
  skip: number
  bestTake: number | null
  takeIndex: number
  best: number
  takeWins: boolean
}

export interface GroupRollingCellEvent {
  type: 'rolling-cell'
  groupIndex: number
  capacity: number
  items: KnapsackGroup
  before: number
  best: number
  takeIndex: number
  takeFrom: number
}

export interface GroupWrongCellEvent {
  type: 'wrong-cell'
  groupIndex: number
  itemIndex: number
  capacity: number
  items: KnapsackGroup
  before: number
  candidate: number
  after: number
  changed: boolean
  stacked: boolean
}

export type GroupKnapsackEvent = GroupTableCellEvent | GroupRollingCellEvent | GroupWrongCellEvent

function validate(groups: readonly KnapsackGroup[], capacity: number) {
  if (!Number.isInteger(capacity) || capacity < 0) throw new RangeError('capacity must be a non-negative integer')
  for (const group of groups) {
    for (const item of group) {
      if (!Number.isInteger(item.w) || item.w <= 0) throw new RangeError('item weight must be a positive integer')
      if (!Number.isFinite(item.v)) throw new RangeError('item value must be finite')
    }
  }
}

function runTable(
  groups: readonly KnapsackGroup[],
  capacity: number,
  emit: EventSink<GroupKnapsackEvent>,
): GroupKnapsackResult {
  const table = Array.from({ length: groups.length + 1 }, () => Array<number>(capacity + 1).fill(0))
  for (let groupIndex = 1; groupIndex <= groups.length; groupIndex++) {
    const items = groups[groupIndex - 1]
    for (let currentCapacity = 0; currentCapacity <= capacity; currentCapacity++) {
      const skip = table[groupIndex - 1][currentCapacity]
      let bestTake: number | null = null
      let takeIndex = -1
      for (let index = 0; index < items.length; index++) {
        const item = items[index]
        if (currentCapacity < item.w) continue
        const candidate = table[groupIndex - 1][currentCapacity - item.w] + item.v
        if (bestTake === null || candidate > bestTake) {
          bestTake = candidate
          takeIndex = index
        }
      }
      const best = bestTake !== null && bestTake > skip ? bestTake : skip
      const takeWins = bestTake !== null && bestTake > skip
      table[groupIndex][currentCapacity] = best
      emit({
        type: 'table-cell', groupIndex, capacity: currentCapacity, items,
        skip, bestTake, takeIndex, best, takeWins,
      })
    }
  }
  return { value: table[groups.length][capacity], table }
}

function runRollingCorrect(
  groups: readonly KnapsackGroup[],
  capacity: number,
  emit: EventSink<GroupKnapsackEvent>,
): GroupKnapsackResult {
  const values = Array<number>(capacity + 1).fill(0)
  for (let groupIndex = 1; groupIndex <= groups.length; groupIndex++) {
    const items = groups[groupIndex - 1]
    for (let currentCapacity = capacity; currentCapacity >= 0; currentCapacity--) {
      const before = values[currentCapacity]
      let best = before
      let takeIndex = -1
      let takeFrom = 0
      for (let index = 0; index < items.length; index++) {
        const item = items[index]
        if (currentCapacity < item.w) continue
        const candidate = values[currentCapacity - item.w] + item.v
        if (candidate > best) {
          best = candidate
          takeIndex = index
          takeFrom = currentCapacity - item.w
        }
      }
      values[currentCapacity] = best
      emit({
        type: 'rolling-cell', groupIndex, capacity: currentCapacity, items,
        before, best, takeIndex, takeFrom,
      })
    }
  }
  return { value: values[capacity], table: [values] }
}

function runRollingWrong(
  groups: readonly KnapsackGroup[],
  capacity: number,
  emit: EventSink<GroupKnapsackEvent>,
): GroupKnapsackResult {
  const values = Array<number>(capacity + 1).fill(0)
  for (let groupIndex = 1; groupIndex <= groups.length; groupIndex++) {
    const items = groups[groupIndex - 1]
    const dirtyInGroup = new Set<number>()
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex]
      for (let currentCapacity = capacity; currentCapacity >= item.w; currentCapacity--) {
        const before = values[currentCapacity]
        const candidate = values[currentCapacity - item.w] + item.v
        const changed = candidate > before
        const stacked = changed && dirtyInGroup.has(currentCapacity - item.w)
        if (changed) values[currentCapacity] = candidate
        emit({
          type: 'wrong-cell', groupIndex, itemIndex, capacity: currentCapacity, items,
          before, candidate, after: values[currentCapacity], changed, stacked,
        })
        if (changed) dirtyInGroup.add(currentCapacity)
      }
    }
  }
  return { value: values[capacity], table: [values] }
}

export function executeGroupKnapsack(
  groups: readonly KnapsackGroup[],
  capacity: number,
  emit: EventSink<GroupKnapsackEvent>,
  trace: GroupTrace = 'table',
): GroupKnapsackResult {
  validate(groups, capacity)
  if (trace === 'rolling-correct') return runRollingCorrect(groups, capacity, emit)
  if (trace === 'rolling-wrong') return runRollingWrong(groups, capacity, emit)
  return runTable(groups, capacity, emit)
}

export function recordGroupKnapsack(
  groups: readonly KnapsackGroup[],
  capacity: number,
  trace: GroupTrace = 'table',
): RecordedRun<GroupKnapsackResult, GroupKnapsackEvent> {
  const events: GroupKnapsackEvent[] = []
  const result = executeGroupKnapsack(groups, capacity, (event) => events.push(event), trace)
  return { result, events }
}
