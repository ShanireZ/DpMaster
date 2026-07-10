import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordGroupKnapsack } from '../../../algorithms/knapsack-group/internal.ts'
import type { Group } from './groupSolver'

// 复用 groupSolver 的 Group / GItem 类型：Group = GItem[]，GItem = { w, v }
export type { Group } from './groupSolver'

function settled(row: (number | null)[]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let c = 0; c < row.length; c++) if (row[c] !== null) s[key(0, c)] = 'settled'
  return s
}

const label = (g: number) => `组${g}`
const itemsStr = (items: readonly Group[number][], hit: number) =>
  items.map((it, k) => `${k === hit ? '★' : ''}(${it.w},${it.v})`).join(' ')

/**
 * 一维分组背包 · 正确的循环顺序：
 *   for 组 g:  for j = W..0(倒序):  for 组内每件 (w,v):  f[j]=max(f[j], f[j-w]+v)
 * 容量循环夹在「组」与「组内件」之间——处理某组时，组内不管试哪一件，f[j-w] 用的都是
 * 「本组尚未出手」的旧值，各件在同一起点上竞争，每组至多有一件胜出被计入。
 */
export function groupOrderCorrect(groups: Group[], W: number): VizModel {
  const run = recordGroupKnapsack(groups, W, 'rolling-correct')
  const f: (number | null)[] = Array<number | null>(W + 1).fill(0)
  const snap = (): (number | null)[][] => [f.slice()]
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(f),
    caption: '初始：容量 0…W 的最大价值都是 <b>0</b>（空背包）。',
    formula: 'f[j]=0',
  })

  for (const event of run.events) {
      if (event.type !== 'rolling-cell') continue
      const {
        groupIndex: g, capacity: j, items, before: oldJ, best,
        takeIndex: hit, takeFrom,
      } = event
      f[j] = best

      const states: Record<string, CellState> = settled(snap()[0])
      const arrows: Arrow[] = []
      if (hit >= 0) {
        states[key(0, takeFrom)] = 'source'
        arrows.push({ from: { r: 0, c: takeFrom }, to: { r: 0, c: j }, kind: 'chosen' })
        states[key(0, takeFrom)] = 'chosen'
      }
      states[key(0, j)] = 'current'

      let caption: string
      let formula: string
      if (hit >= 0) {
        const { w, v } = items[hit]
        const src = best - v // f[j-w] 的旧值（本组未动过）
        caption =
          `<b>${label(g)}</b> [${itemsStr(items, hit)}] · <b>倒序</b> j=${j}：` +
          `组内挑最好的一件 <b>(${w},${v})</b> → f[${j - w}]+${v} = <b>${best}</b> &gt; f[${j}]=<b>${oldJ}</b> → 更新为 <b>${best}</b>。` +
          `<span class="ok"> f[${j - w}] 用的是本组还没动过的旧值，故只计入这一件。</span>`
        formula = `f[${j}]=\\max(${oldJ},\\ ${src}+${v})=${best}`
      } else {
        caption = `<b>${label(g)}</b> [${itemsStr(items, -1)}] · <b>倒序</b> j=${j}：组内没有件能让 f[${j}] 变大，保持 <b>${oldJ}</b>。`
        formula = `f[${j}]=${oldJ}`
      }
      frames.push({ values: snap(), states, active: { r: 0, c: j }, arrows, caption, formula })
  }

  const fin = settled(f)
  fin[key(0, W)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: `正确顺序的答案 <b>f[${W}] = ${run.result.value}</b>：每组至多一件，组内互斥被守住。`,
    formula: `f[${W}]=${run.result.value}`,
  })

  return {
    rows: 1,
    cols: W + 1,
    cell: 40,
    rowHeaderLabels: ['f'],
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}

/**
 * 一维分组背包 · 错误的循环顺序：
 *   for 组 g:  for 组内每件 (w,v):  for j = W..0:  f[j]=max(f[j], f[j-w]+v)
 * 容量循环沉到最里层——组内每一件各自独立跑一遍完整倒序背包。前一件已改过 f[·]，后一件
 * 又在「前一件已装进去」的结果上继续叠，于是同组多件可同时选中，答案偏大。
 */
export function groupOrderWrong(groups: Group[], W: number): VizModel {
  const run = recordGroupKnapsack(groups, W, 'rolling-wrong')
  const f: (number | null)[] = Array<number | null>(W + 1).fill(0)
  const snap = (): (number | null)[][] => [f.slice()]
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(f),
    caption: '初始：容量 0…W 的最大价值都是 <b>0</b>（空背包）。',
    formula: 'f[j]=0',
  })

  for (const event of run.events) {
        if (event.type !== 'wrong-cell') continue
        const {
          groupIndex: g, itemIndex: k, capacity: j, items,
          before: oldJ, candidate: cand, after, changed, stacked,
        } = event
        const { w, v } = items[k]
        f[j] = after

        const states: Record<string, CellState> = settled(snap()[0])
        states[key(0, j - w)] = 'source'
        const arrows: Arrow[] = [
          { from: { r: 0, c: j - w }, to: { r: 0, c: j }, kind: changed ? 'chosen' : 'source' },
        ]
        if (changed) states[key(0, j - w)] = stacked ? 'invalid' : 'chosen'
        states[key(0, j)] = 'current'

        let caption =
          `<b>${label(g)}</b> [${itemsStr(items, k)}] · 组内第 <b>${k + 1}</b> 件 <b>(${w},${v})</b> 单独跑倒序 · j=${j}：` +
          `f[${j - w}]+${v} = <b>${cand}</b> ${changed ? '&gt;' : '≤'} f[${j}]=<b>${oldJ}</b> → ${changed ? `更新为 <b>${cand}</b>` : '不变'}。`
        if (stacked) {
          caption += ` <span class="bad">⚠ f[${j - w}] 已含本组更早的件——这一步把<b>同一组的两件叠在了一起</b>，组内互斥失效！</span>`
        }
        const formula = `f[${j}]=\\max(${oldJ},\\ ${cand - v}+${v})=${after}`

        frames.push({ values: snap(), states, active: { r: 0, c: j }, arrows, caption, formula })
  }

  const fin = settled(f)
  fin[key(0, W)] = 'invalid'
  frames.push({
    values: snap(),
    states: fin,
    caption: `错误顺序的答案 <b>f[${W}] = ${run.result.value}</b>：组内多件被重复计入，比正确值偏大。`,
    formula: `f[${W}]=${run.result.value}`,
  })

  return {
    rows: 1,
    cols: W + 1,
    cell: 40,
    rowHeaderLabels: ['f'],
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}
