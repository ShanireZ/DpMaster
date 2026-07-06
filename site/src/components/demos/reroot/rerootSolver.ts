// —————————————————————————————————————————————————————————————
// 换根 DP · 共享求解器
//   一棵无根树（给边），换根 DP 求「每个点作为根时的某个量」。
//   这里以「距离和」为主线：dist[u] = Σ_v dep(u,v)（点到所有其它点的距离和）。
//
//   两遍扫描：
//     Pass 1（后序，固定根 0）：sz[u] = 子树大小，f0 = 固定根 0 的距离和 = Σ dep(0,v)。
//     Pass 2（前序，换根）：由父 p 的答案 O(1) 推子 u 的答案——
//        无权：f[u] = f[p] + (n - 2·sz[u])
//        点权：f[u] = f[p] + (W - 2·sz[u])   （W = 总点权，sz[u] 为子树点权和）
//        每条边带权 w 时再把 (…) 乘以 w：f[u] = f[p] + w·(W - 2·sub[u])
//   一次 DFS 定 sz、一次 DFS 换根，O(n) 求出全部 n 个点的答案。
//
//   本文件同时提供：
//     - buildTree：由边表定根、算 parent/children/depth/order（用于布局与动画）。
//     - layoutTree：整洁树布局（x 归一、y 分层），供自定义 SVG 画树。
//     - rerootDistSum：一次算好每个点的距离和（无权/点权/边权可选），并给两遍的中间量。
//     - rerootFrames：把「两遍扫描」拆成逐帧步骤，供 useStepPlayer 播放。
// —————————————————————————————————————————————————————————————

export interface Edge {
  u: number
  v: number
  w?: number // 边权，缺省 1
}

export interface TreeNodeLayout {
  id: number
  parent: number // 根的 parent = -1
  depth: number // 到根的边数（无权层级）
  children: number[]
  x: number // 布局横坐标（0..1 归一）
  y: number // = depth
}

export interface BuiltTree {
  n: number
  root: number
  adj: { to: number; w: number }[][] // 邻接表（无向，双向都存）
  parent: number[]
  depth: number[] // 到根的边数
  children: number[][]
  order: number[] // BFS 序（父恒先于子；反向即后序方向）
  weight: number[] // 点权（缺省全 1）
}

/** 由边表建邻接表 + 定根，算 parent/children/depth/BFS 序。edges 为 0-based。 */
export function buildTree(n: number, edges: Edge[], root = 0, weight?: number[]): BuiltTree {
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => [])
  for (const e of edges) {
    const w = e.w ?? 1
    adj[e.u].push({ to: e.v, w })
    adj[e.v].push({ to: e.u, w })
  }
  const parent = new Array<number>(n).fill(-1)
  const depth = new Array<number>(n).fill(0)
  const children: number[][] = Array.from({ length: n }, () => [])
  const order: number[] = []
  const seen = new Array<boolean>(n).fill(false)

  // BFS 定根（避免递归爆栈；父恒先于子）
  const q = [root]
  seen[root] = true
  parent[root] = -1
  while (q.length) {
    const u = q.shift() as number
    order.push(u)
    for (const { to } of adj[u]) {
      if (!seen[to]) {
        seen[to] = true
        parent[to] = u
        depth[to] = depth[u] + 1
        children[u].push(to)
        q.push(to)
      }
    }
  }

  return {
    n,
    root,
    adj,
    parent,
    depth,
    children,
    order,
    weight: weight ? weight.slice() : new Array<number>(n).fill(1),
  }
}

/**
 * 整洁树布局：叶子在最底排均匀铺开，内部节点居于其孩子的中点。
 *   x 归一到 (0,1)；y = depth。渲染时再缩放到画布像素。
 *   经典 tidy-tree 的简化版：后序给叶子递增 x、内部取孩子 x 均值。
 */
export function layoutTree(t: BuiltTree): { nodes: TreeNodeLayout[]; maxDepth: number } {
  const { n, root, children, parent, depth } = t
  const x = new Array<number>(n).fill(0)
  let leafCursor = 0
  let leafCount = 0
  for (let i = 0; i < n; i++) if (children[i].length === 0) leafCount++
  const denom = Math.max(1, leafCount) // 叶子数决定水平铺开的格数

  // 迭代式后序：先得到后序栈，再自底向上定 x
  const post: number[] = []
  const stack: number[] = [root]
  while (stack.length) {
    const u = stack.pop() as number
    post.push(u)
    for (const c of children[u]) stack.push(c)
  }
  post.reverse() // 现在孩子恒先于父

  for (const u of post) {
    if (children[u].length === 0) {
      x[u] = (leafCursor + 0.5) / denom
      leafCursor++
    } else {
      let s = 0
      for (const c of children[u]) s += x[c]
      x[u] = s / children[u].length
    }
  }

  let maxDepth = 0
  for (let i = 0; i < n; i++) maxDepth = Math.max(maxDepth, depth[i])

  const nodes: TreeNodeLayout[] = []
  for (let i = 0; i < n; i++) {
    nodes.push({
      id: i,
      parent: parent[i],
      depth: depth[i],
      children: children[i].slice(),
      x: x[i],
      y: depth[i],
    })
  }
  return { nodes, maxDepth }
}

