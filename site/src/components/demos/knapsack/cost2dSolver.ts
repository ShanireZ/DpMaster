import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

// 一件物品挂两个费用 (a=费用1, b=费用2) 与价值 v。
export interface C2Item {
  a: number
  b: number
  v: number
}

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 二维费用背包（01 型）：dp[x][y] = 费用1 不超过 x、费用2 不超过 y 时的最大价值。
 * 转移：dp[x][y] = max( dp[x][y]（不取本件）, dp[x-a][y-b] + v（取本件） )。
 *
 * 一维滚动写法只需给 dp 增开一维，两种费用维都要倒序：
 *   for x = A downto a:  for y = B downto b:  dp[x][y] = max(dp[x][y], dp[x-a][y-b]+v)
 * 倒序保证 dp[x-a][y-b] 用的是「本件尚未装入」的旧值，故每件至多取一次。
 *
 * 可视化：DPViz 网格的「行 r = 费用2 y（0..B）」「列 c = 费用1 x（0..A）」。
 * 逐件更新整张表，每处理完一件推一帧（整表快照 + 本件改写的格高亮）。
 */
export function cost2D(items: C2Item[], A: number, B: number): VizModel {
  // dp[y][x]：行是费用2 y，列是费用1 x，与 DPViz 的 (r=y, c=x) 对齐。
  const dp: number[][] = Array.from({ length: B + 1 }, () => Array<number>(A + 1).fill(0))
  const snap = (): (number | null)[][] => dp.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(dp),
    caption:
      '<b>初始表</b>：一件都不装时，任何 (费用1 x, 费用2 y) 下最大价值都是 <b>0</b>。行是费用2 y、列是费用1 x。',
    formula: 'dp[x][y] = 0',
  })

  for (let i = 0; i < items.length; i++) {
    const { a, b, v } = items[i]
    // 记录本件真正改写的格，并挑一个「代表格」画来源箭头（取改写后值最大者，平局取 x+y 最大）。
    const changed: { x: number; y: number; from: number; to: number }[] = []
    // 两种费用维都倒序：dp[x-a][y-b] 保持本件装入前的旧值。
    for (let x = A; x >= a; x--) {
      for (let y = B; y >= b; y--) {
        const cand = dp[y - b][x - a] + v
        if (cand > dp[y][x]) {
          changed.push({ x, y, from: dp[y][x], to: cand })
          dp[y][x] = cand
        }
      }
    }

    const states = settled(dp)
    const arrows: Arrow[] = []
    let caption: string
    let formula: string

    if (changed.length > 0) {
      // 代表格：值最大者
      let rep = changed[0]
      for (const c of changed) if (c.to > rep.to || (c.to === rep.to && c.x + c.y > rep.x + rep.y)) rep = c
      // 所有被改写格标 current；代表格额外画来源箭头。
      for (const c of changed) states[key(c.y, c.x)] = 'current'
      // 代表格的来源：dp[x-a][y-b]（取本件的那条路），画一条箭头示意「同时扣两种费用」。
      states[key(rep.y - b, rep.x - a)] = 'source'
      arrows.push({ from: { r: rep.y - b, c: rep.x - a }, to: { r: rep.y, c: rep.x }, kind: 'chosen' })

      caption =
        `装入 <b>物品 ${i + 1}</b>（a=${a}, b=${b}, v=${v}）：凡是费用1 ≥ ${a} 且费用2 ≥ ${b} 的格，都拿 ` +
        `dp[x−${a}][y−${b}]+${v} 与原值比较、取较大者。共 <b>${changed.length}</b> 个格被抬升。` +
        `以格 <b>(x=${rep.x}, y=${rep.y})</b> 为例：由 dp[${rep.x - a}][${rep.y - b}]+${v} = <b>${rep.to}</b> 胜过原值 <b>${rep.from}</b>。`
      formula = `dp[${rep.x}][${rep.y}]=\\max(${rep.from},\\ ${rep.to - v}+${v})=${rep.to}`
    } else {
      caption =
        `装入 <b>物品 ${i + 1}</b>（a=${a}, b=${b}, v=${v}）：没有格能因它变大（要么装不下、要么不划算），整表不变。`
      formula = `dp[x][y]\\ \\text{unchanged}`
    }

    frames.push({ values: snap(), states, arrows, active: null, caption, formula })
  }

  const fin = settled(dp)
  fin[key(B, A)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案在右下角 <b>dp[${A}][${B}] = ${dp[B][A]}</b>——两种费用分别不超过 A=${A}、B=${B} 时能取得的最大价值。`,
    formula: `dp[${A}][${B}]=${dp[B][A]}`,
  })

  return {
    rows: B + 1,
    cols: A + 1,
    cell: 36,
    rowHeaderLabels: Array.from({ length: B + 1 }, (_, y) => `y=${y}`),
    colHeaderLabels: Array.from({ length: A + 1 }, (_, x) => `x=${x}`),
    rowHeaderTitle: '费用2',
    colHeaderTitle: '费用1',
    frames,
  }
}
