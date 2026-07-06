import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

// ========================= 主演示：选 / 不选 两状态填表 =========================
// 「打家劫舍 / 选不相邻」式线性状态机：每个位置 i 引入一个离散状态——
//   状态 0（不选 a[i]）：dp[i][0] = max(dp[i-1][0], dp[i-1][1])
//   状态 1（  选 a[i]）：dp[i][1] = dp[i-1][0] + a[i]   （选了 i，前一个必不选）
// 网格为「状态 × 位置」的二维：2 行（行 0 = 不选、行 1 = 选），n+1 列（列 0 为哨兵起点）。
// 答案 = max(dp[n][0], dp[n][1])。

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 二维状态机背包：dp 是 2 行（状态：不选 / 选）× (n+1) 列（位置，含哨兵 0 列）的网格。
 * 逐位置、逐状态填表，每一格高亮它在「上一位置」的两个候选来源，直观呈现
 * 「状态 1 只能从上一位置的状态 0 转来（相邻互斥），状态 0 可从上一位置任一状态转来」。
 */
export function fsmPickTable(a: number[]): VizModel {
  const n = a.length
  const ROWS = 2 // 行 0：不选；行 1：选
  const dp: (number | null)[][] = Array.from({ length: ROWS }, () => Array<number | null>(n + 1).fill(null))
  // 哨兵起点（位置 0，尚未考虑任何元素）：两状态都为 0
  dp[0][0] = 0
  dp[1][0] = 0
  const snap = () => dp.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(dp),
    caption:
      '<b>哨兵起点（位置 0）</b>：还没考虑任何元素，「不选」与「选」两状态的最优值都是 <b>0</b>——整张表的地基。',
    formula: 'dp[0][0]=dp[0][1]=0',
  })

  for (let i = 1; i <= n; i++) {
    const cur = a[i - 1]
    // 状态 0：不选 a[i] → 从上一位置两状态取较大者
    const skip0 = dp[0][i - 1] as number
    const skip1 = dp[1][i - 1] as number
    const notPick = Math.max(skip0, skip1)
    dp[0][i] = notPick
    // 状态 1：选 a[i] → 上一位置必须是「不选」，再加上 a[i]
    const pick = skip0 + cur
    dp[1][i] = pick

    // ---- 帧：先点亮「不选」这一格的来源 ----
    {
      const states = settled(dp)
      const arrows: Arrow[] = []
      const win0Better = skip0 >= skip1
      // 两条来源都来自上一位置（列 i-1）
      arrows.push({ from: { r: 0, c: i - 1 }, to: { r: 0, c: i }, kind: win0Better ? 'chosen' : 'source' })
      arrows.push({ from: { r: 1, c: i - 1 }, to: { r: 0, c: i }, kind: win0Better ? 'source' : 'chosen' })
      states[key(0, i - 1)] = win0Better ? 'chosen' : 'source'
      states[key(1, i - 1)] = win0Better ? 'source' : 'chosen'
      states[key(0, i)] = 'current'
      const caption =
        `位置 <b>${i}</b>（a[${i}]=<b>${cur}</b>）· <b>不选</b>它：可承接上一位置的「不选=${skip0}」或「选=${skip1}」，` +
        `取较大者 → dp[${i}][不选] = <b>${notPick}</b>。`
      const formula = `dp[${i}][0]=\\max(dp[${i - 1}][0],\\ dp[${i - 1}][1])=\\max(${skip0},${skip1})=${notPick}`
      frames.push({ values: snap(), states, active: { r: 0, c: i }, arrows, caption, formula })
    }
    // ---- 帧：再点亮「选」这一格的来源 ----
    {
      const states = settled(dp)
      const arrows: Arrow[] = []
      // 「选」只能从上一位置的「不选」转来
      arrows.push({ from: { r: 0, c: i - 1 }, to: { r: 1, c: i }, kind: 'chosen' })
      states[key(0, i - 1)] = 'chosen'
      states[key(1, i)] = 'current'
      const caption =
        `位置 <b>${i}</b>（a[${i}]=<b>${cur}</b>）· <b>选</b>它：那前一个必须「不选」（相邻互斥），` +
        `只能从上一位置的「不选=${skip0}」转来，再加 a[${i}]=${cur} → dp[${i}][选] = <b>${pick}</b>。`
      const formula = `dp[${i}][1]=dp[${i - 1}][0]+a[${i}]=${skip0}+${cur}=${pick}`
      frames.push({ values: snap(), states, active: { r: 1, c: i }, arrows, caption, formula })
    }
  }

  const ans = Math.max(dp[0][n] as number, dp[1][n] as number)
  const answerRow = (dp[1][n] as number) >= (dp[0][n] as number) ? 1 : 0
  const fin = settled(dp)
  fin[key(answerRow, n)] = 'chosen'
  fin[key(1 - answerRow, n)] = 'source'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `扫到末尾，答案 = 末列两状态的较大者：max(dp[${n}][不选]=<b>${dp[0][n]}</b>, dp[${n}][选]=<b>${dp[1][n]}</b>) = ` +
      `<b>${ans}</b>——这就是「任意两个不相邻」时能选出的最大和。`,
    formula: `\\text{ans}=\\max(dp[${n}][0],dp[${n}][1])=${ans}`,
  })

  return {
    rows: ROWS,
    cols: n + 1,
    cell: 46,
    rowHeaderLabels: ['不选', '选'],
    colHeaderLabels: Array.from({ length: n + 1 }, (_, i) => (i === 0 ? '起' : `a${i}`)),
    frames,
  }
}

