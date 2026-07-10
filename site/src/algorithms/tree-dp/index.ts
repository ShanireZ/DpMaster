import { ignoreEvents } from '../contracts.ts'
import {
  executeTreeDominatingSet,
  executeTreeIndependentSet,
  executeTreeJointWeight,
  executeTreeKnapsack,
  executeTreeMaxSubtreeChain,
} from './internal.ts'

export interface RootedTree {
  n: number
  root: number
  parent: number[]
  children: number[][]
  postorder: number[]
  weight: number[]
}

export interface RootedNodeLayout {
  id: number
  x: number
  depth: number
}

export interface RootedTreeLayout {
  nodes: RootedNodeLayout[]
  byId: Map<number, RootedNodeLayout>
  maxDepth: number
  edges: { a: number; b: number }[]
}

export interface TreeIndependentSetResult {
  dp0: number[]
  dp1: number[]
  ans: number
  chosen: Set<number>
}

export interface TreeDominatingSetResult {
  d0: number[]
  d1: number[]
  d2: number[]
  ans: number
  guards: Set<number>
}

export interface TreeMaxSubtreeChainResult {
  down: number[]
  through: number[]
  ans: number
  diameter: number
  argMax: number
  argThrough: number
}

export interface TreeKnapsackResult {
  dp: number[][]
  sizeEdges: number[]
  ans: number
  order: number[]
}

export interface TreeJointWeightResult {
  neighbors: number[][]
  midSum: number[]
  midMax: number[]
  totalSum: number
  globalMax: number
}

export function buildRootedTree(parent: readonly number[], weight: readonly number[]): RootedTree {
  if (parent.length === 0 || parent.length !== weight.length) {
    throw new RangeError('tree parent and weight arrays must be non-empty and equally sized')
  }
  const n = parent.length
  const children = Array.from({ length: n }, () => [] as number[])
  let root = -1
  for (let node = 0; node < n; node++) {
    if (!Number.isFinite(weight[node])) throw new RangeError('tree weights must be finite')
    if (parent[node] < 0) {
      if (root !== -1) throw new RangeError('tree must have exactly one root')
      root = node
    } else {
      if (parent[node] >= n || parent[node] === node) throw new RangeError('tree parent is out of range')
      children[parent[node]].push(node)
    }
  }
  if (root === -1) throw new RangeError('tree must have a root')
  const postorder: number[] = []
  const stack: Array<[number, boolean]> = [[root, false]]
  const seen = new Set<number>()
  while (stack.length > 0) {
    const [node, visited] = stack.pop() as [number, boolean]
    if (visited) {
      postorder.push(node)
      continue
    }
    if (seen.has(node)) throw new RangeError('tree parent array must be acyclic')
    seen.add(node)
    stack.push([node, true])
    for (let index = children[node].length - 1; index >= 0; index--) stack.push([children[node][index], false])
  }
  if (seen.size !== n) throw new RangeError('tree parent array must be connected')
  return { n, root, parent: [...parent], children, postorder, weight: [...weight] }
}

export function layoutRootedTree(tree: RootedTree): RootedTreeLayout {
  const depth = Array<number>(tree.n).fill(0)
  const x = Array<number>(tree.n).fill(0)
  let leafCursor = 0
  const leafCount = tree.children.filter((children) => children.length === 0).length
  const span = Math.max(1, leafCount - 1)
  const place = (node: number, level: number): number => {
    depth[node] = level
    if (tree.children[node].length === 0) {
      x[node] = leafCount === 1 ? 0.5 : leafCursor / span
      leafCursor++
      return x[node]
    }
    x[node] = tree.children[node].reduce((sum, child) => sum + place(child, level + 1), 0) / tree.children[node].length
    return x[node]
  }
  place(tree.root, 0)
  const nodes = Array.from({ length: tree.n }, (_, id): RootedNodeLayout => ({ id, x: x[id], depth: depth[id] }))
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const edges: { a: number; b: number }[] = []
  for (let node = 0; node < tree.n; node++) {
    for (const child of tree.children[node]) edges.push({ a: node, b: child })
  }
  return { nodes, byId, maxDepth: Math.max(...depth), edges }
}

export function solveTreeIndependentSet(tree: RootedTree): TreeIndependentSetResult {
  return executeTreeIndependentSet(tree, ignoreEvents)
}

export function solveTreeDominatingSet(tree: RootedTree): TreeDominatingSetResult {
  return executeTreeDominatingSet(tree, ignoreEvents)
}

export function solveTreeMaxSubtreeChain(tree: RootedTree): TreeMaxSubtreeChainResult {
  return executeTreeMaxSubtreeChain(tree, ignoreEvents)
}

export function solveTreeKnapsack(
  tree: RootedTree,
  parentEdge: readonly number[],
  edgeLimit: number,
): TreeKnapsackResult {
  return executeTreeKnapsack(tree, parentEdge, edgeLimit, ignoreEvents)
}

export function solveTreeJointWeight(tree: RootedTree): TreeJointWeightResult {
  return executeTreeJointWeight(tree, ignoreEvents)
}
