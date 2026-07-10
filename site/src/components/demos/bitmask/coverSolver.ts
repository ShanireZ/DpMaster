import type { BitmaskCoverChoice } from '../../../algorithms/bitmask-cover/index.ts'
import { recordBitmaskCover } from '../../../algorithms/bitmask-cover/internal.ts'

export type Choice = BitmaskCoverChoice

export interface CoverStep {
  S: number
  choice: number
  nextS: number
  before: number
  cand: number
  took: boolean
  dp: number[]
  full: number
}

export interface CoverResult {
  steps: CoverStep[]
  ans: number
  full: number
  n: number
}

export function solveCover(universe: number, choices: Choice[]): CoverResult {
  const run = recordBitmaskCover(universe, choices)
  const steps = run.events.map((event): CoverStep => ({
    S: event.covered,
    choice: event.choice,
    nextS: event.next,
    before: event.before,
    cand: event.candidate,
    took: event.updated,
    dp: [...event.table],
    full: run.result.full,
  }))
  return { steps, ans: run.result.cost, full: run.result.full, n: run.result.universe }
}

export function toBits(value: number, width: number): number[] {
  return Array.from({ length: width }, (_, index) => (value >> index) & 1)
}
