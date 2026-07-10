import type { EventSink, RecordedRun } from '../contracts.ts'
import type { MultipleKnapsackItem, MultipleKnapsackResult } from './index.ts'

export interface MultiplePack {
  itemIdx: number
  cnt: number
  w: number
  v: number
  label: string
}

export interface MultipleCellEvent {
  type: 'cell'
  pack: Readonly<MultiplePack>
  capacity: number
  before: number
  from: number
  candidate: number
  after: number
  better: boolean
}

export function splitMultipleItems(items: readonly MultipleKnapsackItem[]): MultiplePack[] {
  const packs: MultiplePack[] = []
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const { w, v, m } = items[itemIndex]
    let rest = m
    let size = 1
    while (size < rest) {
      packs.push({ itemIdx: itemIndex, cnt: size, w: size * w, v: size * v, label: `×${size}` })
      rest -= size
      size <<= 1
    }
    if (rest > 0) packs.push({ itemIdx: itemIndex, cnt: rest, w: rest * w, v: rest * v, label: `×余${rest}` })
  }
  return packs
}

export function multiplePackCounts(items: readonly MultipleKnapsackItem[]): { naive: number; binary: number } {
  return { naive: items.reduce((sum, item) => sum + item.m, 0), binary: splitMultipleItems(items).length }
}

export function executeMultipleKnapsack(
  items: readonly MultipleKnapsackItem[],
  capacity: number,
  emit: EventSink<MultipleCellEvent>,
): MultipleKnapsackResult {
  const packs = splitMultipleItems(items)
  const values = Array<number>(capacity + 1).fill(0)
  for (const pack of packs) {
    for (let currentCapacity = capacity; currentCapacity >= pack.w; currentCapacity--) {
      const before = values[currentCapacity]
      const from = values[currentCapacity - pack.w]
      const candidate = from + pack.v
      const better = candidate > before
      if (better) values[currentCapacity] = candidate
      emit({
        type: 'cell', pack, capacity: currentCapacity, before, from,
        candidate, after: values[currentCapacity], better,
      })
    }
  }
  return { value: values[capacity], values }
}

export function recordMultipleKnapsack(
  items: readonly MultipleKnapsackItem[],
  capacity: number,
): RecordedRun<MultipleKnapsackResult, MultipleCellEvent> {
  const events: MultipleCellEvent[] = []
  const result = executeMultipleKnapsack(items, capacity, (event) => events.push(event))
  return { result, events }
}
