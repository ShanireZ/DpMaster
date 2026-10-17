import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types.ts'
import { key } from '../../dp-engine/types.ts'
import { recordCost2DKnapsack } from '../../../algorithms/knapsack-cost2d/internal.ts'
import type {
  Cost2DKnapsackItem, Cost2DKnapsackMode,
} from '../../../algorithms/knapsack-cost2d/index.ts'

// 一件物品掛兩個費用 (a=費用1, b=費用2) 與價值 v。
export type C2Item = Cost2DKnapsackItem

// 求解目標：'value' 用每件的 v 求最大價值；'count' 價值恆 1，dp 變成「最多件數」。
export type C2Mode = Cost2DKnapsackMode

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 二維費用揹包（01 型）：dp[x][y] = 費用1 不超過 x、費用2 不超過 y 時的最大價值。
 * 轉移：dp[x][y] = max( dp[x][y]（不取本件）, dp[x-a][y-b] + v（取本件） )。
 *
 * 一維捲動寫法只需給 dp 增開一維，兩種費用維都要倒序：
 *   for x = A downto a:  for y = B downto b:  dp[x][y] = max(dp[x][y], dp[x-a][y-b]+v)
 * 倒序保證 dp[x-a][y-b] 用的是「本件尚未裝入」的舊值，故每件至多取一次。
 *
 * mode='value'：轉移補 +v，dp 是「最大價值」。
 * mode='count'：價值恆 1，轉移補 +1，dp 變成「兩費用受限下最多能裝幾件」，這正是
 *   「價值恆 1 = 數個數」這一變形（如 P1855 求最多願望數）。
 *
 * 視覺化：DPViz 網格的「行 r = 費用2 y（0..B）」「列 c = 費用1 x（0..A）」。
 * 逐件更新整張表，每處理完一件推一影格（整錶快照 + 本件改寫的格高亮）。
 */
export function cost2D(items: C2Item[], A: number, B: number, mode: C2Mode = 'value'): VizModel {
  // count 模式：價值恆 1，每裝一件 +1；value 模式：補該件的 v。
  const count = mode === 'count'
  const run = recordCost2DKnapsack(items, A, B, mode)
  // dp[y][x]：行是費用2 y，列是費用1 x，與 DPViz 的 (r=y, c=x) 對齊。
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
      // 所有被改寫格標 current；代表格額外畫來源箭頭。
      for (const c of changed) states[key(c.y, c.x)] = 'current'
      // 代表格的來源：dp[x-a][y-b]（取本件的那條路），畫一條箭頭示意「同時扣兩種費用」。
      states[key(rep.y - b, rep.x - a)] = 'source'
      arrows.push({ from: { r: rep.y - b, c: rep.x - a }, to: { r: rep.y, c: rep.x }, kind: 'chosen' })

      // count 模式補 +1（價值恆 1），value 模式補 +v。
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
      ? `答案在右下角 <b>dp[${A}][${B}] = ${run.result.value}</b>，两种费用分别不超过 A=${A}、B=${B} 时最多能装 <b>${run.result.value}</b> 件（价值恒 1，故最大价值就是最多件数）。`
      : `答案在右下角 <b>dp[${A}][${B}] = ${run.result.value}</b>，两种费用分别不超过 A=${A}、B=${B} 时能取得的最大价值。`,
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
