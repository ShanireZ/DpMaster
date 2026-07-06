import type { ComponentType } from 'react'
import PackMasterGame from './PackMasterGame'
import LISChainGame from './LISChainGame'

/** 每部分一个互动小游戏，键为 part id。A 线性=LIS 接龙、B 背包=装包大师。 */
export const GAMES: Record<string, { title: string; comp: ComponentType }> = {
  a: { title: 'LIS 接龙', comp: LISChainGame },
  b: { title: '装包大师', comp: PackMasterGame },
}
