import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

/**
 * O(n²) 最长上升子序列 · 一维 dp[i]「以 a[i] 结尾的最长上升子序列长度」。
 * 每个 i 向左扫 j<i：若 a[j]<a[i] 则 dp[i]=max(dp[i], dp[j]+1)，初值 dp[i]=1（自身成串）。
 * 网格两行：第 0 行显示原数组 a[]（只读参照），第 1 行是逐格生长的 dp[]。
 * 答案 = dp[] 的全局最大值（LIS 可以以任意位置结尾）。
 */
export function lisNaive(a: number[]): VizModel {
  const n = a.length
  const dp: (number | null)[] = Array<number | null>(n).fill(null)
  // 第 0 行恒为原数组 a（用于对照），第 1 行是 dp（null=还没算到）。
  const snap = (): (number | null)[][] => [a.slice(), dp.slice()]

  // 已定稿的格：a 行整行始终 settled；dp 行只有已写入(非 null)的才 settled。
  const settled = (): Record<string, CellState> => {
    const s: Record<string, CellState> = {}
    for (let c = 0; c < n; c++) s[key(0, c)] = 'settled'
    for (let c = 0; c < n; c++) if (dp[c] !== null) s[key(1, c)] = 'settled'
    return s
  }

  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(),
    caption:
      `上排是原数组 <b>a[]</b>（只读参照），下排 <b>dp[i]</b> 表示「以 a[i] 结尾的最长上升子序列长度」。` +
      `每个 dp[i] 至少是 <b>1</b>（数字自己就是长度 1 的串），再看左边有没有更矮的数能接在它前面。`,
    formula: 'dp[i]=1\\ \\ (\\text{init, each element alone})',
  })

  for (let i = 0; i < n; i++) {
    // 先落自身：dp[i] 起步为 1。
    let best = 1
    let bestFrom = -1
    dp[i] = best

    {
      const states = settled()
      states[key(0, i)] = 'current'
      states[key(1, i)] = 'current'
      frames.push({
        values: snap(),
        states,
        active: { r: 1, c: i },
        caption:
          `轮到 <b>i=${i}</b>（a[${i}]=<b>${a[i]}</b>）。先给它一个保底：<b>dp[${i}]=1</b>` +
          `（它自己单独成一个长度 1 的上升串）。接着往左扫 j&lt;${i}，找能接在它前面的更矮的数。`,
        formula: `dp[${i}]=1`,
      })
    }

    for (let j = 0; j < i; j++) {
      const canExtend = a[j] < a[i]
      const cand = (dp[j] as number) + 1
      const prevBest = best // 比较前的 dp[i]，供 formula 展示 max 的第一个参数
      const better = canExtend && cand > best
      if (better) {
        best = cand
        bestFrom = j
        dp[i] = best
      }

      const states = settled()
      states[key(0, j)] = canExtend ? 'source' : 'invalid'
      states[key(1, j)] = canExtend ? 'source' : 'invalid'
      states[key(0, i)] = 'current'
      states[key(1, i)] = 'current'
      const arrows: Arrow[] = canExtend
        ? [{ from: { r: 1, c: j }, to: { r: 1, c: i }, kind: better ? 'chosen' : 'source' }]
        : []
      if (better) {
        states[key(1, j)] = 'chosen'
        states[key(0, j)] = 'chosen'
      }

      const caption = canExtend
        ? `看 <b>j=${j}</b>：a[${j}]=<b>${a[j]}</b> &lt; a[${i}]=<b>${a[i]}</b>，可以接。` +
          `候选长度 dp[${j}]+1 = ${dp[j]}+1 = <b>${cand}</b>` +
          `${better ? `，比当前 dp[${i}] 更长 → 更新 dp[${i}]=<b>${best}</b>` : `，不超过当前 dp[${i}]=<b>${best}</b>，保持不变`}。`
        : `看 <b>j=${j}</b>：a[${j}]=<b>${a[j]}</b> ≥ a[${i}]=<b>${a[i]}</b>，接上去就不是「上升」了，<b>跳过</b>。`
      // ★formula 内禁中文，纯符号表达这一步的比较。
      const formula = canExtend
        ? `dp[${i}]=\\max(${prevBest},\\ dp[${j}]{+}1)=\\max(${prevBest},\\ ${cand})=${best}`
        : `a[${j}]\\ge a[${i}]\\ \\Rightarrow\\ \\text{skip}`
      frames.push({ values: snap(), states, active: { r: 1, c: i }, arrows, caption, formula })
    }

    // 结束该 i：定稿。
    {
      const states = settled()
      states[key(1, i)] = 'settled'
      if (bestFrom >= 0) states[key(1, bestFrom)] = 'source'
      const arrows: Arrow[] =
        bestFrom >= 0 ? [{ from: { r: 1, c: bestFrom }, to: { r: 1, c: i }, kind: 'chosen' }] : []
      frames.push({
        values: snap(),
        states,
        arrows,
        caption:
          `<b>dp[${i}]=${best}</b> 定了` +
          `${bestFrom >= 0 ? `——最优是接在 a[${bestFrom}]=${a[bestFrom]}（dp=${dp[bestFrom]}）后面` : `——左边没有更矮的数，只能自成一串`}。`,
        formula: `dp[${i}]=${best}`,
      })
    }
  }

  // 找全局最大值作为答案。
  let ans = 0
  let ansAt = 0
  for (let i = 0; i < n; i++) {
    const v = dp[i] as number
    if (v > ans) {
      ans = v
      ansAt = i
    }
  }
  const fin = settled()
  fin[key(1, ansAt)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `扫完。答案是 dp[] 里的<b>最大值</b>：<b>${ans}</b>（在 i=${ansAt} 处取得，a[${ansAt}]=${a[ansAt]}）。` +
      `注意 LIS 可以在<b>任意位置</b>结尾，所以取整行最大，而不是 dp[n−1]。`,
    formula: `\\text{LIS}=\\max_i dp[i]=${ans}`,
  })

  return {
    rows: 2,
    cols: n,
    cell: 46,
    rowHeaderLabels: ['a', 'dp'],
    colHeaderLabels: Array.from({ length: n }, (_, i) => `${i}`),
    frames,
  }
}
