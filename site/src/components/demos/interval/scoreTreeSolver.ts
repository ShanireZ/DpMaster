import type { Arrow, CellState, Frame, VizModel } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { solveScoreTree, type ScoreTreeResult } from '../../../algorithms/score-tree/index.ts'
import { recordScoreTree } from '../../../algorithms/score-tree/internal.ts'

export type { ScoreTreeResult } from '../../../algorithms/score-tree/index.ts'

export function buildScoreTree(scores: number[]): ScoreTreeResult {
  return solveScoreTree(scores)
}

function settled(table: (number | null)[][]): Record<string, CellState> {
  const states: Record<string, CellState> = {}
  for (let row = 0; row < table.length; row++) {
    for (let column = row; column < table.length; column++) {
      if (table[row][column] !== null) states[key(row, column)] = 'settled'
    }
  }
  return states
}

export function scoreTree(scores: number[]): VizModel {
  const run = recordScoreTree(scores)
  const n = scores.length
  const table = Array.from({ length: n }, () => Array<number | null>(n).fill(null))
  for (let index = 0; index < n; index++) table[index][index] = scores[index]
  const snapshot = () => table.map((row) => row.slice())
  const frames: Frame[] = [{
    values: snapshot(),
    states: settled(table),
    caption: '<b>对角线（区间长度 1）</b>：单个节点自成一棵子树，dp[i][i]=score[i]；空子树加分约定为 1。',
    formula: 'dp[i][i]=\\mathrm{score}[i]',
  }]

  for (const event of run.events) {
    table[event.left][event.right] = event.value
    const states = settled(table)
    const arrows: Arrow[] = []
    if (event.root > event.left) {
      states[key(event.left, event.root - 1)] = 'chosen'
      arrows.push({ from: { r: event.left, c: event.root - 1 }, to: { r: event.left, c: event.right }, kind: 'chosen' })
    }
    if (event.root < event.right) {
      states[key(event.root + 1, event.right)] = 'chosen'
      arrows.push({ from: { r: event.root + 1, c: event.right }, to: { r: event.left, c: event.right }, kind: 'chosen' })
    }
    states[key(event.left, event.right)] = 'current'
    const candidates = event.candidates.map((candidate) =>
      `${candidate.root === event.root ? '★' : ''}根${candidate.root + 1}:${candidate.left}×${candidate.right}+${scores[candidate.root]}=${candidate.value}`)
    frames.push({
      values: snapshot(),
      states,
      arrows,
      active: { r: event.left, c: event.right },
      caption: `区间 <b>[${event.left + 1},${event.right + 1}]</b> 枚举根：{${candidates.join('，')}}，取最大 <b>${event.value}</b>（根为节点 ${event.root + 1}）。`,
      formula: `dp[${event.left + 1}][${event.right + 1}]=${event.leftValue}\\times${event.rightValue}+${scores[event.root]}=${event.value}`,
    })
  }
  const finalStates = settled(table)
  if (n > 0) finalStates[key(0, n - 1)] = 'chosen'
  frames.push({
    values: snapshot(),
    states: finalStates,
    caption: `答案在<b>右上角 dp[1][${n}] = ${run.result.ans}</b>；顺着 root 表即可前序还原最优二叉树。`,
    formula: `dp[1][${n}]=${run.result.ans}`,
  })
  return {
    rows: n,
    cols: n,
    cell: 44,
    rowHeaderLabels: Array.from({ length: n }, (_, index) => `i=${index + 1}`),
    colHeaderLabels: Array.from({ length: n }, (_, index) => `j=${index + 1}`),
    frames,
  }
}

export interface TreeNode {
  id: number
  score: number
  lo: number
  hi: number
  subScore: number
  depth: number
  left: TreeNode | null
  right: TreeNode | null
  x: number
  y: number
}

export function layoutScoreTree(result: ScoreTreeResult): { nodes: TreeNode[]; maxDepth: number } {
  const nodes: TreeNode[] = []
  let maxDepth = 0
  const build = (left: number, right: number, depth: number): TreeNode | null => {
    if (left > right) return null
    const root = result.root[left][right]
    maxDepth = Math.max(maxDepth, depth)
    const node: TreeNode = {
      id: root + 1,
      score: result.dp[root][root],
      lo: left + 1,
      hi: right + 1,
      subScore: result.dp[left][right],
      depth,
      left: null,
      right: null,
      x: (root + 0.5) / result.n,
      y: depth,
    }
    node.left = build(left, root - 1, depth + 1)
    node.right = build(root + 1, right, depth + 1)
    nodes.push(node)
    return node
  }
  if (result.n > 0) build(0, result.n - 1, 0)
  return { nodes, maxDepth }
}
