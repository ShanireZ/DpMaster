import {
  buildRootedTree,
  layoutRootedTree,
  type RootedTree,
  type RootedNodeLayout,
  type RootedTreeLayout,
  type TreeJointWeightResult,
  type TreeKnapsackResult,
} from '../../../algorithms/tree-dp/index.ts'
import {
  recordTreeDominatingSet,
  recordTreeIndependentSet,
  recordTreeJointWeight,
  recordTreeKnapsack,
  recordTreeMaxSubtreeChain,
} from '../../../algorithms/tree-dp/internal.ts'

export type { RootedTree } from '../../../algorithms/tree-dp/index.ts'

export function buildTree(parent: number[], weight: number[]): RootedTree {
  return buildRootedTree(parent, weight)
}

export type NodeLayout = RootedNodeLayout
export type TreeLayout = RootedTreeLayout

export function layoutTree(tree: RootedTree): TreeLayout {
  return layoutRootedTree(tree)
}

export interface IndepStep {
  u: number
  dp0: number
  dp1: number
  settled: number[]
  caption: string
  leaf: boolean
}

export interface IndepResult {
  dp0: number[]
  dp1: number[]
  ans: number
  steps: IndepStep[]
  chosen: Set<number>
}

export function solveIndepSet(tree: RootedTree): IndepResult {
  const run = recordTreeIndependentSet(tree)
  const steps = run.events.map((event): IndepStep => ({
    u: event.node,
    dp0: event.dp0,
    dp1: event.dp1,
    settled: [...event.settled],
    leaf: event.leaf,
    caption: event.leaf
      ? `叶子 <b>${event.node + 1}</b>：不选为 <b>0</b>，选择为点权 <b>${event.dp1}</b>。`
      : `节点 <b>${event.node + 1}</b> 合并孩子：不选得 <b>${event.dp0}</b>，选择得 <b>${event.dp1}</b>。`,
  }))
  return { ...run.result, steps }
}

export interface CoverStep {
  u: number
  d0: number
  d1: number
  d2: number
  settled: number[]
  caption: string
  leaf: boolean
}

export interface CoverResult {
  d0: number[]
  d1: number[]
  d2: number[]
  ans: number
  steps: CoverStep[]
  guards: Set<number>
}

export function solveDominatingSet(tree: RootedTree): CoverResult {
  const run = recordTreeDominatingSet(tree)
  const steps = run.events.map((event): CoverStep => ({
    u: event.node,
    d0: event.d0,
    d1: event.d1,
    d2: event.d2,
    settled: [...event.settled],
    leaf: event.leaf,
    caption: event.leaf
      ? `叶子 <b>${event.node + 1}</b>：放警卫 d0=<b>${event.d0}</b>，靠孩子覆盖不可行，等父亲 d2=<b>0</b>。`
      : `节点 <b>${event.node + 1}</b>：放警卫 d0=<b>${event.d0}</b>，靠孩子 d1=<b>${event.d1}</b>，等父亲 d2=<b>${event.d2}</b>。`,
  }))
  return { ...run.result, steps }
}

export interface ChainStep {
  u: number
  down: number
  best1: number
  best2: number
  through: number
  settled: number[]
  caption: string
}

export interface ChainResult {
  down: number[]
  through: number[]
  ans: number
  diameter: number
  argMax: number
  argThrough: number
  steps: ChainStep[]
}

export function solveMaxSubtreeChain(tree: RootedTree): ChainResult {
  const run = recordTreeMaxSubtreeChain(tree)
  const steps = run.events.map((event): ChainStep => ({
    u: event.node,
    down: event.down,
    best1: event.best1,
    best2: event.best2,
    through: event.through,
    settled: [...event.settled],
    caption: tree.children[event.node].length === 0
      ? `叶子 <b>${event.node + 1}</b>：down=<b>${event.down}</b>，过点链=<b>${event.through}</b>。`
      : `节点 <b>${event.node + 1}</b> 接最大两条正贡献 ${event.best1}、${event.best2}：down=<b>${event.down}</b>，过点链=<b>${event.through}</b>。`,
  }))
  return { ...run.result, steps }
}

export type TreeKnapResult = TreeKnapsackResult

export function solveTreeKnapsack(
  tree: RootedTree,
  parentEdge: number[],
  edgeLimit: number,
): TreeKnapResult {
  return recordTreeKnapsack(tree, parentEdge, edgeLimit).result
}

export type JointResult = TreeJointWeightResult

export function solveJointWeight(tree: RootedTree): JointResult {
  return recordTreeJointWeight(tree).result
}
