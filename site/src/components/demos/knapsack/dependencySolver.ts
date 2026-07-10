import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import {
  enumerateDependencyCombos, recordDependencyKnapsack,
} from '../../../algorithms/knapsack-dependency/internal.ts'
import type {
  DependencyAccessory, DependencyCombo, DependencyMaster,
} from '../../../algorithms/knapsack-dependency/index.ts'

/** 一个主件（附件依它而选）。 */
export type Master = DependencyMaster
/** 主件的一个附件（合法与否取决于主件是否被选）。 */
export type Accessory = DependencyAccessory

/** 由「主件 + 所选附件子集」枚举出的一个合法组合——当作一件“分组物品”。 */
export type Combo = DependencyCombo

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 依赖归约的核心：把「主件 + 它的附件的任一子集」枚举成若干**合法组合**。
 * 附件必须依主件而选——所以每个组合都**含主件**，再叠加附件的一个子集（2^附件数 个）。
 * 于是「有依赖的背包」= 这些组合构成**同一组**、组内至多选一个的**分组背包**。
 */
export function enumCombos(master: Master, acc: Accessory[]): Combo[] {
  return enumerateDependencyCombos(master, acc)
}

/**
 * 有依赖的背包演示（单主件 + 若干附件）：
 *   第 1 阶段——枚举出所有合法组合（每个组合含主件 + 一个附件子集）；
 *   第 2 阶段——把这些组合当作**同一组**，做一维 f[j] 的分组背包（组内至多选一个）。
 * 网格用二维原型 f[组][j]：第 0 行是空组的地基，第 1 行 = 处理「这一组组合」后的结果，
 * 逐格取「不选本组」与「选组内某个组合」的较大者——恰好复用分组背包的转移。
 */
export function dependencyKnapsack(master: Master, acc: Accessory[], W: number): VizModel {
  const run = recordDependencyKnapsack(master, acc, W)
  const combos = run.result.combos
  // 二维：第 0 行（空组）+ 第 1 行（这一组组合处理后）。
  const f: (number | null)[][] = [Array<number | null>(W + 1).fill(0), Array<number | null>(W + 1).fill(null)]
  const snap = () => f.map((row) => row.slice())
  const frames: Frame[] = []

  const combosStr = combos.map((c) => `${c.label}(${c.w},${c.v})`).join('，')

  // 帧 0：亮出 4 个组合的 (费用, 价值)，讲清依赖→枚举组合这一步。
  frames.push({
    values: snap(),
    states: settled(f),
    caption:
      `<b>第一步：枚举组合</b>。附件必须依主件而选，所以每个合法组合都含主件，再叠加附件的一个子集，` +
      `共 <b>${combos.length}</b> 个：${combosStr}。它们构成<b>同一组</b>，组内至多选一个——问题就归约成了<b>分组背包</b>。`,
    formula: `2^{${acc.length}} = ${combos.length}`,
  })

  // 帧 1：第 0 行地基。
  frames.push({
    values: snap(),
    states: settled(f),
    caption: '<b>第二步：分组背包</b>。第 0 行 = 还没处理这一组时，任何容量下最大价值都是 <b>0</b>（地基）。',
    formula: 'f[0][j] = 0',
  })

  // 第 1 行：逐格做「这一组组合」的分组转移。
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
  // 找出最优组合（用于结论解说）。
  const bestCombo = run.result.bestCombo
  const tail =
    bestCombo && bestCombo.v === run.result.value
      ? `——最优是选组合 <b>${bestCombo.label}</b>（费用 ${bestCombo.w} ≤ ${W}、价值 ${bestCombo.v}）。`
      : '。'
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案在 <b>f[1][${W}] = ${run.result.value}</b>——这一组组合、容量 ${W}、至多选一个组合时的最大价值${tail}`,
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