// —————————————————————————————————————————————————————————————
// 距离和换根：一次算好每个点的距离和。
//   mode 'unweighted'：每条边长 1、每点权 1，dist[u]=到各点边数之和。
//   mode 'nodeWeighted'：点带权 wt[]（如「奶牛数」），dist[u]=Σ wt[v]·dep(u,v)。
//   边权：edges 里带 w 时自动纳入（dep 用边权和）。
// —————————————————————————————————————————————————————————————

export interface RerootResult {
  n: number
  fixedRoot: number
  sz: number[] // 子树点权和（无权时即子树节点数）
  down: number[] // down[u] = 子树内到 u 的带权距离和（后序求）
  dist: number[] // dist[u] = u 作为根的总距离和（换根后每点答案）
  coef: number[] // coef[u] = 换根系数 (W - 2·sz[u])，供讲解展示（root 无意义记 0）
  best: number // 最小距离和
  bestNode: number // 取到最小的点（树的带权重心方向）
  totalW: number // 总点权 W
}

export function rerootDistSum(
  t: BuiltTree,
  mode: 'unweighted' | 'nodeWeighted' = 'unweighted',
): RerootResult {
  const { n, order, adj, weight, root } = t
  const wt = mode === 'nodeWeighted' ? weight : new Array<number>(n).fill(1)
  const W = wt.reduce((a, b) => a + b, 0)

  const sz = new Array<number>(n).fill(0)
  const down = new Array<number>(n).fill(0)

  // 边权查表：edgeW(u,parent[u])
  const edgeWTo = (u: number, p: number) => {
    for (const { to, w } of adj[u]) if (to === p) return w
    return 1
  }

  // Pass 1：后序（order 反向）——sz[u]=子树点权和；down[u]=子树内带权距离和
  for (let i = order.length - 1; i >= 0; i--) {
    const u = order[i]
    sz[u] += wt[u]
    for (const c of t.children[u]) {
      const w = edgeWTo(c, u)
      sz[u] += sz[c]
      down[u] += down[c] + w * sz[c] // 子树 c 整体离 u 多走一条边 w，乘其点权和
    }
  }

  const dist = new Array<number>(n).fill(0)
  const coef = new Array<number>(n).fill(0)
  dist[root] = down[root]

  // Pass 2：前序（order 正向）——换根：dist[c] = dist[u] + w·(W - 2·sz[c])
  for (const u of order) {
    for (const c of t.children[u]) {
      const w = edgeWTo(c, u)
      coef[c] = W - 2 * sz[c]
      dist[c] = dist[u] + w * (W - 2 * sz[c])
    }
  }

  let best = Infinity
  let bestNode = root
  for (let i = 0; i < n; i++)
    if (dist[i] < best) {
      best = dist[i]
      bestNode = i
    }

  return { n, fixedRoot: root, sz, down, dist, coef, best, bestNode, totalW: W }
}

/** O(n²) 暴力：对每个点单独 BFS 求距离和——供演示里和换根 O(n) 对照读数。 */
export function bruteDistSum(
  t: BuiltTree,
  mode: 'unweighted' | 'nodeWeighted' = 'unweighted',
): { dist: number[]; ops: number } {
  const { n, adj, weight } = t
  const wt = mode === 'nodeWeighted' ? weight : new Array<number>(n).fill(1)
  const dist = new Array<number>(n).fill(0)
  let ops = 0
  for (let s = 0; s < n; s++) {
    const d = new Array<number>(n).fill(-1)
    d[s] = 0
    const q = [s]
    while (q.length) {
      const u = q.shift() as number
      ops++
      for (const { to, w } of adj[u])
        if (d[to] < 0) {
          d[to] = d[u] + w
          q.push(to)
        }
    }
    let sum = 0
    for (let v = 0; v < n; v++) sum += wt[v] * d[v]
    dist[s] = sum
  }
  return { dist, ops }
}

// —————————————————————————————————————————————————————————————
// 两遍扫描的逐帧步骤（供 useStepPlayer 播放）。
//   Pass 1：按后序逐点「点亮」，展示 sz[u] 如何自底向上累加。
//   Pass 2：按前序逐边「换根推进」，展示 f[c]=f[u]+(n-2·sz[c]) 的 O(1) 更新。
// —————————————————————————————————————————————————————————————

