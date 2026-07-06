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
 * 环形石子合并（断环为链）三角表：
 *   把环上 n 堆 a[0..n-1] 复制一倍成 a2[0..2n-1]（a2[i]=a[i%n]），在 2n 长的链上跑标准区间 DP：
 *   dp[l][r] = opt_{k∈[l,r-1]}( dp[l][k] + dp[k+1][r] ) + sum(a2[l..r])。
 *   环形答案 = 枚举所有长度为 n 的窗口 [i,i+n-1]（i=0..n-1），取其中 dp[i][i+n-1] 的最优。
 * ★仍按区间长度 len 由短到长递推；网格是 2n × 2n 的上三角。opt='min' 求最小、'max' 求最大合并代价。
 */
export function ringMerge(a: number[], opt: Opt = 'min'): VizModel {
  const n = a.length
  const m = 2 * n
  const a2 = Array.from({ length: m }, (_, i) => a[i % n])
  // 前缀和：sum(l..r) = pre[r+1] - pre[l]
  const pre = new Array<number>(m + 1).fill(0)
  for (let i = 0; i < m; i++) pre[i + 1] = pre[i] + a2[i]
  const rangeSum = (l: number, r: number) => pre[r + 1] - pre[l]

  const better = (x: number, y: number) => (opt === 'min' ? x < y : x > y)
  const optWord = opt === 'min' ? '最小' : '最大'
  const optFn = opt === 'min' ? '\\min' : '\\max'

  // 只用上三角：dp[l][r]，l ≤ r；其余保持 null。
  const dp: (number | null)[][] = Array.from({ length: m }, () => Array<number | null>(m).fill(null))
  for (let l = 0; l < m; l++) dp[l][l] = 0
  const snap = () => dp.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(dp),
    caption:
      `<b>断环为链</b>：把环上 ${n} 堆复制一倍，接成长度 <b>2n=${m}</b> 的链 a2（a2[i]=a[i%${n}]），` +
      '再在这条链上跑<b>普通区间 DP</b>。对角线是长度 1，dp[l][l]=0——整张三角表的地基。',
    formula: 'a2[i]=a[i \\bmod n],\\quad dp[l][l]=0',
  })

  // ★外层枚举区间长度，由短到长（长度只需到 n，够覆盖所有环形窗口）
  for (let len = 2; len <= n; len++) {
    for (let l = 0; l + len - 1 < m; l++) {
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

      const isWindow = len === n && l <= n - 1
      const winTag = isWindow ? `（这是一个长度 ${n} 的<b>环形窗口</b>，起点 ${l}）` : ''
      const caption =
        `区间 <b>[${l},${r}]</b>（长度 ${len}，区间和=${s}）：枚举分割点 k，取${optWord} <b>${bestVal}</b>，` +
        `再加区间和 ${s} → dp[${l}][${r}] = <b>${dp[l][r]}</b>（在 k=${bestK} 处断开）。${winTag}`
      const formula =
        `dp[${l}][${r}]=${optFn}_{k}(dp[${l}][k]+dp[k{+}1][${r}])+${s}` +
        `=${bestVal}+${s}=${dp[l][r]}`
      frames.push({ values: snap(), states, arrows, active: { r: l, c: r }, caption, formula })
    }
  }

  // —— 收尾帧：把 n 个长度-n 窗口 dp[i][i+n-1] 一并高亮，取最优即环形答案。
  const winVals: number[] = []
  for (let i = 0; i < n; i++) winVals.push(dp[i][i + n - 1] as number)
  let ansIdx = 0
  for (let i = 1; i < n; i++) if (better(winVals[i], winVals[ansIdx])) ansIdx = i
  const ans = winVals[ansIdx]

  const fin = settled(dp)
  for (let i = 0; i < n; i++) fin[key(i, i + n - 1)] = 'source'
  fin[key(ansIdx, ansIdx + n - 1)] = 'chosen'
  const winList = winVals.map((v, i) => `${i === ansIdx ? '★' : ''}dp[${i}][${i + n - 1}]=${v}`)
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `扫描 ${n} 个长度为 ${n} 的窗口：{ ${winList.join(', ')} }，取${optWord} → <b>环形答案 = ${ans}</b>` +
      `（起点 ${ansIdx}，即从第 ${ansIdx} 堆开始的那种断法）。链上任一整圈都被某个窗口覆盖，故答案不漏。`,
    formula: `\\mathrm{ans}=${optFn}_{0\\le i<${n}} dp[i][i{+}${n}{-}1]=${ans}`,
  })

  return {
    rows: m,
    cols: m,
    cell: 38,
    rowHeaderLabels: Array.from({ length: m }, (_, l) => `l=${l}`),
    colHeaderLabels: Array.from({ length: m }, (_, r) => `r=${r}`),
    frames,
  }
}
