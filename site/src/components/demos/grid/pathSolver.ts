import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 数字三角形（自底向上填表）：f[i][j] = a[i][j] + max( f[i+1][j], f[i+1][j+1] )。
 * 最底行 f[n-1][·] = a[n-1][·] 直接落地；往上每格从「正下方」与「右下方」两个来源取 max。
 * 演示用网格：把三角形按行左对齐嵌进 (行)×(行) 的方阵，右上三角为空白（null）。
 * 逐帧从最底行往上，逐格高亮两个下方来源并标出胜者。答案在顶点 f[0][0]。
 */
export function triangle2D(tri: number[][]): VizModel {
  const n = tri.length
  // f 与三角同形：f[i] 有 i+1 个元素。渲染网格是 n×n，第 i 行只填 0..i 列，右上三角恒空。
  const f: (number | null)[][] = Array.from({ length: n }, () => Array<number | null>(n).fill(null))
  const snap = (): (number | null)[][] => f.map((row) => row.slice())
  const frames: Frame[] = []

  // 起手：把三角形数字铺给读者看（尚未开始 DP，全为空白，靠 caption 说明）
  frames.push({
    values: snap(),
    states: {},
    caption:
      '<b>准备</b>：把三角形按行左对齐嵌进方阵，第 i 行只用到第 0…i 列。现在从<b>最底行</b>开始，自底向上把每格的「到底部的最大路径和」填出来。',
    formula: 'f[i][j] = a[i][j] + \\max(f[i+1][j],\\ f[i+1][j+1])',
  })

  // 最底行直接落地：f[n-1][j] = a[n-1][j]
  for (let j = 0; j < n; j++) {
    f[n - 1][j] = tri[n - 1][j]
    const states = settled(f)
    states[key(n - 1, j)] = 'current'
    frames.push({
      values: snap(),
      states,
      active: { r: n - 1, c: j },
      caption: `<b>最底行</b>：脚下就是终点，一步都不用再走，<b>f[${n - 1}][${j}] = a[${n - 1}][${j}] = ${tri[n - 1][j]}</b>。整层是自底向上的地基。`,
      formula: `f[${n - 1}][${j}]=${tri[n - 1][j]}`,
    })
  }

  // 自底向上：从倒数第二行到顶
  for (let i = n - 2; i >= 0; i--) {
    for (let j = 0; j <= i; j++) {
      const down = f[i + 1][j] as number // 正下方
      const downRight = f[i + 1][j + 1] as number // 右下方
      const best = Math.max(down, downRight)
      f[i][j] = tri[i][j] + best
      const rightWins = downRight > down

      const states = settled(f)
      const arrows: Arrow[] = []
      // 两个来源都标 source，胜者标 chosen
      states[key(i + 1, j)] = rightWins ? 'source' : 'chosen'
      states[key(i + 1, j + 1)] = rightWins ? 'chosen' : 'source'
      arrows.push({ from: { r: i + 1, c: j }, to: { r: i, c: j }, kind: rightWins ? 'source' : 'chosen' })
      arrows.push({ from: { r: i + 1, c: j + 1 }, to: { r: i, c: j }, kind: rightWins ? 'chosen' : 'source' })
      states[key(i, j)] = 'current'

      const caption =
        `格 <b>f[${i}][${j}]</b>（本身值 a=${tri[i][j]}）：正下方 f[${i + 1}][${j}] = <b>${down}</b>，` +
        `右下方 f[${i + 1}][${j + 1}] = <b>${downRight}</b> → 取较大的 <b>${best}</b>，加上自己 = <b>${f[i][j]}</b>。`
      const formula = `f[${i}][${j}]=${tri[i][j]}+\\max(${down},\\ ${downRight})=${f[i][j]}`
      frames.push({ values: snap(), states, active: { r: i, c: j }, arrows, caption, formula })
    }
  }

  const fin = settled(f)
  fin[key(0, 0)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案落在<b>顶点 f[0][0] = ${f[0][0]}</b>——从塔顶走到塔底、每步只能去正下方或右下方时的最大数字和。`,
    formula: `f[0][0]=${f[0][0]}`,
  })

  return {
    rows: n,
    cols: n,
    cell: 46,
    rowHeaderLabels: Array.from({ length: n }, (_, i) => `第${i}行`),
    colHeaderLabels: Array.from({ length: n }, (_, j) => `${j}`),
    frames,
  }
}

/**
 * 网格路径计数（过河卒）：从左上角 (1,1) 走到右下角，每步只能向右或向下。
 * f[i][j] = f[i-1][j] + f[i][j-1]，起点 f[1][1]=1；障碍格是「非法状态」，f=0 且不向外传播。
 * 渲染用 1-based 坐标，为省表头这里直接用 (rows)×(cols) 的方阵、行列头标 1..rows / 1..cols。
 * blocked 是障碍集合（"i,j"）；逐帧逐格演示计数如何从上方 + 左方累加，以及障碍如何把路径截断清零。
 */
export function gridCount2D(rows: number, cols: number, blocked: Set<string>): VizModel {
  // 用 1-based：数组开 (rows+1)×(cols+1)，第 0 行/列留空当哨兵（不渲染，靠表头对齐）。
  // 但 DPViz 从 (0,0) 起渲染，这里让渲染网格 = rows×cols，逻辑坐标 (i,j) 直接映射到格 (i-1,j-1)。
  const g: (number | null)[][] = Array.from({ length: rows }, () => Array<number | null>(cols).fill(null))
  const val = (i: number, j: number): number => {
    if (i < 1 || j < 1) return 0
    const x = g[i - 1][j - 1]
    return x == null ? 0 : x
  }
  const snap = (): (number | null)[][] => g.map((row) => row.slice())
  const frames: Frame[] = []
  const isBlocked = (i: number, j: number) => blocked.has(`${i},${j}`)

  frames.push({
    values: snap(),
    states: {},
    caption:
      '<b>准备</b>：卒从左上角出发，每步只能<b>向右</b>或<b>向下</b>，数一共有多少条不同的路走到右下角。红格是<b>障碍</b>（马的控制点），一步都不能踩。',
    formula: 'f[i][j] = f[i-1][j] + f[i][j-1]',
  })

  for (let i = 1; i <= rows; i++) {
    for (let j = 1; j <= cols; j++) {
      const cellStates = settled(g)
      const arrows: Arrow[] = []

      if (isBlocked(i, j)) {
        g[i - 1][j - 1] = 0
        const states = settled(g)
        // 障碍格标红（invalid），并保持已算出的其它格
        states[key(i - 1, j - 1)] = 'invalid'
        frames.push({
          values: snap(),
          states,
          active: { r: i - 1, c: j - 1 },
          caption: `格 <b>(${i},${j})</b> 是<b>障碍</b>：卒到不了这里，方案数强制 <b>f[${i}][${j}] = 0</b>——它也就不会再把任何路径数向右、向下传出去。`,
          formula: `f[${i}][${j}]=0\\ (\\text{blocked})`,
        })
        continue
      }

      let caption: string
      let formula: string
      if (i === 1 && j === 1) {
        g[0][0] = 1
        caption = `<b>起点 (1,1)</b>：卒站在这里本身就是「1 条路（还没走）」，<b>f[1][1] = 1</b>。所有计数都从这一粒火种长出去。`
        formula = `f[1][1]=1`
      } else {
        const up = val(i - 1, j) // 从上方来
        const left = val(i, j - 1) // 从左方来
        g[i - 1][j - 1] = up + left
        // 高亮两个来源
        if (i - 1 >= 1) {
          cellStates[key(i - 2, j - 1)] = 'source'
          arrows.push({ from: { r: i - 2, c: j - 1 }, to: { r: i - 1, c: j - 1 }, kind: 'chosen' })
        }
        if (j - 1 >= 1) {
          cellStates[key(i - 1, j - 2)] = 'source'
          arrows.push({ from: { r: i - 1, c: j - 2 }, to: { r: i - 1, c: j - 1 }, kind: 'chosen' })
        }
        caption =
          `格 <b>(${i},${j})</b>：从<b>上方</b> f[${i - 1}][${j}] = <b>${up}</b> 条 + 从<b>左方</b> f[${i}][${j - 1}] = <b>${left}</b> 条 = <b>${up + left}</b> 条路。`
        formula = `f[${i}][${j}]=${up}+${left}=${up + left}`
      }
      const states = settled(g)
      Object.assign(states, cellStates)
      states[key(i - 1, j - 1)] = 'current'
      frames.push({ values: snap(), states, active: { r: i - 1, c: j - 1 }, arrows, caption, formula })
    }
  }

  const ans = val(rows, cols)
  const fin = settled(g)
  // 障碍格保持红色
  for (const b of blocked) {
    const [bi, bj] = b.split(',').map(Number)
    if (bi >= 1 && bi <= rows && bj >= 1 && bj <= cols) fin[key(bi - 1, bj - 1)] = 'invalid'
  }
  fin[key(rows - 1, cols - 1)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: `<b>终点 f[${rows}][${cols}] = ${ans}</b>——从左上到右下、避开所有障碍的不同路径总数。改改障碍位置，看这个数怎么被截断。`,
    formula: `f[${rows}][${cols}]=${ans}`,
  })

  return {
    rows,
    cols,
    cell: 44,
    rowHeaderLabels: Array.from({ length: rows }, (_, i) => `${i + 1}`),
    colHeaderLabels: Array.from({ length: cols }, (_, j) => `${j + 1}`),
    rowHeaderTitle: '行',
    colHeaderTitle: '列',
    frames,
  }
}
