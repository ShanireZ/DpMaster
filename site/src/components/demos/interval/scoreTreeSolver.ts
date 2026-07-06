import type { VizModel, Frame, CellState, Arrow } from '../../dp-engine/types'
import { key } from '../../dp-engine/types'

// —————————————————————————————————————————————————————————————
// 加分二叉树 · 区间 DP
//   中序遍历固定为 1..n，一段连续区间 [i,j] 恰好对应二叉树的一棵子树。
//   dp[i][j] = 把 [i,j] 建成一棵子树能得到的最大加分。
//   dp[i][j] = max_{k∈[i,j]} ( dp[i][k-1] * dp[k+1][j] + score[k] )
//     枚举根 k：左子树 = [i,k-1]、右子树 = [k+1,j]，都是更短的已解子区间。
//     空子树（i>j）记 1（乘法单位元，空树加分约定为 1）。
//   root[i][j] 记录取到最优时选的根，供前序回溯还原树结构。
//   与石子合并同构：那里「枚举分割点」，这里「枚举根」——都是区间 DP。
// —————————————————————————————————————————————————————————————

export interface ScoreTreeResult {
  n: number
  dp: number[][] // 上三角有效；空区间用 get() 取 1
  root: number[][] // root[i][j] = 最优根下标（0-based）
  ans: number // dp[0][n-1]
  preorder: number[] // 前序遍历的节点编号（1-based）
}

/** 纯求解：返回 dp 表、root 表、答案与前序遍历。空子树加分记 1。 */
export function buildScoreTree(score: number[]): ScoreTreeResult {
  const n = score.length
  const dp: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(0))
  const root: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(-1))
  const get = (i: number, j: number) => (i > j ? 1 : dp[i][j])

  for (let i = 0; i < n; i++) {
    dp[i][i] = score[i]
    root[i][i] = i
  }
  // ★外层枚举区间长度，由短到长——短子树先算好，长区间枚举根时才有得引用
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      let best = -Infinity
      let bk = i
      for (let k = i; k <= j; k++) {
        const cand = get(i, k - 1) * get(k + 1, j) + score[k]
        if (cand > best) {
          best = cand
          bk = k
        }
      }
      dp[i][j] = best
      root[i][j] = bk
    }
  }

  const preorder: number[] = []
  const walk = (i: number, j: number) => {
    if (i > j) return
    const k = root[i][j]
    preorder.push(k + 1) // 1-based 节点编号
    walk(i, k - 1)
    walk(k + 1, j)
  }
  if (n > 0) walk(0, n - 1)

  return { n, dp, root, ans: dp[0][n - 1], preorder }
}

/**
 * 主演示模型：区间 DP 三角表逐格填。
 *   网格：行 i、列 j，只用上三角（i ≤ j）。
 *   每帧高亮当前格 dp[i][j]、被选根 k 及其左右子树来源 dp[i][k-1]、dp[k+1][j]。
 *   照 stoneMerge 三角结构；区别只在转移是「乘法 + 枚举根」而非「加法 + 枚举分割点」。
 */
