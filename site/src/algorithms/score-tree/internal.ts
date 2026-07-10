import type { EventSink, RecordedRun } from '../contracts.ts'
import type { ScoreTreeResult } from './index.ts'

export interface ScoreTreeCandidate {
  root: number
  left: number
  right: number
  value: number
}

export interface ScoreTreeEvent {
  type: 'settled'
  left: number
  right: number
  root: number
  value: number
  leftValue: number
  rightValue: number
  candidates: readonly ScoreTreeCandidate[]
}

export function executeScoreTree(
  scores: readonly number[],
  emit: EventSink<ScoreTreeEvent>,
): ScoreTreeResult {
  for (const score of scores) if (!Number.isFinite(score)) throw new RangeError('score-tree values must be finite')
  const n = scores.length
  const dp = Array.from({ length: n }, () => Array<number>(n).fill(0))
  const root = Array.from({ length: n }, () => Array<number>(n).fill(-1))
  const get = (left: number, right: number) => left > right ? 1 : dp[left][right]

  for (let index = 0; index < n; index++) {
    dp[index][index] = scores[index]
    root[index][index] = index
  }
  for (let length = 2; length <= n; length++) {
    for (let left = 0; left + length <= n; left++) {
      const right = left + length - 1
      const candidates: ScoreTreeCandidate[] = []
      let value = Number.NEGATIVE_INFINITY
      let bestRoot = left
      for (let candidateRoot = left; candidateRoot <= right; candidateRoot++) {
        const leftValue = get(left, candidateRoot - 1)
        const rightValue = get(candidateRoot + 1, right)
        const candidate = leftValue * rightValue + scores[candidateRoot]
        candidates.push({ root: candidateRoot, left: leftValue, right: rightValue, value: candidate })
        if (candidate > value) {
          value = candidate
          bestRoot = candidateRoot
        }
      }
      dp[left][right] = value
      root[left][right] = bestRoot
      emit({
        type: 'settled',
        left,
        right,
        root: bestRoot,
        value,
        leftValue: get(left, bestRoot - 1),
        rightValue: get(bestRoot + 1, right),
        candidates,
      })
    }
  }

  const preorder: number[] = []
  const stack: Array<[number, number]> = n === 0 ? [] : [[0, n - 1]]
  while (stack.length > 0) {
    const [left, right] = stack.pop() as [number, number]
    if (left > right) continue
    const node = root[left][right]
    preorder.push(node + 1)
    if (node + 1 <= right) stack.push([node + 1, right])
    if (left <= node - 1) stack.push([left, node - 1])
  }
  return { n, dp, root, ans: n === 0 ? 0 : dp[0][n - 1], preorder }
}

export function recordScoreTree(scores: readonly number[]): RecordedRun<ScoreTreeResult, ScoreTreeEvent> {
  const events: ScoreTreeEvent[] = []
  const result = executeScoreTree(scores, (event) => events.push(event))
  return { result, events }
}
