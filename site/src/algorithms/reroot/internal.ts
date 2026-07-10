import { ignoreEvents, type EventSink, type RecordedRun } from '../contracts.ts'
import type {
  RerootDistanceResult,
  RerootEccentricityResult,
  RerootInOutResult,
  RerootMode,
  RerootTree,
} from './index.ts'

export type RerootDistanceEvent = {
  type: 'subtree-settled'
  node: number
  subtreeWeight: number
  down: number
} | {
  type: 'root-shifted'
  node: number
  parent: number
  coefficient: number
  distance: number
}

export interface RerootInOutEvent {
  type: 'settled'
  node: number
  down: number
  up: number
  distance: number
}

export type RerootEccentricityEvent = {
  type: 'down-settled'
  node: number
  longest: number
  second: number
} | {
  type: 'up-settled'
  node: number
  parent: number
  up: number
}

function edgeWeight(tree: RerootTree, node: number, parent: number): number {
  return tree.adj[node].find(({ to }) => to === parent)?.w ?? 1
}

export function executeRerootDistance(
  tree: RerootTree,
  mode: RerootMode,
  emit: EventSink<RerootDistanceEvent>,
): RerootDistanceResult {
  const weights = mode === 'nodeWeighted' ? tree.weight : Array<number>(tree.n).fill(1)
  const totalW = weights.reduce((sum, value) => sum + value, 0)
  const sz = Array<number>(tree.n).fill(0)
  const down = Array<number>(tree.n).fill(0)
  for (let index = tree.order.length - 1; index >= 0; index--) {
    const node = tree.order[index]
    sz[node] = weights[node]
    for (const child of tree.children[node]) {
      const weight = edgeWeight(tree, child, node)
      sz[node] += sz[child]
      down[node] += down[child] + weight * sz[child]
    }
    emit({ type: 'subtree-settled', node, subtreeWeight: sz[node], down: down[node] })
  }
  const dist = Array<number>(tree.n).fill(0)
  const coef = Array<number>(tree.n).fill(0)
  dist[tree.root] = down[tree.root]
  for (const node of tree.order) {
    for (const child of tree.children[node]) {
      coef[child] = totalW - 2 * sz[child]
      dist[child] = dist[node] + edgeWeight(tree, child, node) * coef[child]
      emit({ type: 'root-shifted', node: child, parent: node, coefficient: coef[child], distance: dist[child] })
    }
  }
  let best = Number.POSITIVE_INFINITY
  let bestNode = tree.root
  for (let node = 0; node < tree.n; node++) {
    if (dist[node] < best) {
      best = dist[node]
      bestNode = node
    }
  }
  return { n: tree.n, fixedRoot: tree.root, sz, down, dist, coef, best, bestNode, totalW }
}

export function recordRerootDistance(
  tree: RerootTree,
  mode: RerootMode = 'unweighted',
): RecordedRun<RerootDistanceResult, RerootDistanceEvent> {
  const events: RerootDistanceEvent[] = []
  const result = executeRerootDistance(tree, mode, (event) => events.push(event))
  return { result, events }
}

export function executeRerootInOut(
  tree: RerootTree,
  emit: EventSink<RerootInOutEvent>,
): RerootInOutResult {
  const distance = executeRerootDistance(tree, 'unweighted', ignoreEvents)
  const up = distance.dist.map((value, node) => value - distance.down[node])
  for (const node of tree.order) {
    emit({ type: 'settled', node, down: distance.down[node], up: up[node], distance: distance.dist[node] })
  }
  return {
    n: tree.n,
    root: tree.root,
    sz: distance.sz,
    down: distance.down,
    up,
    dist: distance.dist,
    totalW: distance.totalW,
  }
}

export function recordRerootInOut(tree: RerootTree): RecordedRun<RerootInOutResult, RerootInOutEvent> {
  const events: RerootInOutEvent[] = []
  const result = executeRerootInOut(tree, (event) => events.push(event))
  return { result, events }
}

export function executeRerootEccentricity(
  tree: RerootTree,
  emit: EventSink<RerootEccentricityEvent>,
): RerootEccentricityResult {
  const down1 = Array<number>(tree.n).fill(0)
  const down2 = Array<number>(tree.n).fill(0)
  const bestChild = Array<number>(tree.n).fill(-1)
  const up = Array<number>(tree.n).fill(0)
  for (let index = tree.order.length - 1; index >= 0; index--) {
    const node = tree.order[index]
    for (const child of tree.children[node]) {
      const candidate = down1[child] + edgeWeight(tree, child, node)
      if (candidate > down1[node]) {
        down2[node] = down1[node]
        down1[node] = candidate
        bestChild[node] = child
      } else if (candidate > down2[node]) down2[node] = candidate
    }
    emit({ type: 'down-settled', node, longest: down1[node], second: down2[node] })
  }
  for (const node of tree.order) {
    for (const child of tree.children[node]) {
      const exceptChild = bestChild[node] === child ? down2[node] : down1[node]
      up[child] = Math.max(up[node], exceptChild) + edgeWeight(tree, child, node)
      emit({ type: 'up-settled', node: child, parent: node, up: up[child] })
    }
  }
  const ecc = down1.map((value, node) => Math.max(value, up[node]))
  let center = 0
  let radius = Number.POSITIVE_INFINITY
  let diameter = 0
  for (let node = 0; node < tree.n; node++) {
    if (ecc[node] < radius) {
      radius = ecc[node]
      center = node
    }
    diameter = Math.max(diameter, ecc[node])
  }
  return { n: tree.n, down1, down2, up, ecc, center, radius, diameter }
}

export function recordRerootEccentricity(
  tree: RerootTree,
): RecordedRun<RerootEccentricityResult, RerootEccentricityEvent> {
  const events: RerootEccentricityEvent[] = []
  const result = executeRerootEccentricity(tree, (event) => events.push(event))
  return { result, events }
}
