import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

// 只把「已算出（非 null）」的格标为 settled；下三角恒为 null（.blank 灰底空白）。
function settled(vals: (number | null)[][]): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let r = 0; r < vals.length; r++)
    for (let c = 0; c < vals[r].length; c++) if (vals[r][c] !== null) s[key(r, c)] = 'settled'
  return s
}

// 把字符串规整成 ≤8 的小写字符数组；空串兜底为 'a'。
export function normalize(raw: string): string[] {
  const cs = raw
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 8)
    .split('')
  return cs.length ? cs : ['a']
}

/**
 * 回文区间 DP 三角表：dp[i][j] = 子串 s[i..j] 的【最长回文子序列】长度。
 *   dp[i][i] = 1；
 *   s[i]==s[j] → dp[i+1][j-1] + 2（把这对同字符裹在最优回文两端）；
 *   否则       → max(dp[i+1][j], dp[i][j-1])（丢左端或丢右端，取大）。
 * ★按区间长度 len = 2..n 递推——短区间先算好，长区间才能收缩引用其内层子区间。
 *   网格：行 i、列 j，只用上三角（i ≤ j），下三角留 null 渲染成空白。
 *   收缩来源在【左下 dp[i+1][j-1]】；取大来源在【下 dp[i+1][j] / 左 dp[i][j-1]】。
 */
export function palindromeLps(s: string[]): VizModel {
  const n = s.length

  // 只用上三角：dp[i][j]，i ≤ j；其余保持 null。
  const dp: (number | null)[][] = Array.from({ length: n }, () => Array<number | null>(n).fill(null))
  for (let i = 0; i < n; i++) dp[i][i] = 1
  const snap = () => dp.map((row) => row.slice())
  const frames: Frame[] = []

  frames.push({
    values: snap(),
    states: settled(dp),
    caption:
      '<b>对角线（区间长度 1）</b>：单个字符自成回文，长度 <b>1</b>——dp[i][i]=1。' +
      '下三角（i&gt;j）不是合法区间，留作空白。这是整张三角表的地基。',
    formula: 'dp[i][i] = 1',
  })

  // ★外层枚举区间长度，由短到长
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      const match = s[i] === s[j]

      let val: number
      const arrows: Arrow[] = []
      const states = settled(dp)
      let caption: string
      let formula: string

      if (match) {
        // 收缩：把 s[i]、s[j] 这对同字符裹到内层最优回文两端，长度 +2。
        const inner = len === 2 ? 0 : (dp[i + 1][j - 1] as number)
        val = inner + 2
        dp[i][j] = val
        if (len > 2) {
          states[key(i + 1, j - 1)] = 'chosen'
          arrows.push({ from: { r: i + 1, c: j - 1 }, to: { r: i, c: j }, kind: 'chosen' })
        }
        caption =
          `区间 <b>[${i},${j}]</b>（长度 ${len}）：两端 s[${i}]=s[${j}]=<b>'${s[i]}'</b> <b>相等</b>，` +
          `把这对字符裹在内层最优回文两端 → ` +
          (len === 2
            ? `长度直接为 <b>2</b>（内层为空）`
            : `dp[${i + 1}][${j - 1}]+2 = ${inner}+2 = <b>${val}</b>（来源在<b>左下</b>）`) +
          `。`
        formula =
          len === 2
            ? `dp[${i}][${j}] = 2\\quad(s_{${i}}{=}s_{${j}})`
            : `dp[${i}][${j}] = dp[${i + 1}][${j - 1}]{+}2 = ${inner}{+}2 = ${val}`
      } else {
        // 取大：两端字符不同，至少丢掉一端；丢左端→dp[i+1][j]，丢右端→dp[i][j-1]。
        const dropLeft = dp[i + 1][j] as number
        const dropRight = dp[i][j - 1] as number
        val = Math.max(dropLeft, dropRight)
        dp[i][j] = val
        const useLeft = dropLeft >= dropRight // 展示时优先高亮「下」来源
        if (useLeft) {
          states[key(i + 1, j)] = 'chosen'
          arrows.push({ from: { r: i + 1, c: j }, to: { r: i, c: j }, kind: 'chosen' })
        } else {
          states[key(i, j - 1)] = 'chosen'
          arrows.push({ from: { r: i, c: j - 1 }, to: { r: i, c: j }, kind: 'chosen' })
        }
        caption =
          `区间 <b>[${i},${j}]</b>（长度 ${len}）：两端 s[${i}]=<b>'${s[i]}'</b>、s[${j}]=<b>'${s[j]}'</b> <b>不等</b>，` +
          `至少丢一端 → max(丢左 dp[${i + 1}][${j}]=${dropLeft}, 丢右 dp[${i}][${j - 1}]=${dropRight}) = <b>${val}</b>` +
          `（取<b>${useLeft ? '下' : '左'}</b>邻）。`
        formula =
          `dp[${i}][${j}] = \\max(dp[${i + 1}][${j}],\\,dp[${i}][${j - 1}]) = \\max(${dropLeft},${dropRight}) = ${val}`
      }

      states[key(i, j)] = 'current'
      frames.push({ values: snap(), states, arrows, active: { r: i, c: j }, caption, formula })
    }
  }

  const fin = settled(dp)
  fin[key(0, n - 1)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `答案在<b>右上角 dp[0][${n - 1}] = ${dp[0][n - 1]}</b>——整串 "${s.join('')}" 的最长回文子序列长度。` +
      `三角表沿对角线一层层向右上填满。`,
    formula: `dp[0][${n - 1}] = ${dp[0][n - 1]}`,
  })

  return {
    rows: n,
    cols: n,
    cell: 42,
    rowHeaderLabels: Array.from({ length: n }, (_, i) => `i=${i}·${s[i]}`),
    colHeaderLabels: Array.from({ length: n }, (_, j) => `j=${j}·${s[j]}`),
    frames,
  }
}

