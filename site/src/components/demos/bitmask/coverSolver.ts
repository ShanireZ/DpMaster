// 集合覆盖状压 DP：dp[S] = 覆盖元素集合 S 所需的最小代价。
// 每个「选择」覆盖一批元素（压成 mask），转移：dp[S | cover_k] = min(dp[S | cover_k], dp[S] + cost_k)。

export interface Choice {
  cover: number // 覆盖的元素 mask
  cost: number
}

const INF = 1e9

export interface CoverStep {
  S: number // 从这个已覆盖集合出发
  choice: number // 用第几个选择（index）
  nextS: number // 覆盖后的新集合
  before: number // dp[nextS] 转移前
  cand: number // dp[S] + cost
  took: boolean // 是否更新
  dp: number[] // 当前完整 dp 快照（INF 用 -1 表示不可达）
  full: number
}

export interface CoverResult {
  steps: CoverStep[]
  ans: number // dp[全集]
  full: number
  n: number
}

/** 逐步求解，产出帧序列。universe = 元素个数 n（全集 = (1<<n)-1）。 */
export function solveCover(n: number, choices: Choice[]): CoverResult {
  const full = (1 << n) - 1
  const dp = Array<number>(full + 1).fill(INF)
  dp[0] = 0
  const steps: CoverStep[] = []
  const snap = () => dp.map((v) => (v >= INF ? -1 : v))

  // 按已覆盖集合大小递增处理（保证 dp[S] 先定稿）
  for (let S = 0; S <= full; S++) {
    if (dp[S] >= INF) continue
    for (let k = 0; k < choices.length; k++) {
      const nextS = S | choices[k].cover
      const cand = dp[S] + choices[k].cost
      const before = dp[nextS]
      const took = cand < before
      if (took) dp[nextS] = cand
      // 只记录「有推进」的转移（nextS != S），避免无意义帧
      if (nextS !== S) {
        steps.push({ S, choice: k, nextS, before: before >= INF ? -1 : before, cand, took, dp: snap(), full })
      }
    }
  }

  return { steps, ans: dp[full] >= INF ? -1 : dp[full], full, n }
}

export function toBits(x: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => (x >> i) & 1)
}
