// —————————————————————————————————————————————————————————————
// 树形 DP 演示的共享内核
//   1) 一棵「有根树」的紧凑表示：邻接表 + 固定根，后序遍历自底向上。
//   2) 通用布局：叶子在 x 轴上等距铺开，内部节点居中于孩子；y 按深度分层。
//   3) 各类型 DP（独立集 / 支配集 / 最大子树和 / 直径）的求解 + 逐帧动画数据。
//   演示视图（IndepSetDemo 等）读这里产出的 layout + steps，用自绘 SVG 画树。
// —————————————————————————————————————————————————————————————

/** 一棵有根树。parent[i] = i 的父亲（根为 -1）；children 由 parent 派生。 */
export interface RootedTree {
  n: number
  root: number
  parent: number[]
  children: number[][]
  /** 后序遍历顺序（孩子恒在父亲之前）——树形 DP 的处理次序。 */
  postorder: number[]
  weight: number[] // 点权（部分 DP 用，如独立集/支配集）
}

/** 由「父亲数组」建树（根的 parent 记 -1）。会算出 children 与后序序列。 */
export function buildTree(parent: number[], weight: number[]): RootedTree {
  const n = parent.length
  let root = 0
  const children: number[][] = Array.from({ length: n }, () => [])
  for (let i = 0; i < n; i++) {
    if (parent[i] < 0) root = i
    else children[parent[i]].push(i)
  }
  // 后序：递归压栈，孩子先于父亲进入结果
  const postorder: number[] = []
  const dfs = (u: number) => {
    for (const c of children[u]) dfs(c)
    postorder.push(u)
  }
  dfs(root)
  return { n, root, parent, children, postorder, weight }
}

// —————————————————————————————————————————————————————————————
// 布局：x = 叶子等距 + 内部节点取孩子均值；y = 深度
// —————————————————————————————————————————————————————————————
export interface NodeLayout {
  id: number
  x: number // 0..1 归一
  depth: number
}
export interface TreeLayout {
  nodes: NodeLayout[]
  byId: Map<number, NodeLayout>
  maxDepth: number
  edges: { a: number; b: number }[]
}

export function layoutTree(tree: RootedTree): TreeLayout {
  const { children, root } = tree
  const depth: number[] = Array(tree.n).fill(0)
  const x: number[] = Array(tree.n).fill(0)
  let leafCursor = 0
  let leafCount = 0
  for (let i = 0; i < tree.n; i++) if (children[i].length === 0) leafCount++
  const span = Math.max(1, leafCount - 1)

  const place = (u: number, d: number): number => {
    depth[u] = d
    if (children[u].length === 0) {
      x[u] = span === 0 ? 0.5 : leafCursor / span
      leafCursor++
      return x[u]
    }
    let sum = 0
    for (const c of children[u]) sum += place(c, d + 1)
    x[u] = sum / children[u].length
    return x[u]
  }
  place(root, 0)

  let maxDepth = 0
  for (let i = 0; i < tree.n; i++) maxDepth = Math.max(maxDepth, depth[i])
  const nodes: NodeLayout[] = []
  const byId = new Map<number, NodeLayout>()
  for (let i = 0; i < tree.n; i++) {
    const nd = { id: i, x: x[i], depth: depth[i] }
    nodes.push(nd)
    byId.set(i, nd)
  }
  const edges: { a: number; b: number }[] = []
  for (let i = 0; i < tree.n; i++)
    for (const c of children[i]) edges.push({ a: i, b: c })

  return { nodes, byId, maxDepth, edges }
}

// —————————————————————————————————————————————————————————————
// F1 · 最大权独立集（没有上司的舞会）
//   dp[u][0] = u 不选时，u 子树的最大权（孩子可选可不选，取各自较大）
//   dp[u][1] = u 选时，u 子树的最大权（孩子必须都不选）+ w[u]
//   答案 = max(dp[root][0], dp[root][1])
// —————————————————————————————————————————————————————————————
export interface IndepStep {
  u: number // 本步刚处理完的节点（后序）
  dp0: number // dp[u][0]
  dp1: number // dp[u][1]
  // 到本步为止已确定 dp 值的节点集合（用于逐步点亮）
  settled: number[]
  caption: string
  leaf: boolean
}
export interface IndepResult {
  dp0: number[]
  dp1: number[]
  ans: number
  steps: IndepStep[]
  chosen: Set<number> // 最优独立集里被选中的点
}

