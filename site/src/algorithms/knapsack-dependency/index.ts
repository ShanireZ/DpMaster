import { ignoreEvents } from '../contracts.ts'
import { executeDependencyKnapsack } from './internal.ts'

export interface DependencyMaster {
  w: number
  v: number
}

export interface DependencyAccessory {
  w: number
  v: number
}

export interface DependencyCombo {
  w: number
  v: number
  picks: boolean[]
  label: string
}

export interface DependencyKnapsackResult {
  value: number
  table: number[][]
  combos: DependencyCombo[]
  bestCombo: DependencyCombo | null
}

export function solveDependencyKnapsack(
  master: Readonly<DependencyMaster>,
  accessories: readonly DependencyAccessory[],
  capacity: number,
): DependencyKnapsackResult {
  return executeDependencyKnapsack(master, accessories, capacity, ignoreEvents)
}
