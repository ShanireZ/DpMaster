import { ignoreEvents } from '../contracts.ts'
import { executeRingInterval } from './internal.ts'

export type RingObjective = 'min' | 'max'

export interface RingIntervalResult {
  objective: RingObjective
  cost: number
  start: number
  windows: number[]
  table: number[][]
  doubled: number[]
}

export function solveRingInterval(
  values: readonly number[],
  objective: RingObjective = 'min',
): RingIntervalResult {
  return executeRingInterval(values, objective, ignoreEvents)
}
