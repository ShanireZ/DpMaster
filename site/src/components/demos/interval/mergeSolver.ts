import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

// 只把「已算出（非 null）」的格标为 settled；下三角恒为 null（.blank 灰底空白）。
function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

/**
 * 两端取数博弈区间 DP：dp[l][r] = 面对区间 [l,r]，当前先手玩家所能取得的
 *   「自己所得 − 对手所得」的最大差值。每回合只能从最左或最右端拿走一个数。
 *   dp[l][l] = a[l]；dp[l][r] = max( a[l] − dp[l+1][r], a[r] − dp[l][r-1] )。
 * ★区间从两端「收缩」而非枚举中间分割点——这正是删除 / 取数类区间 DP 的骨架。
 *   网格：行 l、列 r，只用上三角（l ≤ r），下三角留 null 渲染成空白。
 *   ★按区间长度 len = 2..n 递推：短区间先算好，长区间才能引用其两个子区间。
 */
export function takeEnds(a: number[]): VizModel {
  const n = a.length
  // 只用上三角：dp[l][r]，l ≤ r；其余保持 null。
  const dp: (number | null)[][] = Array.from({ length: n }, () => Array<number | null>(n).fill(null))
  for (let l = 0; l < n; l++) dp[l][l] = a[l]
  const snap = () => dp.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(dp),
    caption:
      '<b>对角线（区间长度 1）</b>：区间里只剩一个数，先手玩家别无选择只能拿走它——' +
      'dp[l][l]=a[l]，净胜差就等于这个数。下三角（l&gt;r）不是合法区间，留作空白。这是三角表的地基。',
    formula: 'dp[l][l] = a[l]',
  })

  // ★外层枚举区间长度，由短到长
  for (let len = 2; len <= n; len++) {
    for (let l = 0; l + len - 1 < n; l++) {
      const r = l + len - 1
      // 取左端 a[l]：把子区间 [l+1,r] 让给对手，对手在那段的净胜差要从我方视角取反
      const takeL = a[l] - (dp[l + 1][r] as number)
      // 取右端 a[r]：把子区间 [l,r-1] 让给对手，同理取反
      const takeR = a[r] - (dp[l][r - 1] as number)
      const pickLeft = takeL >= takeR
      dp[l][r] = pickLeft ? takeL : takeR

      // —— 高亮：当前格 dp[l][r]、被选来源子区间（取左→[l+1,r]；取右→[l,r-1]）
      const states = settled(dp)
      const arrows: Arrow[] = []
      const srcR = pickLeft ? l + 1 : l
      const srcC = pickLeft ? r : r - 1
      states[key(srcR, srcC)] = 'chosen'
      arrows.push({ from: { r: srcR, c: srcC }, to: { r: l, c: r }, kind: 'chosen' })
      states[key(l, r)] = 'current'

      const caption =
        `区间 <b>[${l},${r}]</b>（长度 ${len}，两端 a[${l}]=${a[l]}、a[${r}]=${a[r]}）：` +
        `取左端 = a[${l}] − dp[${l + 1}][${r}] = ${a[l]} − ${dp[l + 1][r]} = <b>${takeL}</b>；` +
        `取右端 = a[${r}] − dp[${l}][${r - 1}] = ${a[r]} − ${dp[l][r - 1]} = <b>${takeR}</b>。` +
        `先手要净胜差最大，取${pickLeft ? '左' : '右'}端 → dp[${l}][${r}] = <b>${dp[l][r]}</b>。`
      const formula =
        `dp[${l}][${r}]=\\max(${a[l]}{-}dp[${l + 1}][${r}],\\ ${a[r]}{-}dp[${l}][${r - 1}])` +
        `=\\max(${takeL},${takeR})=${dp[l][r]}`
      frames.push({ values: snap(), states, arrows, active: { r: l, c: r }, caption, formula })
    }
  }

  const total = a.reduce((s, x) => s + x, 0)
  const diff = dp[0][n - 1] as number
  const first = (total + diff) / 2
  const fin = settled(dp)
  fin[key(0, n - 1)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `答案在<b>右上角 dp[0][${n - 1}] = ${diff}</b>——先手在整排数字上的最大净胜差。` +
      `总和 ${total}，故先手最多得 (${total}${diff < 0 ? '' : '+'}${diff})/2 = <b>${first}</b>，后手得 ${total - first}。`,
    formula: `dp[0][${n - 1}]=${diff}`,
  })

  return {
    rows: n,
    cols: n,
    cell: 40,
    rowHeaderLabels: Array.from({ length: n }, (_, l) => `l=${l}`),
    colHeaderLabels: Array.from({ length: n }, (_, r) => `r=${r}`),
    frames,
  }
}

