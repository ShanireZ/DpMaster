import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordCost2DKnapsack } from '../../../algorithms/knapsack-cost2d/internal.ts'
import type {
  Cost2DKnapsackItem, Cost2DKnapsackMode,
} from '../../../algorithms/knapsack-cost2d/index.ts'

// 一件物品挂两个费用 (a=费用1, b=费用2) 与价值 v。
export type C2Item = Cost2DKnapsackItem

// 求解目标：'value' 用每件的 v 求最大价值；'count' 价值恒 1，dp 变成「最多件数」。
export type C2Mode = Cost2DKnapsackMode

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
 * mode='value'：转移补 +v，dp 是「最大价值」。
 * mode='count'：价值恒 1，转移补 +1，dp 变成「两费用受限下最多能装几件」——这正是
 *   「价值恒 1 = 数个数」这一变形（如 P1855 求最多愿望数）。
 *
 * 可视化：DPViz 网格的「行 r = 费用2 y（0..B）」「列 c = 费用1 x（0..A）」。
 * 逐件更新整张表，每处理完一件推一帧（整表快照 + 本件改写的格高亮）。
 */
export function cost2D(items: C2Item[], A: number, B: number, mode: C2Mode = 'value'): VizModel {
  // count 模式：价值恒 1，每装一件 +1；value 模式：补该件的 v。
  const count = mode === 'count'
  const run = recordCost2DKnapsack(items, A, B, mode)
  // dp[y][x]：行是费用2 y，列是费用1 x，与 DPViz 的 (r=y, c=x) 对齐。
  const dp: number[][] = Array.from({ length: B + 1 }, () => Array<number>(A + 1).fill(0))
  const snap = (): (number | null)[][] => dp.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(dp),
    caption: count
      ? '<b>初始表</b>：一件都不装时，任何 (费用1 x, 费用2 y) 下件数都是 <b>0</b>。行是费用2 y、列是费用1 x。'
      : '<b>初始表</b>：一件都不装时，任何 (费用1 x, 费用2 y) 下最大价值都是 <b>0</b>。行是费用2 y、列是费用1 x。',
    formula: 'dp[x][y] = 0',
  })

  for (const event of run.events) {
    const { itemIndex: i, item, changed, add } = event
    const { a, b, v } = item
    for (const change of changed) dp[change.y][change.x] = change.to

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

      // count 模式补 +1（价值恒 1），value 模式补 +v。
      const addLabel = count ? '1' : String(v)
      const itemDesc = count ? `a=${a}, b=${b}` : `a=${a}, b=${b}, v=${v}`
      caption =
        `装入 <b>物品 ${i + 1}</b>（${itemDesc}）：凡是费用1 ≥ ${a} 且费用2 ≥ ${b} 的格，都拿 ` +
        `dp[x−${a}][y−${b}]+${addLabel} 与原值比较、取较大者。共 <b>${changed.length}</b> 个格被抬升。` +
        `以格 <b>(x=${rep.x}, y=${rep.y})</b> 为例：由 dp[${rep.x - a}][${rep.y - b}]+${addLabel} = <b>${rep.to}</b> 胜过原值 <b>${rep.from}</b>。`
      formula = `dp[${rep.x}][${rep.y}]=\\max(${rep.from},\\ ${rep.to - add}+${addLabel})=${rep.to}`
    } else {
      const itemDesc = count ? `a=${a}, b=${b}` : `a=${a}, b=${b}, v=${v}`
      caption =
        `装入 <b>物品 ${i + 1}</b>（${itemDesc}）：没有格能因它变大（要么装不下、要么不划算），整表不变。`
      formula = `dp[x][y]\\ \\text{unchanged}`
    }

    frames.push({ values: snap(), states, arrows, active: null, caption, formula })
  }

  const fin = settled(dp)
  fin[key(B, A)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption: count
      ? `答案在右下角 <b>dp[${A}][${B}] = ${run.result.value}</b>——两种费用分别不超过 A=${A}、B=${B} 时最多能装 <b>${run.result.value}</b> 件（价值恒 1，故最大价值就是最多件数）。`
      : `答案在右下角 <b>dp[${A}][${B}] = ${run.result.value}</b>——两种费用分别不超过 A=${A}、B=${B} 时能取得的最大价值。`,
    formula: `dp[${A}][${B}]=${run.result.value}`,
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