export function solveIndepSet(tree: RootedTree): IndepResult {
  const { n, root, children, weight, postorder } = tree
  const dp0 = Array(n).fill(0)
  const dp1 = Array(n).fill(0)
  const steps: IndepStep[] = []
  const settled: number[] = []

  for (const u of postorder) {
    dp1[u] = weight[u]
    dp0[u] = 0
    for (const c of children[u]) {
      dp0[u] += Math.max(dp0[c], dp1[c]) // 孩子自由：取较大
      dp1[u] += dp0[c] // u 选了，孩子必不选
    }
    settled.push(u)
    const leaf = children[u].length === 0
    const caption = leaf
      ? `叶子 <b>${u + 1}</b>（权 ${weight[u]}）：没有孩子。不选它 dp[${u + 1}][0]=<b>0</b>；选它 dp[${u + 1}][1]=<b>${weight[u]}</b>。`
      : `节点 <b>${u + 1}</b>（权 ${weight[u]}）合并 ${children[u].length} 个孩子：不选它 → 每个孩子各取较大之和 = <b>${dp0[u]}</b>；选它 → 孩子全不选之和 + ${weight[u]} = <b>${dp1[u]}</b>。`
    steps.push({ u, dp0: dp0[u], dp1: dp1[u], settled: settled.slice(), caption, leaf })
  }

  const ans = Math.max(dp0[root], dp1[root])
  // 回溯出被选中的点：自顶向下，若某点「选」更优且父亲没选它，则选它
  const chosen = new Set<number>()
  const pick = (u: number, parentChosen: boolean) => {
    let take: boolean
    if (parentChosen) take = false
    else take = dp1[u] >= dp0[u]
    if (take) chosen.add(u)
    for (const c of children[u]) pick(c, take)
  }
  pick(root, false)

  return { dp0, dp1, ans, steps, chosen }
}

// —————————————————————————————————————————————————————————————
// F4 · 带权最小支配集 三状态（保安站岗）
//   dp[u][0] = u 处放了警卫（自己覆盖自己 + 所有孩子）
//   dp[u][1] = u 没放，但被某个孩子覆盖了（至少一个孩子放了警卫）
//   dp[u][2] = u 没放，也没被孩子覆盖——等着「父亲」来覆盖
//   合并见下方转移。根不能停在状态 2（没人覆盖它）。
// —————————————————————————————————————————————————————————————
export interface CoverStep {
  u: number
  d0: number
  d1: number
  d2: number
  settled: number[]
  caption: string
  leaf: boolean
}
export interface CoverResult {
  d0: number[]
  d1: number[]
  d2: number[]
  ans: number
  steps: CoverStep[]
  guards: Set<number> // 最优方案里放了警卫的点
}

const INF = 1e9

export function solveDominatingSet(tree: RootedTree): CoverResult {
  const { n, root, children, weight, postorder } = tree
  const d0 = Array(n).fill(0)
  const d1 = Array(n).fill(0)
  const d2 = Array(n).fill(0)
  const steps: CoverStep[] = []
  const settled: number[] = []

  for (const u of postorder) {
    const kids = children[u]
    if (kids.length === 0) {
      d0[u] = weight[u] // 自己放警卫
      d1[u] = INF // 叶子无孩子，不可能"被孩子覆盖"
      d2[u] = 0 // 自己不放、等父亲覆盖，代价 0
    } else {
      // 状态0：u 放警卫 → 每个孩子取三状态最小（孩子被 u 覆盖了，无强制）
      let s0 = weight[u]
      for (const c of kids) s0 += Math.min(d0[c], d1[c], d2[c])
      d0[u] = s0

      // 状态2：u 不放、也不靠孩子覆盖 → 每个孩子必须"自给自足"（放警卫 d0 或被自己孩子覆盖 d1），不能是 d2
      let s2 = 0
      for (const c of kids) s2 += Math.min(d0[c], d1[c])
      d2[u] = s2

      // 状态1：u 不放，但至少一个孩子放警卫覆盖 u。基线同 s2，再强制"至少一个孩子取 d0"，
      //   取「把某个孩子从 min(d0,d1) 改成 d0」的最小增量。
      let extra = INF
      let s1base = 0
      for (const c of kids) {
        s1base += Math.min(d0[c], d1[c])
        extra = Math.min(extra, d0[c] - Math.min(d0[c], d1[c]))
      }
      d1[u] = s1base + extra
    }

    settled.push(u)
    const leaf = kids.length === 0
    const caption = leaf
      ? `叶子 <b>${u + 1}</b>（造价 ${weight[u]}）：放警卫 dp0=<b>${weight[u]}</b>；被孩子覆盖不可能（dp1=∞）；空着等父亲 dp2=<b>0</b>。`
      : `节点 <b>${u + 1}</b>（造价 ${weight[u]}）：放警卫 dp0=孩子各取三态最小之和+${weight[u]}=<b>${d0[u]}</b>；靠孩子覆盖 dp1=<b>${d1[u]}</b>；空等父亲 dp2=孩子须自足=<b>${d2[u]}</b>。`
    steps.push({ u, d0: d0[u], d1: d1[u], d2: d2[u], settled: settled.slice(), caption, leaf })
  }

  const ans = Math.min(d0[root], d1[root]) // 根不能是 d2（无人覆盖）
  // 回溯放警卫的点
  const guards = new Set<number>()
  // state: 该点被要求处于的状态；0=放警卫,1=被孩子覆盖,2=等父亲(此处父亲已覆盖它→当作已覆盖)
  const pick = (u: number, needCover: boolean) => {
    const kids = children[u]
    // 选出该点实际取的状态
    let st: 0 | 1 | 2
    if (needCover) {
      // 必须被覆盖：在 d0 / d1 里挑小的
      st = d0[u] <= d1[u] ? 0 : 1
    } else {
      // u 是根或已被父覆盖：三态挑小
      const m = Math.min(d0[u], d1[u], d2[u])
      st = m === d0[u] ? 0 : m === d1[u] ? 1 : 2
    }
    if (st === 0) {
      guards.add(u)
      for (const c of kids) pick(c, false) // 孩子被 u 覆盖
    } else if (st === 1) {
      // 至少一个孩子放警卫：把增量最小的那个孩子设为 d0
      let bestC = -1
      let bestExtra = INF
      for (const c of kids) {
        const ex = d0[c] - Math.min(d0[c], d1[c])
        if (ex < bestExtra) {
          bestExtra = ex
          bestC = c
        }
      }
      for (const c of kids) {
        if (c === bestC) pick(c, false) // 这个孩子会取 d0（放警卫），它自身被覆盖
        else pick(c, true) // 其余孩子须自足（d0/d1）
      }
    } else {
      // st===2：u 等父亲覆盖，孩子须自足
      for (const c of kids) pick(c, true)
    }
  }
  pick(root, true) // 根必须被覆盖
  return { d0, d1, d2, ans, steps, guards }
}

