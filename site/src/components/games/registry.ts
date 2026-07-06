import type { ComponentType } from 'react'
import PackMasterGame from './PackMasterGame'
import LISChainGame from './LISChainGame'
import StoneMergeGame from './StoneMergeGame'
import PowerAccelGame from './PowerAccelGame'
import RerootGame from './RerootGame'
import TreePartyGame from './TreePartyGame'
import BitBoardGame from './BitBoardGame'

/** 每部分一个互动小游戏，键为 part id。A 背包=装包大师、B 线性=LIS 接龙、C 区间=合并石子、D 矩阵=幂次加速器。 */
export const GAMES: Record<string, { title: string; comp: ComponentType }> = {
  a: { title: '装包大师', comp: PackMasterGame },
  b: { title: 'LIS 接龙', comp: LISChainGame },
  c: { title: '合并石子', comp: StoneMergeGame },
  d: { title: '幂次加速器', comp: PowerAccelGame },
  e: { title: '换根巡礼', comp: RerootGame },
  f: { title: '舞会邀请', comp: TreePartyGame },
  g: { title: '棋盘布阵', comp: BitBoardGame },
}
