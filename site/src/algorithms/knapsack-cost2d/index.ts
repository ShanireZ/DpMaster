import { ignoreEvents } from '../contracts.ts'
import { executeCost2DKnapsack } from './internal.ts'

export interface Cost2DKnapsackItem {
  a: number
  b: number
  v: number
}

export type Cost2DKnapsackMode = 'value' | 'count'

export interface Cost2DKnapsackResult {
  value: number
  table: number[][]
}

export function solveCost2DKnapsack(
  items: readonly Cost2DKnapsackItem[],
  capacityA: number,
  capacityB: number,
  mode: Cost2DKnapsackMode = 'value',
): Cost2DKnapsackResult {
  return executeCost2DKnapsack(items, capacityA, capacityB, mode, ignoreEvents)
}