/**
 * 248（P3146）合并区间 DP：dp[l][r] = 若区间 [l,r] 能反复「合并相邻相等两数」
 *   最终缩成<strong>单个</strong>数字，则该数字的值；否则 0（此区间无法合成单值）。
 *   dp[l][l] = a[l]；若存在分割点 k 使 dp[l][k] = dp[k+1][r] > 0，则可合成 dp[l][k]+1，取最大。
 * ★与两端取数不同，这里回到「枚举分割点 k」：左右两段各自先合成同一个数，才能再并一级。
 *   整排能得到的最大数字 = 所有 dp[l][r] 里的最大值（248 的最终答案）。
 */
export function merge248(a: number[]): VizModel {
  const n = a.length
  const dp: (number | null)[][] = Array.from({ length: n }, () => Array<number | null>(n).fill(null))
  for (let l = 0; l < n; l++) dp[l][l] = a[l]
  const snap = () => dp.map((row) => row.slice())
  const frames: Frame[] = []
  let best = Math.max(...a)
  let bestCell = { r: 0, c: 0 }
  for (let l = 0; l < n; l++) if (a[l] === best) bestCell = { r: l, c: l }

  frames.push({
    values: snap(),
    states: settled(dp),
    caption:
      '<b>对角线（长度 1）</b>：单个数字自成一「块」，其值就是它自己——dp[l][l]=a[l]。' +
      '每个格记「这段能否缩成一个数、缩成几」：<b>0 = 该段无法合成单一数字</b>。',
    formula: 'dp[l][l] = a[l]',
  })

  for (let len = 2; len <= n; len++) {
    for (let l = 0; l + len - 1 < n; l++) {
      const r = l + len - 1
      let val = 0
      let bestK = -1
      const tried: string[] = []
      for (let k = l; k <= r - 1; k++) {
        const lv = dp[l][k] as number
        const rv = dp[k + 1][r] as number
        const okPair = lv > 0 && lv === rv
        tried.push(`k=${k}:${lv}|${rv}${okPair ? '✓' : '✗'}`)
        if (okPair && lv + 1 > val) {
          val = lv + 1
          bestK = k
        }
      }
      dp[l][r] = val

      const states = settled(dp)
      const arrows: Arrow[] = []
      if (bestK >= 0) {
        states[key(l, bestK)] = 'chosen'
        states[key(bestK + 1, r)] = 'chosen'
        arrows.push({ from: { r: l, c: bestK }, to: { r: l, c: r }, kind: 'chosen' })
        arrows.push({ from: { r: bestK + 1, c: r }, to: { r: l, c: r }, kind: 'chosen' })
      }
      states[key(l, r)] = 'current'
      if (val > best) {
        best = val
        bestCell = { r: l, c: r }
      }

      const caption =
        val > 0
          ? `区间 <b>[${l},${r}]</b>：找分割点 k 使左右两段合成的数<b>相等</b>——` +
            `k=${bestK} 处 dp[${l}][${bestK}]=dp[${bestK + 1}][${r}]=${val - 1}，可再并一级 → dp[${l}][${r}] = <b>${val}</b>。`
          : `区间 <b>[${l},${r}]</b>：枚举分割点均无法让左右两段合成同一个数（${tried.join(' ')}）——` +
            `此段<b>无法缩成单值</b>，dp[${l}][${r}] = <b>0</b>。`
      const formula =
        val > 0
          ? `dp[${l}][${r}]=dp[${l}][${bestK}]{+}1=${val - 1}{+}1=${val}`
          : `dp[${l}][${r}]=0`
      frames.push({ values: snap(), states, arrows, active: { r: l, c: r }, caption, formula })
    }
  }

  const fin = settled(dp)
  fin[key(bestCell.r, bestCell.c)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `整排能得到的<b>最大数字 = ${best}</b>（三角表里所有格的最大值，位于 dp[${bestCell.r}][${bestCell.c}]）。` +
      `注意：它不一定是右上角 dp[0][${n - 1}]——整段未必能缩成单值，但某个子段可以，248 的计分正是看全盘最大的那个数。`,
    formula: `\\text{ans}=\\max_{l\\le r} dp[l][r]=${best}`,
  })

  return {
    rows: n,
    cols: n,
    cell: 40,
    rowHeaderLabels: Array.from({ length: n }, (_, l) => `l=${l}`),
    colHeaderLabels: Array.from({ length: n }, (_, r) => `r=${r}`),
    frames,
  }
}