export function scoreTree(score: number[]): VizModel {
  const n = score.length
  const dp: (number | null)[][] = Array.from({ length: n }, () =>
    Array<number | null>(n).fill(null),
  )
  const root: number[][] = Array.from({ length: n }, () => Array<number>(n).fill(-1))
  const get = (i: number, j: number) => (i > j ? 1 : (dp[i][j] as number))
  const snap = () => dp.map((row) => row.slice())
  const frames: Frame[] = []

  for (let i = 0; i < n; i++) {
    dp[i][i] = score[i]
    root[i][i] = i
  }
  frames.push({
    values: snap(),
    states: settledLive(dp, n),
    caption:
      '<b>对角线（区间长度 1）</b>：单个节点自成一棵子树，加分就是它的分数——dp[i][i]=score[i]。' +
      '空子树（i&gt;r）约定加分为 <b>1</b>（乘法单位元），不占格子。这是三角表的地基。',
    formula: 'dp[i][i] = \\mathrm{score}[i]',
  })

  // ★外层枚举区间长度，由短到长
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1
      let best = -Infinity
      let bk = i
      for (let k = i; k <= j; k++) {
        const cand = get(i, k - 1) * get(k + 1, j) + score[k]
        if (cand > best) {
          best = cand
          bk = k
        }
      }
      dp[i][j] = best
      root[i][j] = bk

      const states = settledLive(dp, n)
      const arrows: Arrow[] = []
      // 左子树来源 [i,bk-1]（可能为空）、右子树来源 [bk+1,j]（可能为空）
      if (bk - 1 >= i) {
        states[key(i, bk - 1)] = 'chosen'
        arrows.push({ from: { r: i, c: bk - 1 }, to: { r: i, c: j }, kind: 'chosen' })
      }
      if (bk + 1 <= j) {
        states[key(bk + 1, j)] = 'chosen'
        arrows.push({ from: { r: bk + 1, c: j }, to: { r: i, c: j }, kind: 'chosen' })
      }
      states[key(i, j)] = 'current'

      // 候选清单：每个根 k 的 左·右·+score
      const parts: string[] = []
      for (let k = i; k <= j; k++) {
        const L = get(i, k - 1)
        const R = get(k + 1, j)
        const cand = L * R + score[k]
        parts.push(`${k === bk ? '★' : ''}根${k + 1}:${L}×${R}+${score[k]}=${cand}`)
      }
      const L = get(i, bk - 1)
      const R = get(bk + 1, j)
      const caption =
        `区间 <b>[${i + 1},${j + 1}]</b>（中序第 ${i + 1}～${j + 1} 个节点，长度 ${len}）：枚举根 k，` +
        `候选「左子树 × 右子树 + score[k]」= {${parts.join('，')}}，取最大 <b>${best}</b>` +
        `（根 = 节点 ${bk + 1}，左子树加分 ${L}、右子树加分 ${R}）→ dp[${i + 1}][${j + 1}] = <b>${best}</b>。`
      const formula =
        `dp[${i + 1}][${j + 1}]=\\max_{k}(dp[${i + 1}][k{-}1]\\cdot dp[k{+}1][${j + 1}]+\\mathrm{score}[k])` +
        `=${L}\\times${R}+${score[bk]}=${best}`
      frames.push({ values: snap(), states, arrows, active: { r: i, c: j }, caption, formula })
    }
  }

  const fin = settledLive(dp, n)
  fin[key(0, n - 1)] = 'chosen'
  frames.push({
    values: snap(),
    states: fin,
    caption:
      `答案在<b>右上角 dp[1][${n}] = ${dp[0][n - 1]}</b>——把中序 1～${n} 全部节点建成一棵二叉树的最大加分。` +
      `根就是 root[1][${n}] 记下的那个节点，顺着 root 递归即可前序还原整棵树（见下一个演示）。`,
    formula: `dp[1][${n}]=${dp[0][n - 1]}`,
  })

  return {
    rows: n,
    cols: n,
    cell: 44,
    rowHeaderLabels: Array.from({ length: n }, (_, i) => `i=${i + 1}`),
    colHeaderLabels: Array.from({ length: n }, (_, j) => `j=${j + 1}`),
    frames,
  }
}

function settledLive(dp: (number | null)[][], n: number): Record<string, CellState> {
  const s: Record<string, CellState> = {}
  for (let i = 0; i < n; i++)
    for (let j = i; j < n; j++) if (dp[i][j] !== null) s[key(i, j)] = 'settled'
  return s
}

// —————————————————————————————————————————————————————————————
// 第二演示用：前序回溯把最优二叉树的结构还原成可布局的节点/连边。
//   每个节点带上它对应的中序区间 [lo,hi]（1-based）——「区间即子树」。
// —————————————————————————————————————————————————————————————

export interface TreeNode {
  id: number // 1-based 节点编号（= 中序位置）
  score: number
  lo: number // 该子树覆盖的中序区间左端（1-based）
  hi: number // 右端
  subScore: number // dp[lo-1][hi-1]，该子树加分
  depth: number
  left: TreeNode | null
  right: TreeNode | null
  x: number // 布局坐标（0..1 归一，渲染时缩放）
  y: number
}

/** 由 root 表前序回溯出带布局坐标的树；x 用中序位置铺开，y 用深度。 */
export function layoutScoreTree(res: ScoreTreeResult): {
  nodes: TreeNode[]
  maxDepth: number
} {
  const { root, dp, n } = res
  const nodes: TreeNode[] = []
  let maxDepth = 0
  const build = (i: number, j: number, depth: number): TreeNode | null => {
    if (i > j) return null
    const k = root[i][j]
    maxDepth = Math.max(maxDepth, depth)
    const node: TreeNode = {
      id: k + 1,
      score: res.dp[k][k],
      lo: i + 1,
      hi: j + 1,
      subScore: dp[i][j],
      depth,
      left: null,
      right: null,
      x: (k + 0.5) / n, // 中序位置归一到 0..1
      y: depth,
    }
    node.left = build(i, k - 1, depth + 1)
    node.right = build(k + 1, j, depth + 1)
    nodes.push(node)
    return node
  }
  if (n > 0) build(0, n - 1, 0)
  return { nodes, maxDepth }
}