// —————————————————————————————————————————————————————————————
// F3 · 含 u 的最大子树和（最大子树和 P1122）与 树的直径（过点最长链）
//   down[u] = 从 u 向下延伸、必含 u 的一条链的最大点权和（孩子贡献为正才接）
//   直径 = 对每个 u，取其孩子里两条最大 down 拼接 + w[u]，全局最大。
// —————————————————————————————————————————————————————————————
export interface ChainStep {
  u: number
  down: number
  best1: number // 最大孩子 down（正贡献）
  best2: number // 次大
  through: number // 过 u 的最优（best1+best2+w[u]）
  settled: number[]
  caption: string
}
export interface ChainResult {
  down: number[]
  through: number[]
  ans: number // 全局最大子树和（= max down）
  diameter: number // 全局过点最长（= max through）
  argMax: number // down 最大的节点
  argThrough: number // through 最大的节点
  steps: ChainStep[]
}

export function solveMaxSubtreeChain(tree: RootedTree): ChainResult {
  const { n, children, weight, postorder } = tree
  const down = Array(n).fill(0)
  const through = Array(n).fill(0)
  const steps: ChainStep[] = []
  const settled: number[] = []

  for (const u of postorder) {
    let best1 = 0
    let best2 = 0
    for (const c of children[u]) {
      const g = Math.max(0, down[c]) // 孩子链为正才接上，否则截断（贡献 0）
      if (g > best1) {
        best2 = best1
        best1 = g
      } else if (g > best2) {
        best2 = g
      }
    }
    down[u] = weight[u] + best1
    through[u] = weight[u] + best1 + best2
    settled.push(u)
    const caption =
      children[u].length === 0
        ? `叶子 <b>${u + 1}</b>（权 ${weight[u]}）：向下链 down=<b>${down[u]}</b>；过它的链只有它自己 = <b>${through[u]}</b>。`
        : `节点 <b>${u + 1}</b>（权 ${weight[u]}）：孩子向上链取正值，最大 ${best1}、次大 ${best2}。向下最优 down=${weight[u]}+${best1}=<b>${down[u]}</b>；<b>过 ${u + 1}</b> 的链 = 两条拼起来 ${weight[u]}+${best1}+${best2}=<b>${through[u]}</b>。`
    steps.push({ u, down: down[u], best1, best2, through: through[u], settled: settled.slice(), caption })
  }

  let ans = -INF
  let argMax = tree.root
  let diameter = -INF
  let argThrough = tree.root
  for (let i = 0; i < n; i++) {
    if (down[i] > ans) {
      ans = down[i]
      argMax = i
    }
    if (through[i] > diameter) {
      diameter = through[i]
      argThrough = i
    }
  }
  return { down, through, ans, diameter, argMax, argThrough, steps }
}

