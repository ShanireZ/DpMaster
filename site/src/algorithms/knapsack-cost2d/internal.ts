import type { EventSink, RecordedRun } from '../contracts.ts'
import type { Cost2DKnapsackItem, Cost2DKnapsackMode, Cost2DKnapsackResult } from './index.ts'

export interface Cost2DChange {
  x: number
  y: number
  from: number
  to: number
}

export interface Cost2DItemEvent {
  type: 'item'
  itemIndex: number
  item: Readonly<Cost2DKnapsackItem>
  add: number
  changed: readonly Cost2DChange[]
}

export function executeCost2DKnapsack(
  items: readonly Cost2DKnapsackItem[],
  capacityA: number,
  capacityB: number,
  mode: Cost2DKnapsackMode,
  emit: EventSink<Cost2DItemEvent>,
): Cost2DKnapsackResult {
  const table = Array.from({ length: capacityB + 1 }, () => Array<number>(capacityA + 1).fill(0))
  for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
    const item = items[itemIndex]
    const add = mode === 'count' ? 1 : item.v
    const changed: Cost2DChange[] = []
    for (let x = capacityA; x >= item.a; x--) {
      for (let y = capacityB; y >= item.b; y--) {
        const candidate = table[y - item.b][x - item.a] + add
        if (candidate <= table[y][x]) continue
        changed.push({ x, y, from: table[y][x], to: candidate })
        table[y][x] = candidate
      }
    }
    emit({ type: 'item', itemIndex, item, add, changed })
  }
  return { value: table[capacityB][capacityA], table }
}

export function recordCost2DKnapsack(
  items: readonly Cost2DKnapsackItem[],
  capacityA: number,
  capacityB: number,
  mode: Cost2DKnapsackMode = 'value',
): RecordedRun<Cost2DKnapsackResult, Cost2DItemEvent> {
  const events: Cost2DItemEvent[] = []
  const result = executeCost2DKnapsack(items, capacityA, capacityB, mode, (event) => events.push(event))
  return { result, events }
}
