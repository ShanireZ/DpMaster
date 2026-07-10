import type { EventSink, RecordedRun } from '../contracts.ts'
import type {
  RootedTree,
  TreeDominatingSetResult,
  TreeIndependentSetResult,
  TreeJointWeightResult,
  TreeKnapsackResult,
  TreeMaxSubtreeChainResult,
} from './index.ts'

const INF = 1e9

export interface TreeIndependentSetEvent {
  type: 'settled'
  node: number
  dp0: number
  dp1: number
  settled: readonly number[]
  leaf: boolean
}

export interface TreeDominatingSetEvent {
  type: 'settled'
  node: number
  d0: number
  d1: number
  d2: number
  settled: readonly number[]
  leaf: boolean
}

export interface TreeMaxSubtreeChainEvent {
  type: 'settled'
  node: number
  down: number
  best1: number
  best2: number
  through: number
  settled: readonly number[]
}

export interface TreeKnapsackEvent {
  type: 'settled'
  node: number
  sizeEdges: number
  values: readonly number[]
}

export interface TreeJointWeightEvent {
  type: 'settled'
  node: number
  neighbors: readonly number[]
  sum: number
  maximum: number
}

export function executeTreeIndependentSet(
  tree: RootedTree,
  emit: EventSink<TreeIndependentSetEvent>,
): TreeIndependentSetResult {
  const dp0 = Array<number>(tree.n).fill(0)
  const dp1 = Array<number>(tree.n).fill(0)
  const settled: number[] = []
  for (const node of tree.postorder) {
    dp1[node] = tree.weight[node]
    for (const child of tree.children[node]) {
      dp0[node] += Math.max(dp0[child], dp1[child])
      dp1[node] += dp0[child]
    }
    settled.push(node)
    emit({
      type: 'settled',
      node,
      dp0: dp0[node],
      dp1: dp1[node],
      settled: settled.slice(),
      leaf: tree.children[node].length === 0,
    })
  }
  const chosen = new Set<number>()
  const stack: Array<[number, boolean]> = [[tree.root, false]]
  while (stack.length > 0) {
    const [node, parentChosen] = stack.pop() as [number, boolean]
    const take = !parentChosen && dp1[node] >= dp0[node]
    if (take) chosen.add(node)
    for (const child of tree.children[node]) stack.push([child, take])
  }
  return { dp0, dp1, ans: Math.max(dp0[tree.root], dp1[tree.root]), chosen }
}

export function recordTreeIndependentSet(
  tree: RootedTree,
): RecordedRun<TreeIndependentSetResult, TreeIndependentSetEvent> {
  const events: TreeIndependentSetEvent[] = []
  const result = executeTreeIndependentSet(tree, (event) => events.push(event))
  return { result, events }
}

export function executeTreeDominatingSet(
  tree: RootedTree,
  emit: EventSink<TreeDominatingSetEvent>,
): TreeDominatingSetResult {
  const d0 = Array<number>(tree.n).fill(0)
  const d1 = Array<number>(tree.n).fill(0)
  const d2 = Array<number>(tree.n).fill(0)
  const settled: number[] = []
  for (const node of tree.postorder) {
    const children = tree.children[node]
    if (children.length === 0) {
      d0[node] = tree.weight[node]
      d1[node] = INF
    } else {
      d0[node] = tree.weight[node]
      d2[node] = 0
      let base = 0
      let extra = INF
      for (const child of children) {
        d0[node] += Math.min(d0[child], d1[child], d2[child])
        d2[node] += Math.min(d0[child], d1[child])
        base += Math.min(d0[child], d1[child])
        extra = Math.min(extra, d0[child] - Math.min(d0[child], d1[child]))
      }
      d1[node] = base + extra
    }
    settled.push(node)
    emit({
      type: 'settled',
      node,
      d0: d0[node],
      d1: d1[node],
      d2: d2[node],
      settled: settled.slice(),
      leaf: children.length === 0,
    })
  }

  const guards = new Set<number>()
  type Requirement = 'free' | 'covered' | 'guard'
  const pick = (node: number, requirement: Requirement): void => {
    const children = tree.children[node]
    let state: 0 | 1 | 2
    if (requirement === 'guard') state = 0
    else if (requirement === 'covered') state = d0[node] <= d1[node] ? 0 : 1
    else {
      const minimum = Math.min(d0[node], d1[node], d2[node])
      state = minimum === d0[node] ? 0 : minimum === d1[node] ? 1 : 2
    }
    if (state === 0) {
      guards.add(node)
      for (const child of children) pick(child, 'free')
    } else if (state === 1) {
      let bestChild = -1
      let bestExtra = INF
      for (const child of children) {
        const extra = d0[child] - Math.min(d0[child], d1[child])
        if (extra < bestExtra) {
          bestExtra = extra
          bestChild = child
        }
      }
      for (const child of children) pick(child, child === bestChild ? 'guard' : 'covered')
    } else for (const child of children) pick(child, 'covered')
  }
  pick(tree.root, 'covered')
  return { d0, d1, d2, ans: Math.min(d0[tree.root], d1[tree.root]), guards }
}

export function recordTreeDominatingSet(
  tree: RootedTree,
): RecordedRun<TreeDominatingSetResult, TreeDominatingSetEvent> {
  const events: TreeDominatingSetEvent[] = []
  const result = executeTreeDominatingSet(tree, (event) => events.push(event))
  return { result, events }
}