// —————————————————————————————————————————————————————————————
// F2 · 树上背包（二叉苹果树式：保留 K 条边的最大边权和）
//   edgeW[u] = u 到其父亲那条边的权（根为 0，无边）。
//   dp[u][j] = 在 u 的子树里，保留 j 条边时能收集到的最大边权和。
//     合并孩子 c：把「保留 (c 边 + 其子树里若干边)」当一组物品做分组背包。
//     取孩子 c、且给它分配 t 条子树内边 → 用掉 1（连 c 的边）+ t 条，收益 edgeW[c]+dp[c][t]。
//   这里节点权当 0（只算边权），是二叉苹果树 P2015 的核。
// —————————————————————————————————————————————————————————————
export interface TreeKnapResult {
  dp: number[][] // dp[u][j]
  sizeEdges: number[] // 每节点子树内边总数（dp 列上界）
  ans: number // dp[root][K]
  order: number[] // 后序处理次序
}

/** parentEdge[i] = i 与父亲之间的边权（根记 0）。K = 保留边数。 */
export function solveTreeKnapsack(tree: RootedTree, parentEdge: number[], K: number): TreeKnapResult {
  const { n, root, children, postorder } = tree
  const sizeEdges = Array(n).fill(0)
  const dp: number[][] = Array.from({ length: n }, () => Array<number>(K + 1).fill(0))

  for (const u of postorder) {
    // dp[u][0] = 0（子树里一条边都不留）
    let cap = 0 // u 子树目前可留的边数上界
    for (const c of children[u]) {
      cap += sizeEdges[c] + 1 // 加上「连 c 的边」及 c 子树里的边
      const capped = Math.min(cap, K)
      // 分组背包：j 从大到小；孩子 c 这组，枚举给它 t 条（含连它的 1 条）
      for (let j = capped; j >= 1; j--) {
        for (let t = 1; t <= sizeEdges[c] + 1 && t <= j; t++) {
          // 给 c 组分配 t 条边：1 条连 c + (t-1) 条 c 子树内
          const gain = parentEdge[c] + dp[c][t - 1]
          if (dp[u][j - t] + gain > dp[u][j]) dp[u][j] = dp[u][j - t] + gain
        }
      }
    }
    sizeEdges[u] = cap
  }

  return { dp, sizeEdges, ans: dp[root][Math.min(K, sizeEdges[root])], order: postorder.slice() }
}

// —————————————————————————————————————————————————————————————
// F5 · 联合权值（P1351）：距离恰为 2 的点对，其点权乘积之和 / 最大值
//   距离 2 ⇔ 两点有公共邻居 m（m 是路径中间点）。
//   枚举中间点 m，它的所有邻居两两配对（有序）——用「邻居权和的平方 − 平方和」O(度) 求和。
//   在树上：m 的邻居 = 它的父亲（若有）+ 所有孩子。这里给出每个中间点的贡献，供演示逐点展示。
// —————————————————————————————————————————————————————————————
export interface JointResult {
  neighbors: number[][] // 每个点的邻居列表（父 + 孩子）
  midSum: number[] // 以该点为中间点的乘积和（有序对，= sum^2 - sq）
  midMax: number[] // 以该点为中间点的最大乘积
  totalSum: number // 全树乘积和
  globalMax: number // 全树最大乘积
}

export function solveJointWeight(tree: RootedTree): JointResult {
  const { n, parent, children, weight } = tree
  const neighbors: number[][] = Array.from({ length: n }, () => [])
  for (let i = 0; i < n; i++) {
    if (parent[i] >= 0) neighbors[i].push(parent[i])
    for (const c of children[i]) neighbors[i].push(c)
  }
  const midSum = Array(n).fill(0)
  const midMax = Array(n).fill(0)
  let totalSum = 0
  let globalMax = 0
  for (let m = 0; m < n; m++) {
    const nb = neighbors[m]
    if (nb.length < 2) continue
    let sum = 0
    let sq = 0
    let mx1 = 0
    let mx2 = 0
    for (const v of nb) {
      const wv = weight[v]
      sum += wv
      sq += wv * wv
      if (wv > mx1) {
        mx2 = mx1
        mx1 = wv
      } else if (wv > mx2) {
        mx2 = wv
      }
    }
    midSum[m] = sum * sum - sq // 有序对乘积和
    midMax[m] = mx1 * mx2
    totalSum += midSum[m]
    globalMax = Math.max(globalMax, midMax[m])
  }
  return { neighbors, midSum, midMax, totalSum, globalMax }
}
