// 互不侵犯（P1896 模型）状压 DP 求解器 + 逐行演示的帧数据。
// 状态 dp[row][j][mask]：前 row 行、共放 j 个王、第 row 行摆法为 mask 的方案数。
// 行内合法：mask & (mask<<1) == 0（同行不相邻）；
// 行间合法：与上一行 prev 互不攻击 → (mask & prev)==0 且 (mask & (prev<<1))==0 且 (mask & (prev>>1))==0。

/** 一行摆法 mask 是否行内合法（无横向相邻）。 */
export function rowValid(mask: number): boolean {
  return (mask & (mask << 1)) === 0
}

/** 两行 mask、prev 是否互不攻击（含正上、左上、右上三个方向）。 */
export function betweenValid(mask: number, prev: number): boolean {
  if ((mask & prev) !== 0) return false
  if ((mask & (prev << 1)) !== 0) return false
  if ((mask & (prev >> 1)) !== 0) return false
  return true
}

export function popcount(x: number): number {
  let c = 0
  while (x) {
    x &= x - 1
    c++
  }
  return c
}

/** 枚举 N 列里所有「行内合法」的摆法 mask（升序）。 */
export function legalRowMasks(N: number): number[] {
  const res: number[] = []
  for (let m = 0; m < 1 << N; m++) if (rowValid(m)) res.push(m)
  return res
}

/** 统计 N×N 棋盘放 K 个互不攻击的王的方案总数（完整 DP）。 */
export function countKings(N: number, K: number): number {
  const masks = legalRowMasks(N)
  const cnt = masks.map((m) => popcount(m))
  // dp[j][mi] = 放 j 个、最后一行取 masks[mi] 的方案数
  let dp: number[][] = Array.from({ length: K + 1 }, () => Array<number>(masks.length).fill(0))
  for (let mi = 0; mi < masks.length; mi++) if (cnt[mi] <= K) dp[cnt[mi]][mi] += 1

  for (let row = 2; row <= N; row++) {
    const ndp: number[][] = Array.from({ length: K + 1 }, () => Array<number>(masks.length).fill(0))
    for (let mi = 0; mi < masks.length; mi++) {
      for (let j = cnt[mi]; j <= K; j++) {
        for (let pi = 0; pi < masks.length; pi++) {
          if (dp[j - cnt[mi]][pi] === 0) continue
          if (!betweenValid(masks[mi], masks[pi])) continue
          ndp[j][mi] += dp[j - cnt[mi]][pi]
        }
      }
    }
    dp = ndp
  }
  let total = 0
  for (let mi = 0; mi < masks.length; mi++) total += dp[K][mi]
  return total
}

// ——— 逐行演示：找到一种合法布局，把它按行拆成帧 ———

export interface BoardFrame {
  rows: number[] // 已经确定的各行 mask（长度 = 当前行数）
  activeRow: number // 正在放的行（0-based），-1 = 完成
  conflictCols: number[] // 若非法，冲突列（相对当前行）
  placed: number // 已放王数
  caption: string
}

/** 回溯搜出「第一种」放满 K 个王的合法布局（各行 mask）。搜不到返回 null。 */
export function findOneLayout(N: number, K: number): number[] | null {
  const masks = legalRowMasks(N)
  const rows: number[] = []
  const dfs = (row: number, placed: number): boolean => {
    if (placed === K) {
      // 剩余行全空即可
      while (rows.length < N) rows.push(0)
      return true
    }
    if (row >= N) return false
    for (const m of masks) {
      const c = popcount(m)
      if (placed + c > K) continue
      if (row > 0 && !betweenValid(m, rows[row - 1])) continue
      // 剪枝：剩余行数 × 每行最多能放的王数是否够
      rows.push(m)
      if (dfs(row + 1, placed + c)) return true
      rows.pop()
    }
    return false
  }
  return dfs(0, 0) ? rows : null
}

/** 把一种布局按行拆成演示帧：逐行「亮出」这一行的王，并注明与上一行不冲突。 */
export function layoutFrames(N: number, K: number, layout: number[]): BoardFrame[] {
  const frames: BoardFrame[] = []
  frames.push({ rows: [], activeRow: 0, conflictCols: [], placed: 0, caption: `目标：在 ${N}×${N} 棋盘放 <b>${K}</b> 个互不攻击的王。逐行确定每行摆法。` })
  let placed = 0
  for (let r = 0; r < N; r++) {
    const m = layout[r]
    placed += popcount(m)
    const cols: number[] = []
    for (let c = 0; c < N; c++) if ((m >> c) & 1) cols.push(c)
    const prev = r > 0 ? layout[r - 1] : 0
    let cap: string
    if (m === 0) {
      cap = `第 <b>${r + 1}</b> 行：这一行不放（mask=0）。`
    } else {
      const rowsafe = `行内 mask &amp; (mask&lt;&lt;1)=0，横向不相邻`
      const between =
        r > 0
          ? prev === 0
            ? '，上一行为空，无行间约束'
            : `，且与上一行错开（(mask &amp; prev)、(mask &amp; prev&lt;&lt;1)、(mask &amp; prev&gt;&gt;1) 全为 0）`
          : ''
      cap = `第 <b>${r + 1}</b> 行：在第 ${cols.map((c) => c + 1).join('、')} 列放王（${rowsafe}${between}）。已放 <b>${placed}</b> 个。`
    }
    frames.push({ rows: layout.slice(0, r + 1), activeRow: r, conflictCols: [], placed, caption: cap })
  }
  frames.push({
    rows: layout.slice(),
    activeRow: -1,
    conflictCols: [],
    placed,
    caption: `完成：放满 <b>${K}</b> 个互不攻击的王——这是<strong>其中一种</strong>合法布局。合法布局共有多少种？下方「看方案总数」用状压 DP 一次算出。`,
  })
  return frames
}
