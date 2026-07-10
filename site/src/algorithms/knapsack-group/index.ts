import { ignoreEvents } from '../contracts.ts'
import { executeGroupKnapsack } from './internal.ts'

export interface GroupItem {
  w: number
  v: number
}

export type KnapsackGroup = readonly GroupItem[]

export interface GroupKnapsackResult {
  value: number
  table: number[][]
}

export function solveGroupKnapsack(
  groups: readonly KnapsackGroup[],
  capacity: number,
): GroupKnapsackResult {
  return executeGroupKnapsack(groups, capacity, ignoreEvents)
}
