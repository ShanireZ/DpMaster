import { ignoreEvents } from '../contracts.ts'
import { executeScoreTree } from './internal.ts'

export interface ScoreTreeResult {
  n: number
  dp: number[][]
  root: number[][]
  ans: number
  preorder: number[]
}

export function solveScoreTree(scores: readonly number[]): ScoreTreeResult {
  return executeScoreTree(scores, ignoreEvents)
}
