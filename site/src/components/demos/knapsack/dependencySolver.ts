import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import {
  enumerateDependencyCombos, recordDependencyKnapsack,
} from '../../../algorithms/knapsack-dependency/internal.ts'
import type {
  DependencyAccessory, DependencyCombo, DependencyMaster,
} from '../../../algorithms/knapsack-dependency/index.ts'

/** 一個主件（附件依它而選）。 */
export type Master = DependencyMaster
/** 主件的一個附件（合法與否取決於主件是否被選）。 */
export type Accessory = DependencyAccessory

/** 由「主件 + 所選附件子集」枚舉出的一個合法組合，當作一件“分組物品”。 */
export type Combo = DependencyCombo

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 依賴歸約的核心：把「主件 + 它的附件的任一子集」枚舉成若干**合法組合**。
 * 附件必須依主件而選，所以每個組合都**含主件**，再疊加附件的一個子集（2^附件數 個）。
 * 於是「有依賴的揹包」= 這些組合構成**同一組**、組內至多選一個的**分組揹包**。
 */
export function enumCombos(master: Master, acc: Accessory[]): Combo[] {
  return enumerateDependencyCombos(master, acc)
}

/**
 * 有依賴的揹包演示（單主件 + 若干附件）：
 *   第 1 階段，枚舉出所有合法組合（每個組合含主件 + 一個附件子集）；
 *   第 2 階段，把這些組合當作**同一組**，做一維 f[j] 的分組揹包（組內至多選一個）。
 * 網格用二維原型 f[組][j]：第 0 行是空組的地基，第 1 行 = 處理「這一組組合」後的結果，
 * 逐格取「不選本組」與「選組內某個組合」的較大者，恰好重複使用分組揹包的轉移。
 */
export function dependencyKnapsack(master: Master, acc: Accessory[], W: number): VizModel {
  const run = recordDependencyKnapsack(master, acc, W)
  const combos = run.result.combos
  // 二維：第 0 行（空組）+ 第 1 行（這一組組合處理後）。
  const f: (number | null)[][] = [Array<number | null>(W + 1).fill(0), Array<number | null>(W + 1).fill(null)]
  const snap = () => f.map((row) => row.slice())
  const frames: Frame[] = []

  const combosStr = combos.map((c) => `${c.label}(${c.w},${c.v})`).join('，')

  // 影格 0：亮出 4 個組合的 (費用, 價值)，講清依賴→枚舉組合這一步。
  frames.push({
    values: snap(),
    states: settled(f),
    caption:
      `<b>第一步：枚举组合</b>。附件必须依主件而选，所以每个合法组合都含主件，再叠加附件的一个子集，` +
      `共 <b>${combos.length}</b> 个：${combosStr}。它们构成<b>同一组</b>，组内至多选一个，问题就归约成了<b>分组背包</b>。`,
    formula: `2^{${acc.length}} = ${combos.length}`,
  })

  // 影格 1：第 0 行地基。
  frames.push({
    values: snap(),
    states: settled(f),
    caption: '<b>第二步：分组背包</b>。第 0 行 = 还没处理这一组时，任何容量下最大价值都是 <b>0</b>（地基）。',
    formula: 'f[0][j] = 0',
  })

  // 第 1 行：逐格做「這一組組合」的分組轉移。
  for (const event of run.events) {
    const { capacity: j, skip, bestTake, takeIndex: takeIdx, best, takeWins } = event
    f[1][j] = best

    const states = settled(f)
    const arrows: Arrow[] = []
    states[key(0, j)] = 'source'
    arrows.push({ from: { r: 0, c: j }, to: { r: 1, c: j }, kind: takeWins ? 'source' : 'chosen' })
    if (takeIdx >= 0) {
      const w = combos[takeIdx].w
      states[key(0, j - w)] = 'source'
      arrows.push({ from: { r: 0, c: j - w }, to: { r: 1, c: j }, kind: takeWins ? 'chosen' : 'source' })
    }
    if (takeWins) states[key(0, j - combos[takeIdx].w)] = 'chosen'
    else states[key(0, j)] = 'chosen'
    states[key(1, j)] = 'current'

    let caption: string
    let formula: string
    if (takeIdx >= 0) {
      const c = combos[takeIdx]
      caption =
        `容量 <b>${j}</b>：不选本组 = f[0][${j}] = <b>${skip}</b>；` +
        `选组合 <b>${c.label}</b>(费用${c.w},价值${c.v}) = f[0][${j - c.w}]+${c.v} = <b>${bestTake}</b> → 取较大者 <b>${best}</b>。`
      formula = `f[1][${j}]=\\max(${skip},\\ ${f[0][j - c.w]}+${c.v})=${best}`
    } else {
      caption = `容量 <b>${j}</b>：连最便宜的组合都装不下（j 太小），只能不选本组 = <b>${skip}</b>。`
      formula = `f[1][${j}]=f[0][${j}]=${skip}`
    }
    frames.push({ values: snap(), states, arrows, active: { r: 1, c: j }, caption, formula })
  }

  const fin = settled(f)
  fin[key(1, W)] = 'chosen'
  // 找出最優組合（用於結論解說）。
  const bestCombo = run.result.bestCombo
  const tail =
    bestCombo && bestCombo.v === run.result.value
      ? `，最优是选组合 <b>${bestCombo.label}</b>（费用 ${bestCombo.w} ≤ ${W}、价值 ${bestCombo.v}）。`
      : '。'
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案在 <b>f[1][${W}] = ${run.result.value}</b>，这一组组合、容量 ${W}、至多选一个组合时的最大价值${tail}`,
    formula: `f[1][${W}]=${run.result.value}`,
  })

  return {
    rows: 2,
    cols: W + 1,
    cell: 40,
    rowHeaderLabels: ['∅', '这组'],
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}
