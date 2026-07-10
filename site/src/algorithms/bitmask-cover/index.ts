import { ignoreEvents } from '../contracts.ts'
import { executeBitmaskCover } from './internal.ts'

export interface BitmaskCoverChoice {
  cover: number
  cost: number
}

export interface BitmaskCoverResult {
  cost: number
  full: number
  universe: number
  table: number[]
}

export function solveBitmaskCover(
  universe: number,
  choices: readonly BitmaskCoverChoice[],
): BitmaskCoverResult {
  return executeBitmaskCover(universe, choices, ignoreEvents)
}
