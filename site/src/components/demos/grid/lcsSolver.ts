import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

export interface LcsResult {
  model: VizModel
  len: number
  lcs: string
}

/**
 * 二维最长公共子序列填表 + 回溯：
 *   dp[i][j] = 前 i 个 A 字符与前 j 个 B 字符的 LCS 长度。
 *   末位相等 A[i-1]==B[j-1]：dp[i][j] = dp[i-1][j-1] + 1（左上来）。
 *   否则：dp[i][j] = max(dp[i-1][j], dp[i][j-1])（上、左取大）。
 * 网格第 0 行 / 第 0 列是「空串」哨兵，恒为 0。填完后从右下角沿转移来路回溯，
 * 斜向（相等）那一步就摘下一个公共字符，逆序拼出一条 LCS。
 */
export function lcs2D(A: string, B: string): LcsResult {
  const m = A.length
  const n = B.length
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, () => Array<number | null>(n + 1).fill(null))
  for (let j = 0; j <= n; j++) dp[0][j] = 0
  for (let i = 0; i <= m; i++) dp[i][0] = 0
  const snap = () => dp.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(dp),
    caption:
      '<b>第 0 行、第 0 列</b>是「空串」的地基：任何一串与空串的公共子序列长度都是 <b>0</b>。' +
      '接下来从左上到右下逐格填 dp[i][j]——只看两串<b>当前末位</b>那一个字符。',
    formula: 'dp[i][0]=dp[0][j]=0',
  })

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const eq = A[i - 1] === B[j - 1]
      const diag = dp[i - 1][j - 1] as number
      const up = dp[i - 1][j] as number
      const left = dp[i][j - 1] as number

      const states = settled(dp)
      const arrows: Arrow[] = []
      let caption: string
      let formula: string

      if (eq) {
        dp[i][j] = diag + 1
        states[key(i - 1, j - 1)] = 'chosen'
        arrows.push({ from: { r: i - 1, c: j - 1 }, to: { r: i, c: j }, kind: 'chosen' })
        caption =
          `格 <b>dp[${i}][${j}]</b>：A 的第 ${i} 位 <b>${A[i - 1]}</b> 与 B 的第 ${j} 位 <b>${B[j - 1]}</b> <b>相等</b>——` +
          `把这对配上，各退一格接着比，长度 = 左上 dp[${i - 1}][${j - 1}] + 1 = ${diag}+1 = <b>${diag + 1}</b>。`
        formula = `dp[${i}][${j}]=dp[${i - 1}][${j - 1}]{+}1=${diag}{+}1=${diag + 1}`
      } else {
        const best = Math.max(up, left)
        dp[i][j] = best
        const upWins = up >= left
        // 两个来源都标出，胜者 chosen
        states[key(i - 1, j)] = upWins ? 'chosen' : 'source'
        states[key(i, j - 1)] = upWins ? 'source' : 'chosen'
        arrows.push({ from: { r: i - 1, c: j }, to: { r: i, c: j }, kind: upWins ? 'chosen' : 'source' })
        arrows.push({ from: { r: i, c: j - 1 }, to: { r: i, c: j }, kind: upWins ? 'source' : 'chosen' })
        caption =
          `格 <b>dp[${i}][${j}]</b>：A 末位 <b>${A[i - 1]}</b> ≠ B 末位 <b>${B[j - 1]}</b>——这一对配不上，` +
          `至少丢掉其中一个：上 dp[${i - 1}][${j}] = <b>${up}</b>，左 dp[${i}][${j - 1}] = <b>${left}</b>，取较大的 <b>${best}</b>。`
        formula = `dp[${i}][${j}]=\\max(${up},\\ ${left})=${best}`
      }
      states[key(i, j)] = 'current'
      frames.push({ values: snap(), states, active: { r: i, c: j }, arrows, caption, formula })
    }
  }

  const len = dp[m][n] as number

  // 回溯：从 (m,n) 沿来路走回 (0,0)，相等时斜向并摘字符。
  const pathCells: [number, number][] = []
  const diagCells: [number, number][] = []
  let ci = m
  let cj = n
  const picked: string[] = []
  while (ci > 0 && cj > 0) {
    pathCells.push([ci, cj])
    if (A[ci - 1] === B[cj - 1]) {
      diagCells.push([ci, cj])
      picked.push(A[ci - 1])
      ci--
      cj--
    } else if ((dp[ci - 1][cj] as number) >= (dp[ci][cj - 1] as number)) {
      ci--
    } else {
      cj--
    }
  }
  const lcs = picked.reverse().join('')

  // 回溯定稿帧：高亮整条路径，斜向格标绿。
  const fin = settled(dp)
  for (const [r, c] of pathCells) fin[key(r, c)] = 'source'
  for (const [r, c] of diagCells) fin[key(r, c)] = 'chosen'
  fin[key(m, n)] = 'chosen'
  const backArrows: Arrow[] = []
  for (let k = 0; k + 1 < pathCells.length; k++) {
    const [r0, c0] = pathCells[k]
    const [r1, c1] = pathCells[k + 1]
    backArrows.push({ from: { r: r1, c: c1 }, to: { r: r0, c: c0 }, kind: 'chosen' })
  }
  frames.push({
    values: snap(),
    states: fin,
    arrows: backArrows,
    caption:
      `右下角 <b>dp[${m}][${n}] = ${len}</b> 就是 LCS 长度。<b>回溯</b>：从这里沿来路走回左上，` +
      `每遇到一步<b>斜向</b>（当初是「相等」填的）就摘下那个字符——逆序拼起来得到一条 LCS：<b>${lcs || '（空）'}</b>。`,
    formula: `\\text{LCS}=dp[${m}][${n}]=${len}`,
  })

  const model: VizModel = {
    rows: m + 1,
    cols: n + 1,
    cell: 42,
    rowHeaderLabels: ['∅', ...A.split('')],
    colHeaderLabels: ['∅', ...B.split('')],
    frames,
  }
  return { model, len, lcs }
}
