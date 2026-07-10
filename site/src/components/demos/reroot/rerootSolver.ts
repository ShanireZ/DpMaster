import {
  buildRerootTree,
  layoutRerootTree,
  solveRerootDistanceBrute,
  type RerootDistanceResult,
  type RerootEdge,
  type RerootEccentricityResult,
  type RerootInOutResult,
  type RerootMode,
  type RerootNodeLayout,
  type RerootTree,
} from '../../../algorithms/reroot/index.ts'
import {
  recordRerootDistance,
  recordRerootEccentricity,
  recordRerootInOut,
} from '../../../algorithms/reroot/internal.ts'

export type Edge = RerootEdge
export type BuiltTree = RerootTree
export type RerootResult = RerootDistanceResult
export type InOutResult = RerootInOutResult
export type EccResult = RerootEccentricityResult

export type TreeNodeLayout = RerootNodeLayout

export function buildTree(
  n: number,
  edges: Edge[],
  root = 0,
  weight?: number[],
): BuiltTree {
  return buildRerootTree(n, edges, root, weight)
}

export function layoutTree(tree: BuiltTree): { nodes: TreeNodeLayout[]; maxDepth: number } {
  return layoutRerootTree(tree)
}

export function rerootDistSum(
  tree: BuiltTree,
  mode: RerootMode = 'unweighted',
): RerootResult {
  return recordRerootDistance(tree, mode).result
}

export function bruteDistSum(
  tree: BuiltTree,
  mode: RerootMode = 'unweighted',
): { dist: number[]; ops: number } {
  return solveRerootDistanceBrute(tree, mode)
}

export type RerootPhase = 'intro' | 'pass1' | 'pass1done' | 'pass2' | 'done'

export interface RerootFrame {
  phase: RerootPhase
  active: number | null
  fromParent: number | null
  szKnown: boolean[]
  distKnown: boolean[]
  rootHighlight: number | null
  caption: string
  formula: string
}

export function rerootFrames(tree: BuiltTree, result: RerootResult): RerootFrame[] {
  const run = recordRerootDistance(tree)
  const frames: RerootFrame[] = []
  const szKnown = Array<boolean>(tree.n).fill(false)
  const distKnown = Array<boolean>(tree.n).fill(false)
  frames.push({
    phase: 'intro',
    active: null,
    fromParent: null,
    szKnown: szKnown.slice(),
    distKnown: distKnown.slice(),
    rootHighlight: result.fixedRoot,
    caption: `先固定节点 <b>${result.fixedRoot + 1}</b> 为根：第一遍后序求子树，第二遍沿边 O(1) 换根。`,
    formula: `\\text{fixed root}=${result.fixedRoot + 1}`,
  })
  for (const event of run.events) {
    if (event.type !== 'subtree-settled') continue
    szKnown[event.node] = true
    frames.push({
      phase: 'pass1',
      active: event.node,
      fromParent: null,
      szKnown: szKnown.slice(),
      distKnown: distKnown.slice(),
      rootHighlight: result.fixedRoot,
      caption: `<b>第一遍 · 后序</b>：结算节点 <b>${event.node + 1}</b>，子树权重 sz=<b>${event.subtreeWeight}</b>，子树内距离和 down=<b>${event.down}</b>。`,
      formula: `\\mathrm{sz}[${event.node + 1}]=${event.subtreeWeight}`,
    })
  }
  distKnown[result.fixedRoot] = true
  frames.push({
    phase: 'pass1done',
    active: result.fixedRoot,
    fromParent: null,
    szKnown: szKnown.slice(),
    distKnown: distKnown.slice(),
    rootHighlight: result.fixedRoot,
    caption: `固定根的距离和 f[${result.fixedRoot + 1}]=<b>${result.dist[result.fixedRoot]}</b>，作为换根起点。`,
    formula: `f[${result.fixedRoot + 1}]=${result.dist[result.fixedRoot]}`,
  })
  for (const event of run.events) {
    if (event.type !== 'root-shifted') continue
    distKnown[event.node] = true
    frames.push({
      phase: 'pass2',
      active: event.node,
      fromParent: event.parent,
      szKnown: szKnown.slice(),
      distKnown: distKnown.slice(),
      rootHighlight: event.node,
      caption: `<b>第二遍 · 换根</b>：从 ${event.parent + 1} 移到 <b>${event.node + 1}</b>，系数 W−2·sz=<b>${event.coefficient}</b>，得到 f=<b>${event.distance}</b>。`,
      formula: `f[${event.node + 1}]=f[${event.parent + 1}]+(${event.coefficient})=${event.distance}`,
    })
  }
  frames.push({
    phase: 'done',
    active: result.bestNode,
    fromParent: null,
    szKnown: szKnown.slice(),
    distKnown: distKnown.slice(),
    rootHighlight: result.bestNode,
    caption: `两遍扫描结束，最小距离和是节点 <b>${result.bestNode + 1}</b> 的 <b>${result.best}</b>。`,
    formula: `\\min_u f[u]=${result.best}`,
  })
  return frames
}

export function inOutDecompose(tree: BuiltTree): InOutResult {
  return recordRerootInOut(tree).result
}

export function eccentricity(tree: BuiltTree): EccResult {
  return recordRerootEccentricity(tree).result
}
