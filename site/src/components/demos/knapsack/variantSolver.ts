import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordCountKnapsack } from '../../../algorithms/knapsack-variant/internal.ts'
import type { CountKnapsackItem } from '../../../algorithms/knapsack-variant/index.ts'

export type CountItem = CountKnapsackItem

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 計數型 01 揹包 · 一維 f[j]「恰好裝滿容量 j 的方案數」。
 * 初值 f[0]=1（湊 0 有 1 種空方案，其餘 0），對每件倒序 f[j] += f[j-w]。
 * 把最值 max 換成累加 +，就把「求最優」變成了「數方案」。網格為一維（1 行 W+1 列）。
 */
export function countKnapsack(items: CountItem[], W: number): VizModel {
  const run = recordCountKnapsack(items, W)
  const f: (number | null)[] = Array<number | null>(W + 1).fill(0)
  f[0] = 1 // ★計數地基：湊出 0 有且只有 1 種方案（什麼都不裝）
  const snap = (): (number | null)[][] => [f.slice()]
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(snap()),
    caption:
      `初始：<b>f[0]=1</b>（凑出容量 0 有唯一一种方案，空方案），其余 f[j]=<b>0</b>（还没有物品可用，凑不出来）。` +
      `这一步取代了最优 DP 里的「全 0」地基。`,
    formula: 'f[0]=1,\\ f[j]=0\\ (j>0)',
  })

  for (const event of run.events) {
      if (event.type !== 'count-cell') continue
      const { itemIndex: i, weight: w, capacity: j, before: old, add, after: now } = event
      const grew = add > 0
      f[j] = now

      const states: Record<string, CellState> = settled(snap())
      const arrows: Arrow[] = [
        { from: { r: 0, c: j - w }, to: { r: 0, c: j }, kind: grew ? 'chosen' : 'source' },
      ]
      states[key(0, j - w)] = grew ? 'chosen' : 'source'
      states[key(0, j)] = 'current'

      const caption =
        `物品 <b>${i + 1}</b>（w=${w}）· <b>倒序</b> j=${j}：把「不含它、凑出 ${j - w} 的方案」接上它，` +
        `f[${j}] <b>+=</b> f[${j - w}]=<b>${add}</b> → f[${j}] 从 <b>${old}</b> 变为 <b>${now}</b>` +
        `${grew ? '' : '（f[' + (j - w) + ']=0，暂无新方案，保持不变）'}。`
      // ★formula 內禁中文，純符號表達「+=」這一步
      const formula = `f[${j}]\\mathrel{+}=f[${j - w}]=${old}+${add}=${now}`
      frames.push({ values: snap(), states, active: { r: 0, c: j }, arrows, caption, formula })
  }

  const fin = settled(snap())
  fin[key(0, W)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `答案 <b>f[${W}] = ${run.result.count}</b>：恰好装满容量 ${W} 的方案共 <b>${run.result.count}</b> 种。` +
      `全程没有一次 max，只有一层层累加，把每种能凑出 ${W} 的组合数了个遍。`,
    formula: `f[${W}]=${run.result.count}`,
  })

  return {
    rows: 1,
    cols: W + 1,
    rowHeaderLabels: ['f'],
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}
