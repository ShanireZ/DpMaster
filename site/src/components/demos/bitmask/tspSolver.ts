import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

const INF = 1e9

/** 把 mask 渲染成定长二进制串（最高位在左），供行表头显示。 */
export function maskBits(mask: number, n: number): string {
  let s = ''
  for (let i = n - 1; i >= 0; i--) s += (mask >> i) & 1
  return s
}

const has = (mask: number, i: number) => ((mask >> i) & 1) === 1

/**
 * 最短 Hamilton 路径（开环 TSP，P10447 模型）的逐步求解器。
 * dp[S][i] = 从点 0 出发、恰好走过集合 S 中的点、当前停在 i 的最短路径长。
 * 状态天然二维 → 直接铺成网格：行 = mask（0..2ⁿ−1），列 = 当前点 i。
 * 为控制演示规模，n 建议 4~5。dist 为对称距离矩阵。
 */
export function tspHamilton(n: number, dist: number[][]): VizModel {
  const full = 1 << n
  const dp: number[][] = Array.from({ length: full }, () => Array<number>(n).fill(INF))
  dp[1][0] = 0 // 只到过点 0、停在点 0，路径长 0

  // 网格取值：INF 显示为空白（null）
  const grid = (): (number | null)[][] =>
    dp.map((row) => row.map((v) => (v >= INF ? null : v)))

  const settledStates = (): Record<string, CellState> => {
    const s: Record<string, CellState> = {}
    for (let m = 0; m < full; m++)
      for (let i = 0; i < n; i++) if (dp[m][i] < INF) s[key(m, i)] = 'settled'
    return s
  }

  const frames: Frame[] = []

  frames.push({
    values: grid(),
    states: (() => {
      const st = settledStates()
      st[key(1, 0)] = 'chosen'
      return st
    })(),
    caption: '<b>起点</b>：dp[0001][0] = 0——只到过点 0、就停在点 0，路程为 0。其余状态先视作不可达（空白）。',
    formula: 'dp[\\{0\\}][0]=0',
  })

  // 按 mask 递增枚举（保证子状态先算好）
  for (let mask = 1; mask < full; mask++) {
    if (!has(mask, 0)) continue // 起点 0 必在集合内
    for (let i = 0; i < n; i++) {
      if (!has(mask, i)) continue
      if (dp[mask][i] >= INF) continue
      const base = dp[mask][i]
      for (let j = 0; j < n; j++) {
        if (has(mask, j)) continue // j 必须是尚未访问的点
        const nmask = mask | (1 << j)
        const cand = base + dist[i][j]
        const better = cand < dp[nmask][j]
        if (better) dp[nmask][j] = cand

        const states = settledStates()
        states[key(mask, i)] = 'source'
        states[key(nmask, j)] = 'current'
        const arrows: Arrow[] = [{ from: { r: mask, c: i }, to: { r: nmask, c: j }, kind: better ? 'chosen' : 'source' }]
        const caption =
          `从 dp[${maskBits(mask, n)}][${i}] = <b>${base}</b> 出发，走向未访问点 <b>${j}</b>：` +
          `新路程 = ${base} + dist(${i},${j})=${dist[i][j]} = <b>${cand}</b> ` +
          `${better ? `&lt; 原值，更新 dp[${maskBits(nmask, n)}][${j}] = <b>${cand}</b>` : `≥ 原值 ${dp[nmask][j]}，不更新`}。`
        const formula = `dp[S\\cup\\{${j}\\}][${j}]=\\min(\\cdot,\\ dp[S][${i}]+d_{${i}${j}})`
        frames.push({ values: grid(), states, active: { r: nmask, c: j }, arrows, caption, formula })
      }
    }
  }

  // 终态：走遍全集，停在任意点取最小
  let best = INF
  let bestI = 0
  for (let i = 0; i < n; i++)
    if (dp[full - 1][i] < best) {
      best = dp[full - 1][i]
      bestI = i
    }
  frames.push({
    values: grid(),
    states: (() => {
      const st = settledStates()
      st[key(full - 1, bestI)] = 'chosen'
      return st
    })(),
    caption: `<b>答案</b>：走遍全部 ${n} 个点后，末行 dp[${maskBits(full - 1, n)}][·] 里最小的是 <b>${best}</b>（停在点 ${bestI}）——最短 Hamilton 路径长度。`,
    formula: `\\min_i dp[2^${n}-1][i]=${best}`,
  })

  return {
    rows: full,
    cols: n,
    cell: 44,
    rowHeaderLabels: Array.from({ length: full }, (_, m) => maskBits(m, n)),
    colHeaderLabels: Array.from({ length: n }, (_, i) => `${i}`),
    frames,
  }
}
