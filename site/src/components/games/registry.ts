import type { ComponentType } from 'react'
import PackMasterGame from './PackMasterGame'

/** 每部分一个互动小游戏，键为 part id。切片阶段先接通 B 背包。 */
export const GAMES: Record<string, { title: string; comp: ComponentType }> = {
  b: { title: '装包大师', comp: PackMasterGame },
}