export function executeTreeMaxSubtreeChain(
  tree: RootedTree,
  emit: EventSink<TreeMaxSubtreeChainEvent>,
): TreeMaxSubtreeChainResult {
  const down = Array<number>(tree.n).fill(0)
  const through = Array<number>(tree.n).fill(0)
  const settled: number[] = []
  for (const node of tree.postorder) {
    let best1 = 0
    let best2 = 0
    for (const child of tree.children[node]) {
      const gain = Math.max(0, down[child])
      if (gain > best1) {
        best2 = best1
        best1 = gain
      } else if (gain > best2) best2 = gain
    }
    down[node] = tree.weight[node] + best1
    through[node] = tree.weight[node] + best1 + best2
    settled.push(node)
    emit({ type: 'settled', node, down: down[node], best1, best2, through: through[node], settled: settled.slice() })
  }
  let ans = Number.NEGATIVE_INFINITY
  let diameter = Number.NEGATIVE_INFINITY
  let argMax = tree.root
  let argThrough = tree.root
  for (let node = 0; node < tree.n; node++) {
    if (down[node] > ans) {
      ans = down[node]
      argMax = node
    }
    if (through[node] > diameter) {
      diameter = through[node]
      argThrough = node
    }
  }
  return { down, through, ans, diameter, argMax, argThrough }
}

export function recordTreeMaxSubtreeChain(
  tree: RootedTree,
): RecordedRun<TreeMaxSubtreeChainResult, TreeMaxSubtreeChainEvent> {
  const events: TreeMaxSubtreeChainEvent[] = []
  const result = executeTreeMaxSubtreeChain(tree, (event) => events.push(event))
  return { result, events }
}

export function executeTreeKnapsack(
  tree: RootedTree,
  parentEdge: readonly number[],
  edgeLimit: number,
  emit: EventSink<TreeKnapsackEvent>,
): TreeKnapsackResult {
  if (parentEdge.length !== tree.n) throw new RangeError('tree edge weights must match tree size')
  if (!Number.isInteger(edgeLimit) || edgeLimit < 0) throw new RangeError('tree edge limit must be non-negative')
  const sizeEdges = Array<number>(tree.n).fill(0)
  const dp = Array.from({ length: tree.n }, () => Array<number>(edgeLimit + 1).fill(0))
  for (const node of tree.postorder) {
    let capacity = 0
    for (const child of tree.children[node]) {
      capacity += sizeEdges[child] + 1
      for (let used = Math.min(capacity, edgeLimit); used >= 1; used--) {
        for (let childEdges = 1; childEdges <= sizeEdges[child] + 1 && childEdges <= used; childEdges++) {
          const candidate = dp[node][used - childEdges] + parentEdge[child] + dp[child][childEdges - 1]
          dp[node][used] = Math.max(dp[node][used], candidate)
        }
      }
    }
    sizeEdges[node] = capacity
    emit({ type: 'settled', node, sizeEdges: capacity, values: dp[node].slice() })
  }
  return {
    dp,
    sizeEdges,
    ans: dp[tree.root][Math.min(edgeLimit, sizeEdges[tree.root])],
    order: tree.postorder.slice(),
  }
}

export function recordTreeKnapsack(
  tree: RootedTree,
  parentEdge: readonly number[],
  edgeLimit: number,
): RecordedRun<TreeKnapsackResult, TreeKnapsackEvent> {
  const events: TreeKnapsackEvent[] = []
  const result = executeTreeKnapsack(tree, parentEdge, edgeLimit, (event) => events.push(event))
  return { result, events }
}

export function executeTreeJointWeight(
  tree: RootedTree,
  emit: EventSink<TreeJointWeightEvent>,
): TreeJointWeightResult {
  const neighbors = Array.from({ length: tree.n }, () => [] as number[])
  for (let node = 0; node < tree.n; node++) {
    if (tree.parent[node] >= 0) neighbors[node].push(tree.parent[node])
    neighbors[node].push(...tree.children[node])
  }
  const midSum = Array<number>(tree.n).fill(0)
  const midMax = Array<number>(tree.n).fill(0)
  let totalSum = 0
  let globalMax = 0
  for (let node = 0; node < tree.n; node++) {
    let sum = 0
    let squareSum = 0
    let greatest = 0
    let second = 0
    for (const neighbor of neighbors[node]) {
      const value = tree.weight[neighbor]
      sum += value
      squareSum += value * value
      if (value > greatest) {
        second = greatest
        greatest = value
      } else if (value > second) second = value
    }
    if (neighbors[node].length >= 2) {
      midSum[node] = sum * sum - squareSum
      midMax[node] = greatest * second
    }
    totalSum += midSum[node]
    globalMax = Math.max(globalMax, midMax[node])
    emit({ type: 'settled', node, neighbors: neighbors[node].slice(), sum: midSum[node], maximum: midMax[node] })
  }
  return { neighbors, midSum, midMax, totalSum, globalMax }
}

export function recordTreeJointWeight(
  tree: RootedTree,
): RecordedRun<TreeJointWeightResult, TreeJointWeightEvent> {
  const events: TreeJointWeightEvent[] = []
  const result = executeTreeJointWeight(tree, (event) => events.push(event))
  return { result, events }
}
