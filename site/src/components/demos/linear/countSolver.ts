import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 数楼梯 / 爬楼梯计数 · 一维 f[i]「跳到第 i 级台阶的不同走法数」。
 * 一步跨 1 级或 2 级 → 到第 i 级要么从 i-1 跨 1 级来、要么从 i-2 跨 2 级来，
 * 两类不重不漏：f[i] = f[i-1] + f[i-2]。地基 f[0]=1（原地不动算 1 种）、f[1]=1。
 * 把最优 DP 的 max 换成累加 +，就从「求最值」变成「数方案」。网格为一维（1 行 n+1 列）。
 */
export function stairCount(n: number): VizModel {
  const f: (number | null)[] = Array<number | null>(n + 1).fill(null)
  const snap = (): (number | null)[][] => [f.slice()]
  const frames: Frame[] = []

  // 地基：f[0]=1、f[1]=1（当 n≥1）
  f[0] = 1
  if (n >= 1) f[1] = 1
  frames.push({
    values: snap(),
    states: settled(snap()),
    caption:
      `<b>地基</b>：<b>f[0]=1</b>（还没上台阶，「原地站着」本身算 1 种走法——这颗种子撑起后面所有计数），` +
      (n >= 1 ? `<b>f[1]=1</b>（到第 1 级只有「跨 1 级」这一种）。` : '') +
      `这一步取代了最优 DP 里的「全 0」地基。`,
    formula: n >= 1 ? 'f[0]=1,\\ f[1]=1' : 'f[0]=1',
  })

  for (let i = 2; i <= n; i++) {
    const one = f[i - 1] as number // 从 i-1 跨 1 级
    const two = f[i - 2] as number // 从 i-2 跨 2 级
    const now = one + two
    f[i] = now

    const states: Record<string, CellState> = settled(snap())
    const arrows: Arrow[] = [
      { from: { r: 0, c: i - 1 }, to: { r: 0, c: i }, kind: 'chosen' },
      { from: { r: 0, c: i - 2 }, to: { r: 0, c: i }, kind: 'chosen' },
    ]
    states[key(0, i - 1)] = 'source'
    states[key(0, i - 2)] = 'source'
    states[key(0, i)] = 'current'

    const caption =
      `第 <b>${i}</b> 级：从第 <b>${i - 1}</b> 级跨 1 级来（<b>${one}</b> 种）＋ 从第 <b>${i - 2}</b> 级跨 2 级来（<b>${two}</b> 种），` +
      `两条来路不重不漏，f[${i}] = f[${i - 1}] + f[${i - 2}] = <b>${one}</b> + <b>${two}</b> = <b>${now}</b>。`
    // ★formula 内禁中文，纯符号
    const formula = `f[${i}]=f[${i - 1}]+f[${i - 2}]=${one}+${two}=${now}`
    frames.push({ values: snap(), states, active: { r: 0, c: i }, arrows, caption, formula })
  }

  const fin = settled(snap())
  fin[key(0, n)] = 'chosen'
  const ans = f[n] as number
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `答案 <b>f[${n}] = ${ans}</b>：跳到第 ${n} 级共有 <b>${ans}</b> 种不同走法。` +
      `全程没有一次 max——只有一层层累加，正是斐波那契数列。`,
    formula: `f[${n}]=${ans}`,
  })

  return {
    rows: 1,
    cols: n + 1,
    rowHeaderLabels: ['f'],
    colHeaderLabels: Array.from({ length: n + 1 }, (_, j) => `${j}`),
    frames,
  }
}

/**
 * 整数划分（二维计数）· dp[i][j] =「把 i 拆成若干个正整数、每个数都不超过 j」的无序方案数。
 * 逐格取两类之和（正难则反地按「最大零件是否用到 j」切分，不重不漏）：
 *   dp[i][j] = dp[i][j-1]        // 完全不用 j：能用的数收窄到 ≤ j-1
 *            + dp[i-j][j]        // 至少用一个 j：先扣掉一个 j，余下 i-j 仍可用 ≤ j 的数
 * 边界：dp[0][j]=1（把 0 拆开只有「空拆分」一种）；j>i 的那半张表恒等于 dp[i][i]。
 * 网格行 = 被拆的数 i（0..N），列 = 允许的最大零件 j（0..N）。答案在 dp[N][N]。
 */
