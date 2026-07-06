// 编辑距离回溯：先填 dp 表，再从 dp[m][n] 沿「当初取的那条来源」倒着走回 dp[0][0]，
// 还原出把 A 变成 B 的一串操作（保留 / 删 / 插 / 改）。纯函数，供自建可视化用。

export type Op = 'keep' | 'del' | 'ins' | 'sub'

export interface Step {
  op: Op
  a?: string // 涉及的 A 字符（del / keep / sub 有）
  b?: string // 涉及的 B 字符（ins / keep / sub 有）
}

export interface TraceResult {
  dist: number
  steps: Step[] // 从左到右、把 A 逐步对齐到 B 的操作序列
  dp: number[][]
}

/** 返回编辑距离、回溯出的操作序列、以及完整 dp 表。 */
export function editTrace(a: string, b: string): TraceResult {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array<number>(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const same = a[i - 1] === b[j - 1]
      const del = dp[i - 1][j] + 1
      const ins = dp[i][j - 1] + 1
      const sub = dp[i - 1][j - 1] + (same ? 0 : 1)
      dp[i][j] = Math.min(del, ins, sub)
    }
  }

  // 回溯：优先走对角线（匹配/改），其次删，最后插——与主演示的 chosen 判定一致。
  const rev: Step[] = []
  let i = m
  let j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const same = a[i - 1] === b[j - 1]
      const sub = dp[i - 1][j - 1] + (same ? 0 : 1)
      if (dp[i][j] === sub) {
        rev.push({ op: same ? 'keep' : 'sub', a: a[i - 1], b: b[j - 1] })
        i--
        j--
        continue
      }
    }
    if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      rev.push({ op: 'del', a: a[i - 1] })
      i--
      continue
    }
    // 剩下只能是插入
    rev.push({ op: 'ins', b: b[j - 1] })
    j--
  }

  rev.reverse()
  return { dist: dp[m][n], steps: rev, dp }
}
