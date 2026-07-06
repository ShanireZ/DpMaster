import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

/**
 * Kadane · 一维 dp[i]「以 a[i] 结尾的最大子段和」。
 * 每步在「接续前面（dp[i-1]+a[i]）」与「从 a[i] 另起一段」之间取较大者，并追踪全局最大。
 * 网格两行：第 0 行显示原数组 a[]（只读参照），第 1 行是逐格生长的 dp[]。
 * 答案 = dp[] 的全局最大值（最大子段可以在任意位置结尾）。
 */
export function kadane(a: number[]): VizModel {
  const n = a.length
  const dp: (number | null)[] = Array<number | null>(n).fill(null)
  // 第 0 行恒为原数组 a（对照），第 1 行是 dp（null = 还没算到）。
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
      `上排是原数组 <b>a[]</b>（只读参照），下排 <b>dp[i]</b> 表示「<b>以 a[i] 结尾</b>的最大子段和」。` +
      `每一步只做一道选择题：把 a[i] <b>接在前一段后面</b>，还是让它<b>自己另起</b>一段？`,
    formula: 'dp[i]=\\max(dp[i-1]+a_i,\\ a_i)',
  })

  let best = -Infinity
  let bestAt = 0

  for (let i = 0; i < n; i++) {
    const cont = i > 0 && dp[i - 1] !== null ? (dp[i - 1] as number) + a[i] : a[i]
    const fresh = a[i]
    // i=0 时只有「另起」一条路；否则在接续与另起之间取较大。
    const take = i === 0 ? fresh : Math.max(cont, fresh)
    const keepPrev = i > 0 && cont >= fresh // 接续胜出（并列时也算接续，段更长无妨）
    dp[i] = take
    if (take > best) {
      best = take
      bestAt = i
    }

    const states = settled()
    states[key(0, i)] = 'current'
    states[key(1, i)] = 'current'
    const arrows: Arrow[] = []
    if (i > 0) {
      // 接续来源：dp[i-1]。胜出则 chosen，否则 source（被「另起」压过）。
      states[key(1, i - 1)] = keepPrev ? 'chosen' : 'source'
      arrows.push({ from: { r: 1, c: i - 1 }, to: { r: 1, c: i }, kind: keepPrev ? 'chosen' : 'source' })
    }

    const caption =
      i === 0
        ? `起点 <b>i=0</b>：前面什么都没有，dp[0] 只能是 a[0] 自己 = <b>${fresh}</b>（一段的开头）。`
        : `轮到 <b>i=${i}</b>（a[${i}]=<b>${a[i]}</b>）。接续：dp[${i - 1}]+a[${i}] = ${dp[i - 1]}${a[i] >= 0 ? '+' + a[i] : a[i]} = <b>${cont}</b>；另起：a[${i}] = <b>${fresh}</b>。` +
          `${keepPrev ? `接续更大（或持平）→ 接在前段后面，dp[${i}]=<b>${take}</b>。` : `另起更大 → 从这里<b>重开一段</b>，dp[${i}]=<b>${take}</b>（前面的 ${cont} 是负担，丢掉）。`}`
    // ★formula 内禁中文，纯符号表达 max 这一步。
    const contStr = i > 0 ? String(cont) : String(fresh)
    const formula =
      i === 0
        ? `dp[0]=a_0=${fresh}`
        : `dp[${i}]=\\max(${contStr},\\ ${fresh})=${take}`
    frames.push({ values: snap(), states, active: { r: 1, c: i }, arrows, caption, formula })
  }

  const fin = settled()
  fin[key(1, bestAt)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `扫完。答案是 dp[] 里的<b>最大值</b>：<b>${best}</b>（在 i=${bestAt} 处结尾，a[${bestAt}]=${a[bestAt]}）。` +
      `注意最大子段可以在<b>任意位置</b>收尾，所以取整行最大，而不是 dp[n−1]。`,
    formula: `\\text{ans}=\\max_i dp[i]=${best}`,
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

/** kadane 的最终答案（全局最大子段和），用于外层读数。 */
export function kadaneAnswer(a: number[]): number {
  if (a.length === 0) return 0
  let best = a[0]
  let cur = a[0]
  for (let i = 1; i < a.length; i++) {
    cur = Math.max(a[i], cur + a[i])
    best = Math.max(best, cur)
  }
  return best
}

/** 最小子段和（把 max 换成 min 的 Kadane），环形补集要用。 */
export function minSegAnswer(a: number[]): number {
  if (a.length === 0) return 0
  let best = a[0]
  let cur = a[0]
  for (let i = 1; i < a.length; i++) {
    cur = Math.min(a[i], cur + a[i])
    best = Math.min(best, cur)
  }
  return best
}

/**
 * 「最小子段和」的填表演示（把 max 换成 min 的 Kadane）——环形补集技巧的另一半。
 * mn[i]「以 a[i] 结尾的最小子段和」，答案取全行最小；总和 − 这个最小值 = 绕首尾的最大段。
 * 结构与 kadane() 对称：两行网格（上 a[] 只读，下 mn[] 逐格生长）。
 */
export function minSegViz(a: number[]): VizModel {
  const n = a.length
  const mn: (number | null)[] = Array<number | null>(n).fill(null)
  const snap = (): (number | null)[][] => [a.slice(), mn.slice()]
  const settled = (): Record<string, CellState> => {
    const s: Record<string, CellState> = {}
    for (let c = 0; c < n; c++) s[key(0, c)] = 'settled'
    for (let c = 0; c < n; c++) if (mn[c] !== null) s[key(1, c)] = 'settled'
    return s
  }
  const frames: Frame[] = []
  const total = a.reduce((s, x) => s + x, 0)

  frames.push({
    values: snap(),
    states: settled(),
    caption:
      `同一套 Kadane，只把 <b>max 换成 min</b>：mn[i] 是「以 a[i] 结尾的<b>最小</b>子段和」。` +
      `算出全局最小子段后，<b>总和 − 最小子段</b> 就是「绕过首尾」的那段最大和。`,
    formula: 'mn[i]=\\min(mn[i-1]+a_i,\\ a_i)',
  })

  let worst = Infinity
  let worstAt = 0
  for (let i = 0; i < n; i++) {
    const cont = i > 0 && mn[i - 1] !== null ? (mn[i - 1] as number) + a[i] : a[i]
    const fresh = a[i]
    const take = i === 0 ? fresh : Math.min(cont, fresh)
    const keepPrev = i > 0 && cont <= fresh
    mn[i] = take
    if (take < worst) {
      worst = take
      worstAt = i
    }
    const states = settled()
    states[key(0, i)] = 'current'
    states[key(1, i)] = 'current'
    const arrows: Arrow[] = []
    if (i > 0) {
      states[key(1, i - 1)] = keepPrev ? 'chosen' : 'source'
      arrows.push({ from: { r: 1, c: i - 1 }, to: { r: 1, c: i }, kind: keepPrev ? 'chosen' : 'source' })
    }
    const caption =
      i === 0
        ? `起点 mn[0] = a[0] = <b>${fresh}</b>。`
        : `i=${i}：接续 mn[${i - 1}]+a[${i}] = <b>${cont}</b>，另起 a[${i}] = <b>${fresh}</b>，取<b>较小</b> → mn[${i}]=<b>${take}</b>。`
    const contStr = i > 0 ? String(cont) : String(fresh)
    const formula = i === 0 ? `mn[0]=${fresh}` : `mn[${i}]=\\min(${contStr},\\ ${fresh})=${take}`
    frames.push({ values: snap(), states, active: { r: 1, c: i }, arrows, caption, formula })
  }

  const fin = settled()
  fin[key(1, worstAt)] = 'invalid'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `最小子段和 = <b>${worst}</b>（i=${worstAt} 处结尾）。总和 = ${total}，于是绕首尾的最大段 = ` +
      `total − minSeg = ${total} − (${worst}) = <b>${total - worst}</b>。`,
    formula: `\\text{total}-\\min_i mn[i]=${total}-(${worst})=${total - worst}`,
  })

  return {
    rows: 2,
    cols: n,
    cell: 46,
    rowHeaderLabels: ['a', 'mn'],
    colHeaderLabels: Array.from({ length: n }, (_, i) => `${i}`),
    frames,
  }
}
