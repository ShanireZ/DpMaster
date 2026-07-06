import type { ComponentType } from 'react'
import LinearPath from './a/LinearPath'
import MaxSubarray from './a/MaxSubarray'
import LIS from './a/LIS'
import LCS from './a/LCS'
import EditDistance from './a/EditDistance'
import StateMachine from './a/StateMachine'
import LinearCount from './a/LinearCount'
import Knapsack01 from './b/Knapsack01'
import KnapsackComplete from './b/KnapsackComplete'
import KnapsackMultiple from './b/KnapsackMultiple'
import KnapsackGroup from './b/KnapsackGroup'
import KnapsackMixed from './b/KnapsackMixed'
import KnapsackCost2D from './b/KnapsackCost2D'
import KnapsackDependency from './b/KnapsackDependency'
import KnapsackVariant from './b/KnapsackVariant'
import KnapsackFractional from './b/KnapsackFractional'

/** 类型页正文内容注册表，键为 `${pid}/${slug}`。B 背包 9 类型全就绪。 */
export const CONTENT: Record<string, ComponentType> = {
  'a/path': LinearPath,
  'a/maxseg': MaxSubarray,
  'a/lis': LIS,
  'a/lcs': LCS,
  'a/edit': EditDistance,
  'a/fsm': StateMachine,
  'a/count': LinearCount,
  'b/01': Knapsack01,
  'b/complete': KnapsackComplete,
  'b/multiple': KnapsackMultiple,
  'b/group': KnapsackGroup,
  'b/mixed': KnapsackMixed,
  'b/cost2d': KnapsackCost2D,
  'b/dep': KnapsackDependency,
  'b/variant': KnapsackVariant,
  'b/fractional': KnapsackFractional,
}
