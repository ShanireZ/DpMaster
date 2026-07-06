import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

export type Opt = 'min' | 'max'

// 只把「已算出（非 null）」的格标为 settled；下三角恒为 null（.blank 灰底空白）。
function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 区间 DP 三角表：dp[l][r] = 把石子 l..r 合并成一堆的最优代价。
 *   dp[l][l] = 0；dp[l][r] = opt_{k∈[l,r-1]}( dp[l][k] + dp[k+1][r] ) + sum(a[l..r])。
 * ★按区间长度 len = 2..n 递推——短区间先算好，长区间才能引用其子区间。
 *   网格：行 l、列 r，只用上三角（l ≤ r），下三角留 null 渲染成空白。
 *   opt='min' 求最小合并代价（P1880 一问）；opt='max' 求最大（另一问）。
 */
export function stoneMerge(a: number[], opt: Opt = 'min'): VizModel {
  const n = a.length
  // 前缀和：sum(l..r) = pre[r+1] - pre[l]
  const pre = new Array<number>(n + 1).fill(0)
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i]
  const rangeSum = (l: number, r: number) => pre[r + 1] - pre[l]

  const better = (x: number, y: number) => (opt === 'min' ? x < y : x > y)
  const optWord = opt === 'min' ? '最小' : '最大'
  const optFn = opt === 'min' ? '\\min' : '\\max'

  // 只用上三角：dp[l][r]，l ≤ r；其余保持 null。
  const dp: (number | null)[][] = Array.from({ length: n }, () => Array<number | null>(n).fill(null))
  for (let l = 0; l < n; l++) dp[l][l] = 0
  const snap = () => dp.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(dp),
    caption:
      '<b>对角线（区间长度 1）</b>：单独一堆石子无需合并，代价为 <b>0</b>——dp[l][l]=0。' +
      '下三角（l&gt;r）不是合法区间，留作空白。这是整张三角表的地基。',
    formula: 'dp[l][l] = 0',
  })

  // ★外层枚举区间长度，由短到长
  for (let len = 2; len <= n; len++) {
    for (let l = 0; l + len - 1 < n; l++) {
      const r = l + len - 1
      const s = rangeSum(l, r)
      let bestVal = opt === 'min' ? Infinity : -Infinity
      let bestK = l
      for (let k = l; k <= r - 1; k++) {
        const cand = (dp[l][k] as number) + (dp[k + 1][r] as number)
        if (better(cand, bestVal)) {
          bestVal = cand
          bestK = k
        }
      }
      dp[l][r] = bestVal + s

      // —— 高亮：当前格 dp[l][r]、被选分割点 k 的两个来源 dp[l][k] 与 dp[k+1][r]
      const states = settled(dp)
      const arrows: Arrow[] = []
      states[key(l, bestK)] = 'chosen'
      states[key(bestK + 1, r)] = 'chosen'
      arrows.push({ from: { r: l, c: bestK }, to: { r: l, c: r }, kind: 'chosen' })
      arrows.push({ from: { r: bestK + 1, c: r }, to: { r: l, c: r }, kind: 'chosen' })
      states[key(l, r)] = 'current'

      const splits = []
      for (let k = l; k <= r - 1; k++) {
        const cand = (dp[l][k] as number) + (dp[k + 1][r] as number)
        splits.push(`${k === bestK ? '★' : ''}${cand}`)
      }
      const caption =
        `区间 <b>[${l},${r}]</b>（长度 ${len}，区间和=${s}）：枚举分割点 k，` +
        `候选 dp[l][k]+dp[k+1][r] = {${splits.join(', ')}}，取${optWord} <b>${bestVal}</b>，` +
        `再加区间和 ${s} → dp[${l}][${r}] = <b>${dp[l][r]}</b>（在 k=${bestK} 处断开）。`
      const formula =
        `dp[${l}][${r}]=${optFn}_{k}(dp[${l}][k]+dp[k{+}1][${r}])+${s}` +
        `=${bestVal}+${s}=${dp[l][r]}`
      frames.push({ values: snap(), states, arrows, active: { r: l, c: r }, caption, formula })
    }
  }

  const fin = settled(dp)
  fin[key(0, n - 1)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `答案在<b>右上角 dp[0][${n - 1}] = ${dp[0][n - 1]}</b>——把全部 ${n} 堆石子合并成一堆的${optWord}总代价。` +
      `三角表沿对角线一层层向右上填满。`,
    formula: `dp[0][${n - 1}]=${dp[0][n - 1]}`,
  })

  return {
    rows: n,
    cols: n,
    cell: 40,
    rowHeaderLabels: Array.from({ length: n }, (_, l) => `l=${l}`),
    colHeaderLabels: Array.from({ length: n }, (_, r) => `r=${r}`),
    frames,
  }
}
