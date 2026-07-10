import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { countMixedUnits, recordMixedKnapsack } from '../../../algorithms/knapsack-mixed/internal.ts'
import type { MixedKnapsackItem, MixedKnapsackKind } from '../../../algorithms/knapsack-mixed/index.ts'

/** 物品的「件数属性」：01 = 恰一件、complete = 无限件、multiple = 有限 m 件。 */
export type MixKind = MixedKnapsackKind
export type MixItem = MixedKnapsackItem

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

const KIND_CN: Record<MixKind, string> = { '01': '01（恰一件）', complete: '完全（无限件）', multiple: '多重（有限件）' }
const DIR_CN = { reverse: '倒序', forward: '正序' } as const

/**
 * 混合背包 · 同一维 f[j] 上按件数属性分派。
 * 01 → 倒序一遍；complete → 正序一遍；multiple → 二进制拆包后每包倒序。
 * 三者共用同一套 f[j]=max(f[j], f[j-w]+v)，只有循环方向 / 是否拆包不同。
 * 网格为一维（1 行 W+1 列）。
 */
export function mixedKnapsack(items: MixItem[], W: number): VizModel {
  const run = recordMixedKnapsack(items, W)
  const units = countMixedUnits(items)
  const f: (number | null)[] = Array<number | null>(W + 1).fill(0)
  const snap = (): (number | null)[][] => [f.slice()]
  const frames: Frame[] = []

  const summary = items
    .map((it, i) => `物品 ${i + 1} 按 <b>${KIND_CN[it.kind]}</b>`)
    .join('、')
  frames.push({
    values: snap(),
    states: settled(snap()),
    caption: `初始：容量 0…${W} 下最大价值都是 <b>0</b>（空背包）。本例 ${summary}——三类物品即将落到<b>同一维 f[j]</b> 上，各按自己的方式转移。`,
    formula: 'f[j]=0',
  })

  for (const event of run.events) {
      const { unit: un, capacity: j, before: old, candidate: cand, after, better } = event
      f[j] = after

      const states: Record<string, CellState> = settled(snap())
      states[key(0, j - un.w)] = 'source'
      const arrows: Arrow[] = [
        { from: { r: 0, c: j - un.w }, to: { r: 0, c: j }, kind: better ? 'chosen' : 'source' },
      ]
      if (better) states[key(0, j - un.w)] = 'chosen'
      states[key(0, j)] = 'current'

      const src = items[un.itemIndex]
      const unitDesc =
        un.kind === 'multiple'
          ? `的 <b>${un.tag}</b>（含 ${un.count} 件原物 · 等效 w'=${un.w}, v'=${un.v}）`
          : `（w=${src.w}, v=${src.v}）`
      const caption =
        `物品 <b>${un.itemIndex + 1}</b>${unitDesc} · 本件按【<b>${KIND_CN[un.kind]}</b>】处理 → <b>${DIR_CN[un.direction]}</b> j=${j}：` +
        `f[${j - un.w}]+${un.v} = <b>${cand}</b> ${better ? '&gt;' : '≤'} f[${j}]=<b>${old}</b> → ${better ? `更新为 <b>${cand}</b>` : '不变'}。`
      // ★ formula 只含数学，禁中文（KaTeX 无 CJK 字形）。
      const formula = `f[${j}]=\\max(f[${j}],\\ f[${j - un.w}]+${un.v})=${better ? cand : old}`
      frames.push({ values: snap(), states, active: { r: 0, c: j }, arrows, caption, formula })
  }

  const fin = settled(snap())
  fin[key(0, W)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案 <b>f[${W}] = ${run.result.value}</b>：${units} 个转移单元依次做完，容量 ${W} 下的最大价值。同一维 f[j] 里，01 件至多一次、完全件可反复、多重件不超上限，各自的约束都由“循环方向/拆包”天然保证。`,
    formula: `f[${W}]=${run.result.value}`,
  })

  return {
    rows: 1,
    cols: W + 1,
    rowHeaderLabels: ['f'],
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}

/** 供工具条展示：本组混合物品展开成多少个转移单元。 */
export function unitCount(items: MixItem[]): number {
  return countMixedUnits(items)
}
