import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordZeroOneKnapsack } from '../../../algorithms/knapsack/internal.ts'
import type { KnapsackItem } from '../../../algorithms/knapsack/index.ts'

export type Item = KnapsackItem

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/** 二维原型 01 背包：f[i][j] = max(f[i-1][j], f[i-1][j-w]+v) */
export function knapsack2D(items: Item[], W: number): VizModel {
  const n = items.length
  const run = recordZeroOneKnapsack(items, W)
  const f: (number | null)[][] = Array.from({ length: n + 1 }, () => Array<number | null>(W + 1).fill(null))
  for (let j = 0; j <= W; j++) f[0][j] = 0
  const snap = () => f.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(f),
    caption: '<b>第 0 行</b>：一件物品都不考虑时，任何容量下最大价值都是 <b>0</b>（初始化）。',
    formula: 'f[0][j] = 0',
  })

  for (const event of run.events) {
    const { itemIndex: i, capacity: j, item, notTake, take, best, takeBetter } = event
    const { w, v } = item
    const canTake = take !== null
    f[i][j] = best

    const states = settled(f)
    const arrows: Arrow[] = []
    states[key(i - 1, j)] = 'source'
    arrows.push({ from: { r: i - 1, c: j }, to: { r: i, c: j }, kind: takeBetter ? 'source' : 'chosen' })
    if (canTake) {
      states[key(i - 1, j - w)] = 'source'
      arrows.push({ from: { r: i - 1, c: j - w }, to: { r: i, c: j }, kind: takeBetter ? 'chosen' : 'source' })
    }
    if (takeBetter) states[key(i - 1, j - w)] = 'chosen'
    else states[key(i - 1, j)] = 'chosen'
    states[key(i, j)] = 'current'

    const caption = canTake
      ? `物品 <b>${i}</b>（w=${w}, v=${v}）· 容量 <b>${j}</b>：不取 = f[${i - 1}][${j}] = <b>${notTake}</b>；取 = f[${i - 1}][${j - w}]+${v} = <b>${take}</b> → 取较大者 <b>${best}</b>。`
      : `物品 <b>${i}</b>（w=${w}）· 容量 <b>${j}</b>：装不下（${j} &lt; ${w}），只能不取 = <b>${notTake}</b>。`
    const formula = canTake
      ? `f[${i}][${j}]=\\max(${notTake},\\ ${(take as number) - v}+${v})=${best}`
      : `f[${i}][${j}]=f[${i - 1}][${j}]=${notTake}`
    frames.push({ values: snap(), states, arrows, active: { r: i, c: j }, caption, formula })
  }

  const fin = settled(f)
  fin[key(n, W)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案在右下角 <b>f[${n}][${W}] = ${run.result.value}</b>——考虑全部 ${n} 件、容量 ${W} 时的最大价值。`,
    formula: `f[${n}][${W}]=${run.result.value}`,
  })

  return {
    rows: n + 1,
    cols: W + 1,
    rowHeaderLabels: Array.from({ length: n + 1 }, (_, i) => (i === 0 ? '∅' : `${i}`)),
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}

export type Mode1D = 'reverse' | 'forward' | 'complete'

/** 一维滚动数组。reverse=01逆推(正确) · forward=01顺推(制造重复取的 bug) · complete=完全背包正推(正确) */
export function knapsack1D(items: Item[], W: number, mode: Mode1D): VizModel {
  const f: (number | null)[] = Array<number | null>(W + 1).fill(0)
  const snap = (): (number | null)[][] => [f.slice()]
  const frames: Frame[] = []
  const forward = mode !== 'reverse'

  frames.push({
    values: snap(),
    states: settled(snap()),
    caption: '初始：容量 0…W 的最大价值都是 <b>0</b>（空背包）。',
    formula: 'f[j]=0',
  })

  for (let i = 1; i <= items.length; i++) {
    const { w, v } = items[i - 1]
    const updated = new Set<number>() // 本轮已被更新的下标（用于揭示顺推 bug）
    const range: number[] = []
    if (forward) for (let j = w; j <= W; j++) range.push(j)
    else for (let j = W; j >= w; j--) range.push(j)

    for (const j of range) {
      const old = f[j] as number
      const from = f[j - w] as number
      const cand = from + v
      const better = cand > old
      const reused = forward && mode !== 'complete' && updated.has(j - w)
      if (better) f[j] = cand

      const states: Record<string, CellState> = settled(snap())
      states[key(0, j - w)] = 'source'
      const arrows: Arrow[] = [
        { from: { r: 0, c: j - w }, to: { r: 0, c: j }, kind: better ? 'chosen' : 'source' },
      ]
      if (better) states[key(0, j - w)] = reused ? 'invalid' : 'chosen'
      states[key(0, j)] = 'current'

      let caption =
        `物品 <b>${i}</b>（w=${w}, v=${v}）· <b>${forward ? '正' : '逆'}推</b> j=${j}：` +
        `f[${j - w}]+${v} = <b>${cand}</b> ${better ? '&gt;' : '≤'} f[${j}]=<b>${old}</b> → ${better ? `更新为 <b>${cand}</b>` : '不变'}。`
      if (reused && better) {
        caption += ` <span style="color:var(--viz-invalid)">⚠ f[${j - w}] 本轮已被物品 ${i} 更新过——物品 ${i} 被<b>重复计入</b>！这正是 01 背包顺推的 bug。</span>`
      }
      if (better) updated.add(j)

      frames.push({ values: snap(), states, active: { r: 0, c: j }, arrows, caption })
    }
  }

  const fin = settled(snap())
  fin[key(0, W)] = 'chosen'
  const note =
    mode === 'forward'
      ? `顺推得到 <b>f[${W}] = ${f[W]}</b>——若这里比逆推大，说明有物品被重复取了（错误）。`
      : mode === 'complete'
        ? `完全背包答案 <b>f[${W}] = ${f[W]}</b>：正推让同一物品可被多次计入，正是我们想要的。`
        : `逆推答案 <b>f[${W}] = ${f[W]}</b>：每件至多取一次，正确。`
  frames.push({ values: snap(), states: fin, caption: note, formula: `f[${W}]=${f[W]}` })

  return {
    rows: 1,
    cols: W + 1,
    rowHeaderLabels: ['f'],
    colHeaderLabels: Array.from({ length: W + 1 }, (_, j) => `${j}`),
    frames,
  }
}
