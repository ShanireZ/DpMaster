import type { EventSink, RecordedRun } from '../contracts.ts'
import type { MixedKnapsackItem, MixedKnapsackKind, MixedKnapsackResult } from './index.ts'

export interface MixedUnit {
  itemIndex: number
  kind: MixedKnapsackKind
  w: number
  v: number
  direction: 'reverse' | 'forward'
  tag: string
  count?: number
}

export interface MixedCellEvent {
  type: 'cell'
  unit: Readonly<MixedUnit>
  capacity: number
  before: number
  from: number
  candidate: number
  after: number
  better: boolean
}

function splitMultiple(itemIndex: number, item: MixedKnapsackItem): MixedUnit[] {
  const units: MixedUnit[] = []
  let rest = Math.max(1, item.m ?? 1)
  let size = 1
  while (size < rest) {
    units.push({ itemIndex, kind: 'multiple', w: size * item.w, v: size * item.v, direction: 'reverse', tag: `×${size} 包`, count: size })
    rest -= size
    size <<= 1
  }
  if (rest > 0) units.push({ itemIndex, kind: 'multiple', w: rest * item.w, v: rest * item.v, direction: 'reverse', tag: `×余${rest} 包`, count: rest })
  return units
}

export function buildMixedUnits(items: readonly MixedKnapsackItem[]): MixedUnit[] {
  const units: MixedUnit[] = []
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const item = items[itemIndex]
    if (item.kind === '01') units.push({ itemIndex, kind: '01', w: item.w, v: item.v, direction: 'reverse', tag: '01' })
    else if (item.kind === 'complete') units.push({ itemIndex, kind: 'complete', w: item.w, v: item.v, direction: 'forward', tag: '完全' })
    else units.push(...splitMultiple(itemIndex, item))
  }
  return units
}

export function countMixedUnits(items: readonly MixedKnapsackItem[]): number {
  return buildMixedUnits(items).length
}

export function executeMixedKnapsack(
  items: readonly MixedKnapsackItem[],
  capacity: number,
  emit: EventSink<MixedCellEvent>,
): MixedKnapsackResult {
  const values = Array<number>(capacity + 1).fill(0)
  for (const unit of buildMixedUnits(items)) {
    const start = unit.direction === 'forward' ? unit.w : capacity
    const end = unit.direction === 'forward' ? capacity : unit.w
    const step = unit.direction === 'forward' ? 1 : -1
    for (let currentCapacity = start; step > 0 ? currentCapacity <= end : currentCapacity >= end; currentCapacity += step) {
      const before = values[currentCapacity]
      const from = values[currentCapacity - unit.w]
      const candidate = from + unit.v
      const better = candidate > before
      if (better) values[currentCapacity] = candidate
      emit({
        type: 'cell', unit, capacity: currentCapacity, before, from,
        candidate, after: values[currentCapacity], better,
      })
    }
  }
  return { value: values[capacity], values }
}

export function recordMixedKnapsack(
  items: readonly MixedKnapsackItem[],
  capacity: number,
): RecordedRun<MixedKnapsackResult, MixedCellEvent> {
  const events: MixedCellEvent[] = []
  const result = executeMixedKnapsack(items, capacity, (event) => events.push(event))
  return { result, events }
}