export type RerootPhase = 'intro' | 'pass1' | 'pass1done' | 'pass2' | 'done'

export interface RerootFrame {
  phase: RerootPhase
  // 高亮：本帧「正在处理」的节点（pass1 是被结算子树的点；pass2 是刚被换根算出的点）
  active: number | null
  fromParent: number | null // pass2：从哪个父换根过来（画高亮边）
  szKnown: boolean[] // 哪些点的 sz 已经算出（pass1 逐步点亮）
  distKnown: boolean[] // 哪些点的 dist 已经算出（root 起，pass2 逐步点亮）
  rootHighlight: number | null // 当前把哪个点当作根（pass2 推进时 = active）
  caption: string // HTML 文案
  formula: string // KaTeX（无中文）
}

export function rerootFrames(t: BuiltTree, res: RerootResult): RerootFrame[] {
  const { n, order, children } = t
  const { sz, dist, coef, fixedRoot, totalW } = res
  const frames: RerootFrame[] = []

  const szKnown = new Array<boolean>(n).fill(false)
  const distKnown = new Array<boolean>(n).fill(false)

  // 帧 0：引入
  frames.push({
    phase: 'intro',
    active: null,
    fromParent: null,
    szKnown: szKnown.slice(),
    distKnown: distKnown.slice(),
    rootHighlight: fixedRoot,
    caption:
      `先随便钉一个<b>固定根（这里取节点 ${fixedRoot + 1}）</b>。整个换根 DP 分两遍 DFS：` +
      `第一遍自底向上把每棵子树的大小 <b>sz[]</b> 求出来，第二遍再顺着边把「换根」一路推下去。`,
    formula: `\\text{fixed root}=${fixedRoot + 1}`,
  })

  // Pass 1：后序点亮 sz（order 反向）
  for (let i = order.length - 1; i >= 0; i--) {
    const u = order[i]
    szKnown[u] = true
    const childTxt =
      children[u].length === 0
        ? '它是叶子，子树只有它自己'
        : `= 它自己 + 各子树之和 = ${children[u].map((c) => `sz[${c + 1}]`).join(' + ')} + 1`
    frames.push({
      phase: 'pass1',
      active: u,
      fromParent: null,
      szKnown: szKnown.slice(),
      distKnown: distKnown.slice(),
      rootHighlight: fixedRoot,
      caption:
        `<b>第一遍 · 后序</b>：结算节点 <b>${u + 1}</b> 的子树大小 sz[${u + 1}] = <b>${sz[u]}</b>` +
        `（${childTxt}）。子必须先于父算好——所以是后序。`,
      formula: `\\mathrm{sz}[${u + 1}]=${sz[u]}`,
    })
  }

  // Pass 1 done：根的距离和
  distKnown[fixedRoot] = true
  frames.push({
    phase: 'pass1done',
    active: fixedRoot,
    fromParent: null,
    szKnown: szKnown.slice(),
    distKnown: distKnown.slice(),
    rootHighlight: fixedRoot,
    caption:
      `顺带在第一遍里把<b>固定根的距离和</b> f[${fixedRoot + 1}] = <b>${dist[fixedRoot]}</b> 也算出来` +
      `（子树里每个点离根多深，就贡献多少）。这是换根的<b>起点</b>——只有这一个点是「老实一层层加」得到的。`,
    formula: `f[${fixedRoot + 1}]=${dist[fixedRoot]}`,
  })

  // Pass 2：前序换根（order 正向），逐边推
  for (const u of order) {
    for (const c of children[u]) {
      distKnown[c] = true
      frames.push({
        phase: 'pass2',
        active: c,
        fromParent: u,
        szKnown: szKnown.slice(),
        distKnown: distKnown.slice(),
        rootHighlight: c,
        caption:
          `<b>第二遍 · 换根</b>：把根从 ${u + 1} 挪到相邻的 <b>${c + 1}</b>。` +
          `子树 ${c + 1} 里的 <b>${sz[c]}</b> 个点各<b>近 1</b>，子树外的 <b>${totalW - sz[c]}</b> 个点各<b>远 1</b>，` +
          `净变化 = (n − 2·sz[${c + 1}]) = (${totalW} − 2×${sz[c]}) = <b>${coef[c]}</b>。` +
          `于是 f[${c + 1}] = f[${u + 1}] + (${coef[c]}) = ${dist[u]} + (${coef[c]}) = <b>${dist[c]}</b>——一次加法，O(1)。`,
        formula:
          `f[${c + 1}]=f[${u + 1}]+(n-2\\,\\mathrm{sz}[${c + 1}])=${dist[u]}+(${coef[c]})=${dist[c]}`,
      })
    }
  }

  // done
  frames.push({
    phase: 'done',
    active: res.bestNode,
    fromParent: null,
    szKnown: szKnown.slice(),
    distKnown: distKnown.slice(),
    rootHighlight: res.bestNode,
    caption:
      `两遍 DFS 走完，<b>所有 ${n} 个点</b>的距离和都算出来了，总复杂度 <b>O(n)</b>。` +
      `其中最小的是节点 <b>${res.bestNode + 1}</b>（距离和 ${res.best}）——它就在树的<b>带权重心</b>方向。` +
      `对照：暴力对每个点各跑一遍 BFS 是 O(n²)。`,
    formula: `\\min_u f[u]=f[${res.bestNode + 1}]=${res.best}`,
  })

  return frames
}

