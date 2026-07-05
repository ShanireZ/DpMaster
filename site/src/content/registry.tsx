import type { ComponentType } from 'react'
import Knapsack01 from './b/Knapsack01'
import KnapsackComplete from './b/KnapsackComplete'

/** 类型页正文内容注册表，键为 `${pid}/${slug}`。切片阶段先接通 B 背包。 */
export const CONTENT: Record<string, ComponentType> = {
  'b/01': Knapsack01,
  'b/complete': KnapsackComplete,
}
