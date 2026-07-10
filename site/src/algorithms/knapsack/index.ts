import { executeZeroOneKnapsack } from './internal.ts'
import { ignoreEvents } from '../contracts.ts'

export interface KnapsackItem {
  w: number
  v: number
}

export interface KnapsackResult {
  value: number
  pick: boolean[]
  table: number[][]
}

export function solveZeroOneKnapsack(
  items: readonly KnapsackItem[],
  capacity: number,
): KnapsackResult {
  return executeZeroOneKnapsack(items, capacity, ignoreEvents)
}