// —————————————————————————————————————————————————————————————
// 子树内 / 子树外分解（inout 演示用）：
//   把根固定，dist[u] 拆成 down[u]（子树内，向下）+ up[u]（子树外，向上/父方向）。
//   换根本质：up[c] = (dist[parent] - 贡献自己子树的部分) + 父方向其余。
//   这里直接给出每个点的 down/up，并给「父方向 = 全局 − 自身子树」的读数。
// —————————————————————————————————————————————————————————————

export interface InOutResult {
  n: number
  root: number
  sz: number[]
  down: number[] // 子树内距离和
  up: number[] // 子树外距离和（父方向）
  dist: number[] // down + up
  totalW: number
}

export function inOutDecompose(t: BuiltTree): InOutResult {
  const res = rerootDistSum(t, 'unweighted')
  const { n } = t
  const down = res.down.slice()
  const dist = res.dist.slice()
  const up = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) up[i] = dist[i] - down[i]
  return { n, root: t.root, sz: res.sz, down, up, dist, totalW: res.totalW }
}

// —————————————————————————————————————————————————————————————
// 偏心距 / 树的中心（center 演示用）：
//   ecc[u] = 到最远点的距离（边数或边权和）。每点最远点距离靠换根两遍求：
//     Pass1 后序：downMax[u] = 子树内向下最长链（记最长 down1 与次长 down2，供换根扣除）。
//     Pass2 前序：up[u] = 经父往上/往父其它子树的最长链；ecc[u] = max(downMax[u], up[u])。
//   树的中心 = ecc 最小的点；直径 = max ecc（= 树的最长链长度）。
// —————————————————————————————————————————————————————————————

export interface EccResult {
  n: number
  down1: number[] // 子树内最长向下链
  down2: number[] // 子树内次长向下链（来自与 down1 不同的孩子）
  up: number[] // 子树外（父方向）最长链
  ecc: number[] // 偏心距 = max(down1, up)
  center: number // 偏心距最小的点（树的中心）
  radius: number // 最小偏心距
  diameter: number // 最大偏心距 = 树的直径长度
}

export function eccentricity(t: BuiltTree): EccResult {
  const { n, order, adj } = t
  const down1 = new Array<number>(n).fill(0)
  const down2 = new Array<number>(n).fill(0)
  const bestChild = new Array<number>(n).fill(-1) // 贡献 down1 的那个孩子
  const up = new Array<number>(n).fill(0)

  const edgeWTo = (u: number, p: number) => {
    for (const { to, w } of adj[u]) if (to === p) return w
    return 1
  }

  // Pass1：后序求 down1/down2（自底向上）
  for (let i = order.length - 1; i >= 0; i--) {
    const u = order[i]
    for (const c of t.children[u]) {
      const w = edgeWTo(c, u)
      const cand = down1[c] + w // 经孩子 c 向下的最长链
      if (cand > down1[u]) {
        down2[u] = down1[u]
        down1[u] = cand
        bestChild[u] = c
      } else if (cand > down2[u]) {
        down2[u] = cand
      }
    }
  }

  // Pass2：前序求 up（父方向最长链）
  for (const u of order) {
    for (const c of t.children[u]) {
      const w = edgeWTo(c, u)
      // c 往上：要么走 u 的 up，要么走 u 的「除 c 外」最长向下链，取大 + 这条边 w
      const uDownExceptC = bestChild[u] === c ? down2[u] : down1[u]
      up[c] = Math.max(up[u], uDownExceptC) + w
    }
  }

  const ecc = new Array<number>(n).fill(0)
  let center = 0
  let radius = Infinity
  let diameter = 0
  for (let i = 0; i < n; i++) {
    ecc[i] = Math.max(down1[i], up[i])
    if (ecc[i] < radius) {
      radius = ecc[i]
      center = i
    }
    if (ecc[i] > diameter) diameter = ecc[i]
  }

  return { n, down1, down2, up, ecc, center, radius, diameter }
}
