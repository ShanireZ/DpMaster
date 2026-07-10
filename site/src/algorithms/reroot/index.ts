import { ignoreEvents } from '../contracts.ts'
import { executeRerootDistance, executeRerootEccentricity, executeRerootInOut } from './internal.ts'

export interface RerootEdge {
  u: number
  v: number
  w?: number
}

export interface RerootTree {
  n: number
  root: number
  adj: { to: number; w: number }[][]
  parent: number[]
  depth: number[]
  children: number[][]
  order: number[]
  weight: number[]
}

export interface RerootNodeLayout {
  id: number
  parent: number
  depth: number
  children: number[]
  x: number
  y: number
}

export type RerootMode = 'unweighted' | 'nodeWeighted'

export interface RerootDistanceResult {
  n: number
  fixedRoot: number
  sz: number[]
  down: number[]
  dist: number[]
  coef: number[]
  best: number
  bestNode: number
  totalW: number
}

export interface RerootInOutResult {
  n: number
  root: number
  sz: number[]
  down: number[]
  up: number[]
  dist: number[]
  totalW: number
}

export interface RerootEccentricityResult {
  n: number
  down1: number[]
  down2: number[]
  up: number[]
  ecc: number[]
  center: number
  radius: number
  diameter: number
}

export function buildRerootTree(
  n: number,
  edges: readonly RerootEdge[],
  root = 0,
  weight?: readonly number[],
): RerootTree {
  if (!Number.isInteger(n) || n < 1) throw new RangeError('reroot tree size must be positive')
  if (!Number.isInteger(root) || root < 0 || root >= n) throw new RangeError('reroot root is out of range')
  if (weight !== undefined && weight.length !== n) throw new RangeError('reroot node weights must match tree size')
  if (edges.length !== n - 1) throw new RangeError('reroot tree must contain exactly n - 1 edges')
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => [])
  for (const edge of edges) {
    if (edge.u < 0 || edge.u >= n || edge.v < 0 || edge.v >= n) throw new RangeError('reroot edge is out of range')
    const edgeWeight = edge.w ?? 1
    if (!Number.isFinite(edgeWeight)) throw new RangeError('reroot edge weights must be finite')
    adj[edge.u].push({ to: edge.v, w: edgeWeight })
    adj[edge.v].push({ to: edge.u, w: edgeWeight })
  }
  const nodeWeights = weight === undefined ? Array<number>(n).fill(1) : [...weight]
  for (const value of nodeWeights) if (!Number.isFinite(value)) throw new RangeError('reroot node weights must be finite')
  const parent = Array<number>(n).fill(-1)
  const depth = Array<number>(n).fill(0)
  const children = Array.from({ length: n }, () => [] as number[])
  const order: number[] = []
  const seen = Array<boolean>(n).fill(false)
  const queue = [root]
  seen[root] = true
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const node = queue[cursor]
    order.push(node)
    for (const { to } of adj[node]) {
      if (seen[to]) continue
      seen[to] = true
      parent[to] = node
      depth[to] = depth[node] + 1
      children[node].push(to)
      queue.push(to)
    }
  }
  if (order.length !== n) throw new RangeError('reroot edges must form a connected tree')
  return { n, root, adj, parent, depth, children, order, weight: nodeWeights }
}

export function layoutRerootTree(tree: RerootTree): { nodes: RerootNodeLayout[]; maxDepth: number } {
  const x = Array<number>(tree.n).fill(0)
  let leafCursor = 0
  const leafCount = Math.max(1, tree.children.filter((children) => children.length === 0).length)
  for (let index = tree.order.length - 1; index >= 0; index--) {
    const node = tree.order[index]
    if (tree.children[node].length === 0) {
      x[node] = (leafCursor + 0.5) / leafCount
      leafCursor++
    } else {
      x[node] = tree.children[node].reduce((sum, child) => sum + x[child], 0) / tree.children[node].length
    }
  }
  const nodes = Array.from({ length: tree.n }, (_, node): RerootNodeLayout => ({
    id: node,
    parent: tree.parent[node],
    depth: tree.depth[node],
    children: tree.children[node].slice(),
    x: x[node],
    y: tree.depth[node],
  }))
  return { nodes, maxDepth: Math.max(...tree.depth) }
}

export function solveRerootDistance(
  tree: RerootTree,
  mode: RerootMode = 'unweighted',
): RerootDistanceResult {
  return executeRerootDistance(tree, mode, ignoreEvents)
}

export function solveRerootInOut(tree: RerootTree): RerootInOutResult {
  return executeRerootInOut(tree, ignoreEvents)
}

export function solveRerootEccentricity(tree: RerootTree): RerootEccentricityResult {
  return executeRerootEccentricity(tree, ignoreEvents)
}

export function solveRerootDistanceBrute(
  tree: RerootTree,
  mode: RerootMode = 'unweighted',
): { dist: number[]; ops: number } {
  const weights = mode === 'nodeWeighted' ? tree.weight : Array<number>(tree.n).fill(1)
  const dist = Array<number>(tree.n).fill(0)
  let ops = 0
  for (let start = 0; start < tree.n; start++) {
    const values = Array<number>(tree.n).fill(Number.POSITIVE_INFINITY)
    values[start] = 0
    const queue = [start]
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const node = queue[cursor]
      ops++
      for (const { to, w } of tree.adj[node]) {
        if (values[to] !== Number.POSITIVE_INFINITY) continue
        values[to] = values[node] + w
        queue.push(to)
      }
    }
    dist[start] = values.reduce((sum, value, node) => sum + weights[node] * value, 0)
  }
  return { dist, ops }
}
