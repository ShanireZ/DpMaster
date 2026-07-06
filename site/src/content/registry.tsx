import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/**
 * 类型页正文内容注册表，键为 `${pid}/${slug}`。
 *
 * 每个内容组件用 React.lazy 动态 import——按类型独立分包，避免把全部内容
 * （连同其 KaTeX 预渲染、代码块、演示组件）静态打进 TypePage 主 chunk。
 * 打开某个类型页时才拉取该类型这一个 chunk。TypePage 内已用 Suspense 兜底。
 */
export const CONTENT: Record<string, LazyExoticComponent<ComponentType>> = {
  'a/01': lazy(() => import('./a/Knapsack01')),
  'a/complete': lazy(() => import('./a/KnapsackComplete')),
  'a/multiple': lazy(() => import('./a/KnapsackMultiple')),
  'a/group': lazy(() => import('./a/KnapsackGroup')),
  'a/mixed': lazy(() => import('./a/KnapsackMixed')),
  'a/cost2d': lazy(() => import('./a/KnapsackCost2D')),
  'a/dep': lazy(() => import('./a/KnapsackDependency')),
  'a/variant': lazy(() => import('./a/KnapsackVariant')),
  'a/fractional': lazy(() => import('./a/KnapsackFractional')),
  'b/path': lazy(() => import('./b/LinearPath')),
  'b/maxseg': lazy(() => import('./b/MaxSubarray')),
  'b/lis': lazy(() => import('./b/LIS')),
  'b/lcs': lazy(() => import('./b/LCS')),
  'b/edit': lazy(() => import('./b/EditDistance')),
  'b/fsm': lazy(() => import('./b/StateMachine')),
  'b/count': lazy(() => import('./b/LinearCount')),
  'c/stone': lazy(() => import('./c/StoneMerge')),
  'c/ring': lazy(() => import('./c/RingInterval')),
  'c/palindrome': lazy(() => import('./c/Palindrome')),
  'c/tree': lazy(() => import('./c/ScoreTree')),
  'c/merge': lazy(() => import('./c/MergeInterval')),
  'd/grid': lazy(() => import('./d/GridDP')),
  'd/matpow': lazy(() => import('./d/MatrixPower')),
  'e/basic': lazy(() => import('./e/RerootBasic')),
  'e/distsum': lazy(() => import('./e/RerootDistSum')),
  'e/inout': lazy(() => import('./e/RerootInOut')),
  'e/center': lazy(() => import('./e/RerootCenter')),
  'f/select': lazy(() => import('./f/TreeSelect')),
  'f/knapsack': lazy(() => import('./f/TreeKnapsack')),
  'f/diameter': lazy(() => import('./f/TreeDiameter')),
  'f/cover': lazy(() => import('./f/TreeCover')),
  'f/count': lazy(() => import('./f/TreeCount')),
  'g/board': lazy(() => import('./g/BitBoard')),
  'g/tsp': lazy(() => import('./g/BitTSP')),
  'g/cover': lazy(() => import('./g/BitCover')),
  'g/subset': lazy(() => import('./g/BitSubset')),
  'g/plug': lazy(() => import('./g/BitPlug')),
}
