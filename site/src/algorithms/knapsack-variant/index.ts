import { ignoreEvents } from '../contracts.ts'
import { executeCountKnapsack } from './internal.ts'

export interface CountKnapsackItem {
  w: number
}

export interface CountKnapsackResult {
  count: number
  counts: number[]
  victimIndex: number | null
  withoutVictim: number[] | null
}

export function solveCountKnapsack(
  items: readonly CountKnapsackItem[],
  capacity: number,
): CountKnapsackResult {
  return executeCountKnapsack(items, capacity, ignoreEvents)
}
