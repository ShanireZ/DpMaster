import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 最大正方形：dp[i][j] = 以 (i,j) 为右下角的、全为 1 的最大正方形边长。
 *   g[i][j]==1 时 dp[i][j] = min( dp[i-1][j], dp[i][j-1], dp[i-1][j-1] ) + 1；
 *   g[i][j]==0 时 dp[i][j] = 0（此格当不了任何正方形的右下角）。
 * 三个来源（上 / 左 / 左上）取 min：短板决定能扩多大——任一方向缺一格，正方形就撑不起来。
 * 逐格填表，高亮三来源并标出最短板；答案 = 全表最大 dp 值（其平方为面积）。
 */
export function maxSquare2D(g: number[][]): VizModel {
  const R = g.length
  const C = g[0].length
  const dp: (number | null)[][] = Array.from({ length: R }, () => Array<number | null>(C).fill(null))
  const snap = (): (number | null)[][] => dp.map((row) => row.slice())
  const frames: Frame[] = []

  let best = 0
  let bi = -1
  let bj = -1

  frames.push({
    values: snap(),
    states: {},
    caption:
      '<b>准备</b>：给的是一张 0/1 矩阵。要为<b>每一格</b>算出「以它为<b>右下角</b>、全是 1 的最大正方形边长」dp[i][j]。0 格当不了右下角，直接记 0。',
    formula: 'dp[i][j]=\\min(dp[i-1][j],\\ dp[i][j-1],\\ dp[i-1][j-1])+1\\quad(g[i][j]=1)',
  })

  for (let i = 0; i < R; i++) {
    for (let j = 0; j < C; j++) {
      const states = settled(dp)
      const arrows: Arrow[] = []

      if (g[i][j] === 0) {
        dp[i][j] = 0
        states[key(i, j)] = 'invalid'
        frames.push({
          values: snap(),
          states,
          active: { r: i, c: j },
          caption: `格 <b>(${i},${j})</b> 本身是 <b>0</b>：它当不了任何全 1 正方形的右下角，<b>dp[${i}][${j}] = 0</b>。`,
          formula: `dp[${i}][${j}]=0\\ (g=0)`,
        })
        continue
      }

      // g==1
      if (i === 0 || j === 0) {
        dp[i][j] = 1
        states[key(i, j)] = 'current'
        frames.push({
          values: snap(),
          states,
          active: { r: i, c: j },
          caption: `格 <b>(${i},${j})</b> 在<b>首行 / 首列</b>：上方或左方越界，最多只能是 <b>1×1</b>，<b>dp[${i}][${j}] = 1</b>。`,
          formula: `dp[${i}][${j}]=1\\quad(i=0\\ \\lor\\ j=0)`,
        })
        if (dp[i][j]! > best) {
          best = dp[i][j] as number
          bi = i
          bj = j
        }
        continue
      }

      const up = dp[i - 1][j] as number // 上
      const left = dp[i][j - 1] as number // 左
      const ul = dp[i - 1][j - 1] as number // 左上
      const m = Math.min(up, left, ul)
      dp[i][j] = m + 1

      // 三来源都标 source，最短板（决定结果的那个）标 chosen
      const srcs: Array<{ r: number; c: number; v: number }> = [
        { r: i - 1, c: j, v: up },
        { r: i, c: j - 1, v: left },
        { r: i - 1, c: j - 1, v: ul },
      ]
      let minPicked = false
      for (const s of srcs) {
        const isMin = !minPicked && s.v === m
        if (isMin) minPicked = true
        states[key(s.r, s.c)] = isMin ? 'chosen' : 'source'
        arrows.push({ from: { r: s.r, c: s.c }, to: { r: i, c: j }, kind: isMin ? 'chosen' : 'source' })
      }
      states[key(i, j)] = 'current'

      frames.push({
        values: snap(),
        states,
        active: { r: i, c: j },
        arrows,
        caption:
          `格 <b>(${i},${j})</b>（本身 = 1）：上 dp[${i - 1}][${j}] = <b>${up}</b>，左 dp[${i}][${j - 1}] = <b>${left}</b>，` +
          `左上 dp[${i - 1}][${j - 1}] = <b>${ul}</b> → 取<b>最短板 ${m}</b>，加 1 = <b>${m + 1}</b>。`,
        formula: `dp[${i}][${j}]=\\min(${up},${left},${ul})+1=${m + 1}`,
      })

      if (dp[i][j]! > best) {
        best = dp[i][j] as number
        bi = i
        bj = j
      }
    }
  }

  // 收尾：点亮最大正方形所占的 best×best 个格子
  const fin = settled(dp)
  if (bi >= 0) {
    for (let r = bi - best + 1; r <= bi; r++)
      for (let c = bj - best + 1; c <= bj; c++) fin[key(r, c)] = 'chosen'
    fin[key(bi, bj)] = 'current'
  }
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `全表最大 dp 值是 <b>${best}</b>（在右下角 (${bi},${bj})），对应一个 <b>${best}×${best}</b> 的全 1 正方形——` +
      `面积 = <b>${best * best}</b>。高亮的方块就是它占的格子。`,
    formula: `\\text{max side}=${best},\\quad \\text{area}=${best}^2=${best * best}`,
  })

  return {
    rows: R,
    cols: C,
    cell: 42,
    rowHeaderLabels: Array.from({ length: R }, (_, i) => `${i}`),
    colHeaderLabels: Array.from({ length: C }, (_, j) => `${j}`),
    rowHeaderTitle: '行',
    colHeaderTitle: '列',
    frames,
  }
}