// —— 第二演示：最少插入构回文（双指针从两端收缩，逐步把串补成回文） ——

export interface InsertStep {
  // 当前处理的一对下标（相对原串）
  i: number
  j: number
  matched: boolean // true=两端相等直接内缩；false=需插入
  insertChar?: string // 插入的字符
  insertSide?: 'left' | 'right' // 插到左端还是右端（镜像另一端）
  built: string // 本步之后已「锁定」的回文外壳（从两端向内长）
}

export interface InsertResult {
  chars: string[]
  insertCount: number // = len − 最长回文子序列
  lps: number
  palindrome: string // 补齐后的回文串
  steps: InsertStep[]
}

/**
 * 最少插入使串变回文：双指针 i、j 从两端向内收缩。
 *   s[i]==s[j] → 直接内缩（这对天然对称，0 插入）；
 *   否则 → 在【较省】的一侧插入对端字符补齐（+1），再内缩那一侧。
 * 「较省」由 min-insertion 区间 DP 决策：dp[i][j]（不等）= min(dp[i+1][j], dp[i][j-1]) + 1。
 * 插入总次数恰等于 len − 最长回文子序列长度——与主演示同源。
 */
export function palindromeInsert(raw: string): InsertResult {
  const chars = normalize(raw)
  const n = chars.length

  // min-insertion 表：dp[i][j] = 把 s[i..j] 补成回文的最少插入数。
  const dp: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(0))
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      if (chars[i] === chars[j]) dp[i][j] = i + 1 <= j - 1 ? dp[i + 1][j - 1] : 0
      else dp[i][j] = Math.min(dp[i + 1][j], dp[i][j - 1]) + 1
    }
  }

  const steps: InsertStep[] = []
  const left: string[] = [] // 已锁定的左半（从最外层往内）
  const right: string[] = [] // 已锁定的右半（对称，最终反向拼）
  let i = 0
  let j = n - 1
  const shell = () => left.join('') + '…' + right.slice().reverse().join('')

  while (i < j) {
    if (chars[i] === chars[j]) {
      left.push(chars[i])
      right.push(chars[j])
      steps.push({ i, j, matched: true, built: shell() })
      i++
      j--
    } else if (dp[i + 1][j] <= dp[i][j - 1]) {
      // 丢左端更省 ⇒ 在【右端】补一个 s[i]，与左端 s[i] 配成对
      left.push(chars[i])
      right.push(chars[i])
      steps.push({ i, j, matched: false, insertChar: chars[i], insertSide: 'right', built: shell() })
      i++
    } else {
      // 丢右端更省 ⇒ 在【左端】补一个 s[j]
      left.push(chars[j])
      right.push(chars[j])
      steps.push({ i, j, matched: false, insertChar: chars[j], insertSide: 'left', built: shell() })
      j--
    }
  }

  // 收尾：中间剩一个字符（回文中心）或恰好收拢
  const center = i === j ? chars[i] : ''
  const palindrome = left.join('') + center + right.slice().reverse().join('')

  return {
    chars,
    insertCount: dp[0][n - 1],
    lps: n - dp[0][n - 1],
    palindrome,
    steps,
  }
}