export function integerPartition(N: number): VizModel {
  const R = N + 1
  const dp: (number | null)[][] = Array.from({ length: R }, () => Array<number | null>(R).fill(null))
  // 第 0 行：dp[0][j] = 1（空拆分）；第 0 列 dp[i][0]=0 (i>0)（不许用任何数，拆不出正数）
  for (let j = 0; j < R; j++) dp[0][j] = 1
  for (let i = 1; i < R; i++) dp[i][0] = 0
  const snap = (): (number | null)[][] => dp.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(dp),
    caption:
      '<b>地基</b>：<b>第 0 行 dp[0][j]=1</b>（把数字 0 拆开，只有「什么都不取」这一种空拆分）；' +
      '<b>第 0 列 dp[i][0]=0</b>（i&gt;0 时不许用任何零件，正数拆不出来）。其余留空，逐格填。',
    formula: 'dp[0][j]=1,\\ dp[i][0]=0\\ (i>0)',
  })

  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= N; j++) {
      // 不用 j：继承左边一列 dp[i][j-1]
      const noJ = dp[i][j - 1] as number
      // 至少用一个 j（前提 i>=j，否则放不下一个 j）
      const canUse = i - j >= 0
      const useJ = canUse ? (dp[i - j][j] as number) : 0
      const now = noJ + useJ
      dp[i][j] = now

      const states = settled(dp)
      const arrows: Arrow[] = []
      // 来源一：左邻 dp[i][j-1]
      states[key(i, j - 1)] = 'source'
      arrows.push({ from: { r: i, c: j - 1 }, to: { r: i, c: j }, kind: 'chosen' })
      // 来源二：dp[i-j][j]
      if (canUse) {
        states[key(i - j, j)] = useJ > 0 ? 'chosen' : 'source'
        arrows.push({ from: { r: i - j, c: j }, to: { r: i, c: j }, kind: 'chosen' })
      }
      states[key(i, j)] = 'current'

      let caption: string
      let formula: string
      if (canUse) {
        caption =
          `拆 <b>${i}</b> · 最大零件 ≤ <b>${j}</b>：不用 ${j} = dp[${i}][${j - 1}] = <b>${noJ}</b>；` +
          `至少用一个 ${j} = dp[${i - j}][${j}] = <b>${useJ}</b> → 相加 <b>${now}</b>。`
        formula = `dp[${i}][${j}]=dp[${i}][${j - 1}]+dp[${i - j}][${j}]=${noJ}+${useJ}=${now}`
      } else {
        caption =
          `拆 <b>${i}</b> · 最大零件 ≤ <b>${j}</b>：<b>${j} 比 ${i} 还大</b>，放不进一个 ${j}，` +
          `只能沿用「不用 ${j}」= dp[${i}][${j - 1}] = <b>${noJ}</b>。（此后 j 再大也不变。）`
        formula = `dp[${i}][${j}]=dp[${i}][${j - 1}]=${noJ}`
      }
      frames.push({ values: snap(), states, active: { r: i, c: j }, arrows, caption, formula })
    }
  }

  const fin = settled(dp)
  fin[key(N, N)] = 'chosen'
  const ans = dp[N][N] as number
  frames.push({
    values: snap(),
    states: fin,
    caption: `答案在右下角 <b>dp[${N}][${N}] = ${ans}</b>——把 ${N} 拆成若干正整数（零件不限大小、无序）的方案共 <b>${ans}</b> 种。`,
    formula: `dp[${N}][${N}]=${ans}`,
  })

  return {
    rows: R,
    cols: R,
    cell: 40,
    rowHeaderLabels: Array.from({ length: R }, (_, i) => `拆${i}`),
    colHeaderLabels: Array.from({ length: R }, (_, j) => `${j}`),
    rowHeaderTitle: '拆 i',
    colHeaderTitle: '≤ j',
    frames,
  }
}
