import type { VizModel, Frame, CellState } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

const NEG = -1e9

/**
 * 双线程 / 传纸条：两条路径同时从 (0,0) 走到 (R-1,C-1)，每步只能向右或向下，
 * 求两条路径经过的格子权值之和的最大值——同一个格子被两条路都经过时只算一次。
 *
 * 按「步数」压维：两条路同步推进，走了 k 步的路一定落在反对角线 x+y=k 上。
 * 于是只需记两条路当前的行号 (x1, x2)，列号由 y = k - x 唯一确定，状态压成 dp[k][x1][x2]。
 * 转移：上一步 k-1 时，每条路要么在同列上一行（来自上方，x-1），要么同行前一列（来自左方，x 不变），
 * 四种组合取 max，再加上两条路当前所站两格的权值；若两路同格（x1==x2）则那格权值只加一次。
 *
 * 演示网格：一张 R×R 的表，行 = x1、列 = x2，每帧填 dp[k] 的一格；k 递增就换一层反对角线。
 */
export function twoPath2D(a: number[][]): VizModel {
  const R = a.length
  const C = a[0].length
  const steps = R - 1 + (C - 1)

  const render: (number | null)[][] = Array.from({ length: R }, () => Array<number | null>(R).fill(null))
  const snap = (): (number | null)[][] => render.map((row) => row.slice())
  const frames: Frame[] = []

  // 逻辑层：dp 只保留「当前 k」这一层，prev 为上一层
  let prev: number[][] = Array.from({ length: R }, () => Array(R).fill(NEG))

  const yOf = (k: number, x: number) => k - x
  const inRange = (x: number, y: number) => x >= 0 && x < R && y >= 0 && y < C

  frames.push({
    values: snap(),
    states: {},
    caption:
      '<b>准备</b>：两条路一起从左上角出发，每走一步都停在同一条<b>反对角线 x+y=k</b> 上。表格行 = 第一条路的行号 x1、列 = 第二条路的行号 x2；' +
      '列号 y = k − x 自动定出来。逐步把每层 k 的最大权值和填出来。',
    formula: 'dp[k][x_1][x_2]=\\max_{4\\text{ prev}}dp[k-1]+a[x_1][y_1]+a[x_2][y_2]',
  })

  // k = 0：两条路都在 (0,0)
  render[0][0] = a[0][0]
  prev[0][0] = a[0][0]
  {
    const states: Record<string, CellState> = {}
    states[key(0, 0)] = 'current'
    frames.push({
      values: snap(),
      states,
      active: { r: 0, c: 0 },
      caption: `<b>k = 0</b>：两条路都站在起点 (0,0)。同一格只算一次，dp[0][0][0] = a[0][0] = <b>${a[0][0]}</b>。`,
      formula: `dp[0][0][0]=${a[0][0]}`,
    })
  }

  for (let k = 1; k <= steps; k++) {
    const cur: number[][] = Array.from({ length: R }, () => Array(R).fill(NEG))
    // 清掉表格，进入新的一层反对角线
    for (let r = 0; r < R; r++) for (let c = 0; c < R; c++) render[r][c] = null

    for (let x1 = 0; x1 <= Math.min(k, R - 1); x1++) {
      const y1 = yOf(k, x1)
      if (!inRange(x1, y1)) continue
      for (let x2 = 0; x2 <= Math.min(k, R - 1); x2++) {
        const y2 = yOf(k, x2)
        if (!inRange(x2, y2)) continue

        let best = NEG
        let from: { px1: number; px2: number } | null = null
        for (const px1 of [x1 - 1, x1])
          for (const px2 of [x2 - 1, x2]) {
            if (px1 < 0 || px2 < 0) continue
            const val = prev[px1][px2]
            if (val > best) {
              best = val
              from = { px1, px2 }
            }
          }
        if (best <= NEG || !from) continue

        let add = a[x1][y1] + a[x2][y2]
        const samecell = x1 === x2 // 同 k 下 x 相等 ⇒ y 也相等 ⇒ 同一格
        if (samecell) add -= a[x1][y1]
        cur[x1][x2] = best + add
        render[x1][x2] = best + add

        const states: Record<string, CellState> = {}
        for (let r = 0; r < R; r++)
          for (let c = 0; c < R; c++) if (render[r][c] !== null) states[key(r, c)] = 'settled'
        // 胜出的上一步来源在「上一层反对角线」，本表已换层显示不出来，故只在解说里点名，不在网格里画会误导的箭头。
        states[key(x1, x2)] = 'current'

        const cellDesc = `路1→(${x1},${y1})，路2→(${x2},${y2})`
        const addDesc = samecell
          ? `两路撞在同格 (${x1},${y1})，权值 ${a[x1][y1]} <b>只算一次</b>`
          : `两格权值 ${a[x1][y1]}+${a[x2][y2]} = ${a[x1][y1] + a[x2][y2]}`
        frames.push({
          values: snap(),
          states,
          active: { r: x1, c: x2 },
          caption:
            `<b>k = ${k}</b>：${cellDesc}。上一步最优来自 (${from.px1},${from.px2}) = <b>${best}</b>，${addDesc} → dp = <b>${best + add}</b>。`,
          formula: `dp[${k}][${x1}][${x2}]=${best}+${add}=${best + add}`,
        })
      }
    }
    prev = cur
  }

  const ans = prev[R - 1][R - 1]
  const fin: Record<string, CellState> = {}
  for (let r = 0; r < R; r++) for (let c = 0; c < R; c++) if (render[r][c] !== null) fin[key(r, c)] = 'settled'
  fin[key(R - 1, R - 1)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `<b>终点</b>：两条路都到达 (${R - 1},${C - 1})，即表格 dp[${steps}][${R - 1}][${R - 1}] = <b>${ans}</b>——` +
      `两条右/下路径能取到的最大权值和（重叠格只计一次）。`,
    formula: `dp[${steps}][${R - 1}][${R - 1}]=${ans}`,
  })

  return {
    rows: R,
    cols: R,
    cell: 46,
    rowHeaderLabels: Array.from({ length: R }, (_, x) => `x1=${x}`),
    colHeaderLabels: Array.from({ length: R }, (_, x) => `x2=${x}`),
    rowHeaderTitle: '路1行',
    colHeaderTitle: '路2行',
    frames,
  }
}
