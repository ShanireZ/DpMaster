import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

export interface GItem {
  w: number
  v: number
}
export type Group = GItem[]

const NEG = -1e9

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 二维原型分组背包：f[g][j] = max( f[g-1][j]（本组一件都不选）,
 *   max_{组内第 k 件}( f[g-1][j-w_k] + v_k )（本组只选这一件） )
 * 关键：转移一律只从上一行 f[g-1][·] 取值——绝不从本行已更新的值来，
 * 这样每组至多贡献一件。第 g 行 = 前 g 组的最优。
 */
export function group2D(groups: Group[], W: number): VizModel {
  const G = groups.length
  const f: (number | null)[][] = Array.from({ length: G + 1 }, () => Array<number | null>(W + 1).fill(null))
  for (let j = 0; j <= W; j++) f[0][j] = 0
  const snap = () => f.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(f),
    caption: '<b>第 0 行</b>：一组都不考虑时，任何容量下最大价值都是 <b>0</b>（初始化的地基）。',
    formula: 'f[0][j] = 0',
  })

  for (let g = 1; g <= G; g++) {
    const items = groups[g - 1]
    for (let j = 0; j <= W; j++) {
      // 候选一：本组不选任何件 → 继承上一行同列
      const skip = f[g - 1][j] as number
      // 候选二：本组只选某一件 k（都从上一行取，保证每组 ≤1 件）
      let bestTake = NEG
      let takeIdx = -1 // 命中的组内件下标（用于高亮来源）
      for (let k = 0; k < items.length; k++) {
        const { w, v } = items[k]
        if (j >= w) {
          const cand = (f[g - 1][j - w] as number) + v
          if (cand > bestTake) {
            bestTake = cand
            takeIdx = k
          }
        }
      }
      const best = Math.max(skip, bestTake)
      f[g][j] = best

      const states = settled(f)
      const arrows: Arrow[] = []
      const takeWins = bestTake > skip && takeIdx >= 0

      // 「跳过本组」的来源：上一行同列
      states[key(g - 1, j)] = 'source'
      arrows.push({ from: { r: g - 1, c: j }, to: { r: g, c: j }, kind: takeWins ? 'source' : 'chosen' })
      // 「选本组某件」的来源：上一行 j-w 列
      if (takeIdx >= 0) {
        const w = items[takeIdx].w
        states[key(g - 1, j - w)] = 'source'
        arrows.push({ from: { r: g - 1, c: j - w }, to: { r: g, c: j }, kind: takeWins ? 'chosen' : 'source' })
      }
      if (takeWins) states[key(g - 1, j - items[takeIdx].w)] = 'chosen'
      else states[key(g - 1, j)] = 'chosen'
      states[key(g, j)] = 'current'

      const items_str = items.map((it, k) => `${k === takeIdx ? '★' : ''}(${it.w},${it.v})`).join(' ')
      let caption: string
      let formula: string
      if (takeIdx >= 0) {
        const { w, v } = items[takeIdx]
        caption =
          `组 <b>${g}</b> [${items_str}] · 容量 <b>${j}</b>：不选本组 = f[${g - 1}][${j}] = <b>${skip}</b>；` +
          `选组内 <b>(${w},${v})</b> = f[${g - 1}][${j - w}]+${v} = <b>${bestTake}</b> → 取较大者 <b>${best}</b>。`
        formula = `f[${g}][${j}]=\\max(${skip},\\ ${f[g - 1][j - w]}+${v})=${best}`
      } else {
        caption = `组 <b>${g}</b> [${items_str}] · 容量 <b>${j}</b>：组内没有件装得下（j 太小），只能不选本组 = <b>${skip}</b>。`
        formula = `f[${g}][${j}]=f[${g - 1}][${j}]=${skip}`
      }
      frames.push({ values: snap(), states, arrows, active: { r: g, c: j }, caption, formula })
    }
  }

  const fin = settled(f)
  fin[key(G, W)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案在右下角 <b>f[${G}][${W}] = ${f[G][W]}</b>——考虑全部 ${G} 组、容量 ${W}、每组至多取一件时的最大价值。`,
    formula: `f[${G}][${W}]=${f[G][W]}`,
  })

  return {
    rows: G + 1,
    cols: W + 1,
    cell: 40,
    rowHeaderLabels: Array.from({ length: G + 1 }, (_, g) => (g === 0 ? '∅' : `组${g}`)),
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}
