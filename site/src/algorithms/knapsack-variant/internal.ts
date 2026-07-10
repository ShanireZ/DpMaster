import type { EventSink, RecordedRun } from '../contracts.ts'
import type { CountKnapsackItem, CountKnapsackResult } from './index.ts'

export interface CountCellEvent {
  type: 'count-cell'
  itemIndex: number
  weight: number
  capacity: number
  before: number
  add: number
  after: number
}

export interface UndoCellEvent {
  type: 'undo-cell'
  victimIndex: number
  weight: number
  capacity: number
  before: number
  subtract: number
  after: number
}

export type CountKnapsackEvent = CountCellEvent | UndoCellEvent

export function executeCountKnapsack(
  items: readonly CountKnapsackItem[],
  capacity: number,
  emit: EventSink<CountKnapsackEvent>,
  victim?: number,
): CountKnapsackResult {
  const counts = Array<number>(capacity + 1).fill(0)
  counts[0] = 1
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const weight = items[itemIndex].w
    for (let currentCapacity = capacity; currentCapacity >= weight; currentCapacity--) {
      const before = counts[currentCapacity]
      const add = counts[currentCapacity - weight]
      counts[currentCapacity] = before + add
      emit({ type: 'count-cell', itemIndex, weight, capacity: currentCapacity, before, add, after: counts[currentCapacity] })
    }
  }

  if (victim === undefined) {
    return { count: counts[capacity], counts, victimIndex: null, withoutVictim: null }
  }

  const victimIndex = Math.min(Math.max(victim, 0), Math.max(items.length - 1, 0))
  const withoutVictim = counts.slice()
  const weight = items.length > 0 ? items[victimIndex].w : 0
  if (items.length > 0 && weight <= capacity) {
    for (let currentCapacity = weight; currentCapacity <= capacity; currentCapacity++) {
      const before = withoutVictim[currentCapacity]
      const subtract = withoutVictim[currentCapacity - weight]
      withoutVictim[currentCapacity] = before - subtract
      emit({
        type: 'undo-cell', victimIndex, weight, capacity: currentCapacity,
        before, subtract, after: withoutVictim[currentCapacity],
      })
    }
  }
  return { count: counts[capacity], counts, victimIndex, withoutVictim }
}

export function recordCountKnapsack(
  items: readonly CountKnapsackItem[],
  capacity: number,
  victim?: number,
): RecordedRun<CountKnapsackResult, CountKnapsackEvent> {
  const events: CountKnapsackEvent[] = []
  const result = executeCountKnapsack(items, capacity, (event) => events.push(event), victim)
  return { result, events }
}
