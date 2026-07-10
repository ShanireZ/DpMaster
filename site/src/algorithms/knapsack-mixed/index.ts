import { ignoreEvents } from '../contracts.ts'
import { executeMixedKnapsack } from './internal.ts'

export type MixedKnapsackKind = '01' | 'complete' | 'multiple'

export interface MixedKnapsackItem {
  kind: MixedKnapsackKind
  w: number
  v: number
  m?: number
}

export interface MixedKnapsackResult {
  value: number
  values: number[]
}

export function solveMixedKnapsack(
  items: readonly MixedKnapsackItem[],
  capacity: number,
): MixedKnapsackResult {
  return executeMixedKnapsack(items, capacity, ignoreEvents)
}