// ========================= 第二演示：股票买卖状态机（逐日转移） =========================
// 两状态：hold（持有一股）/ cash（空仓）。逐日在两状态间转移，跟踪各状态的最优现金。
// 支持「冷却期」：卖出当天进入 cash 后，次日不能买入（cash → hold 需隔一天）。
// 无限次交易版（买卖不限次数）。

export interface StockDay {
  day: number // 第几天（1-based）
  price: number
  hold: number // 当天结束时「持有」状态的最优现金（相对初始 0）
  cash: number // 当天结束时「空仓」状态的最优现金
  holdFrom: 'hold' | 'buy' // 今日 hold 由何而来：继续持有 / 今日买入
  cashFrom: 'cash' | 'sell' // 今日 cash 由何而来：继续空仓 / 今日卖出
  froze: boolean // 今日是否处于冷却（无法买入）
}

const NEG = -1e9

/**
 * 逐日推演股票买卖状态机（无限次交易，可选冷却期）。
 * 返回每一天两状态（hold/cash）的最优值与来源边，供自建可视化逐日点亮。
 * 递推（含 1 天冷却）：
 *   cash[i] = max(cash[i-1], hold[i-1] + price[i])              // 保持空仓 / 今日卖出
 *   hold[i] = max(hold[i-1], (冷却 ? cash[i-2] : cash[i-1]) - price[i])
 *             // 继续持有 / 今日买入（买入的现金基准：冷却时取前天空仓，否则昨日空仓）
 * 无冷却时把 cash[i-2] 换成 cash[i-1] 即可。
 */
export function stockStates(prices: number[], cooldown: boolean): StockDay[] {
  const n = prices.length
  const days: StockDay[] = []
  // 初始（第 0 天，未开盘）：空仓现金 0，持有为 -∞（还没买过）
  let prevCash = 0
  let prevHold = NEG
  let prevPrevCash = 0 // cash[i-2]，用于冷却
  for (let i = 0; i < n; i++) {
    const price = prices[i]
    // 空仓：保持 / 今日卖出
    const stay = prevCash
    const sell = prevHold + price
    const cash = Math.max(stay, sell)
    const cashFrom: 'cash' | 'sell' = sell > stay ? 'sell' : 'cash'
    // 持有：保持 / 今日买入（冷却期不能买入 → 买入候选记为 -∞）
    const keep = prevHold
    const buyBase = cooldown ? prevPrevCash : prevCash
    const froze = cooldown && i >= 1 && days[i - 1].cashFrom === 'sell'
    const buy = froze ? NEG : buyBase - price
    const hold = Math.max(keep, buy)
    const holdFrom: 'hold' | 'buy' = buy > keep ? 'buy' : 'hold'

    days.push({ day: i + 1, price, hold, cash, holdFrom, cashFrom, froze })
    prevPrevCash = prevCash
    prevCash = cash
    prevHold = hold
  }
  return days
}

/** 无限次交易的最优利润（贪心，用于核对自建可视化的最终答案）。 */
export function stockBestProfit(prices: number[]): number {
  let profit = 0
  for (let i = 1; i < prices.length; i++) if (prices[i] > prices[i - 1]) profit += prices[i] - prices[i - 1]
  return profit
}
