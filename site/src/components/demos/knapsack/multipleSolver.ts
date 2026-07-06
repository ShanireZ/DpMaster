import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

export interface MultiItem {
  w: number
  v: number
  m: number // 件数上限
}

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/** 一个「打包件」：由 cnt 件原物品捆成，等效重量 w=cnt·w0、价值 v=cnt·v0。 */
export interface Pack {
  itemIdx: number // 来自第几种原物品（0-based）
  cnt: number // 捆了几件原物
  w: number // 等效重量
  v: number // 等效价值
  label: string // 二进制标签，如 "×1" "×2" "×余3"
}

/** 把件数上限 m 二进制拆分成若干打包件：1,2,4,…,以及余数。 */
export function binarySplit(items: MultiItem[]): Pack[] {
  const packs: Pack[] = []
  for (let i = 0; i < items.length; i++) {
    const { w, v, m } = items[i]
    let rest = m
    let k = 1
    while (k < rest) {
      packs.push({ itemIdx: i, cnt: k, w: k * w, v: k * v, label: `×${k}` })
      rest -= k
      k <<= 1
    }
    if (rest > 0) {
      packs.push({ itemIdx: i, cnt: rest, w: rest * w, v: rest * v, label: `×余${rest}` })
    }
  }
  return packs
}

/** 朴素打包数（Σmᵢ）与二进制打包数（Σ⌈log₂(mᵢ+1)⌉）——供工具条对比。 */
export function packCounts(items: MultiItem[]): { naive: number; binary: number } {
  let naive = 0
  let binary = 0
  for (const it of items) {
    naive += it.m
    let rest = it.m
    let k = 1
    while (k < rest) {
      binary++
      rest -= k
      k <<= 1
    }
    if (rest > 0) binary++
  }
  return { naive, binary }
}

/**
 * 多重背包 · 二进制拆分 + 一维 01 倒序。
 * 把每种物品拆成若干打包件，每包当一件做 01 背包（倒序，保证一包至多用一次）。
 * 网格为一维（1 行 W+1 列）。
 */
export function multipleKnapsack(items: MultiItem[], W: number): VizModel {
  const packs = binarySplit(items)
  const f: (number | null)[] = Array<number | null>(W + 1).fill(0)
  const snap = (): (number | null)[][] => [f.slice()]
  const frames: Frame[] = []

  const cnts = packCounts(items)
  frames.push({
    values: snap(),
    states: settled(snap()),
    caption:
      `初始：容量 0…${W} 下最大价值都是 <b>0</b>（空背包）。` +
      `本例把 ${items.length} 种物品拆成 <b>${packs.length}</b> 个打包件` +
      `（朴素需 <b>${cnts.naive}</b> 件、二进制仅 <b>${cnts.binary}</b> 件）。`,
    formula: 'f[j]=0',
  })

  for (let p = 0; p < packs.length; p++) {
    const pk = packs[p]
    // 倒序：j 从 W 到 pk.w，保证这一「包」至多被用一次（就是 01 背包的逆推）。
    for (let j = W; j >= pk.w; j--) {
      const old = f[j] as number
      const from = f[j - pk.w] as number
      const cand = from + pk.v
      const better = cand > old
      if (better) f[j] = cand

      const states: Record<string, CellState> = settled(snap())
      states[key(0, j - pk.w)] = 'source'
      const arrows: Arrow[] = [
        { from: { r: 0, c: j - pk.w }, to: { r: 0, c: j }, kind: better ? 'chosen' : 'source' },
      ]
      if (better) states[key(0, j - pk.w)] = 'chosen'
      states[key(0, j)] = 'current'

      const orig = items[pk.itemIdx]
      const caption =
        `物品 <b>${pk.itemIdx + 1}</b> 的打包件 <b>${pk.label}</b>` +
        `（含 <b>${pk.cnt}</b> 件原物 · 等效 w'=${pk.w}, v'=${pk.v}，源自 w=${orig.w},v=${orig.v}）· <b>倒序</b> j=${j}：` +
        `f[${j - pk.w}]+${pk.v} = <b>${cand}</b> ${better ? '&gt;' : '≤'} f[${j}]=<b>${old}</b> → ${better ? `更新为 <b>${cand}</b>` : '不变'}。`
      const formula = `f[${j}]=\\max(f[${j}],\\ f[${j - pk.w}]+${pk.v})=${better ? cand : old}`
      frames.push({ values: snap(), states, active: { r: 0, c: j }, arrows, caption, formula })
    }
  }

  const fin = settled(snap())
  fin[key(0, W)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案 <b>f[${W}] = ${f[W]}</b>：${packs.length} 个打包件全部做完 01 转移后，容量 ${W} 下的最大价值。每种物品的取用件数都不超过它的上限。`,
    formula: `f[${W}]=${f[W]}`,
  })

  return {
    rows: 1,
    cols: W + 1,
    rowHeaderLabels: ['f'],
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}
