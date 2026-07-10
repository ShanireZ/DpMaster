import { ignoreEvents } from '../contracts.ts'
import { executeMultipleKnapsack } from './internal.ts'

export interface MultipleKnapsackItem {
  w: number
  v: number
  m: number
}

export interface MultipleKnapsackResult {
  value: number
  values: number[]
}

export function solveMultipleKnapsack(
  items: readonly MultipleKnapsackItem[],
  capacity: number,
): MultipleKnapsackResult {
  return executeMultipleKnapsack(items, capacity, ignoreEvents)
}
