// 七大 DP 部分与其类型清单（内容骨架，来源见方案 02）
export type PartId = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'

export interface DPType {
  slug: string
  title: string
  blurb: string
  status: 'ready' | 'planned'
}

export interface Part {
  id: PartId
  code: string // A–G
  title: string
  motif: string // 几何母题（一句话）
  tagline: string
  types: DPType[]
}

export const PARTS: Part[] = [
  {
    id: 'a', code: 'A', title: '线性 DP',
    motif: '沿一条链推进的刻度序列',
    tagline: '把问题排成一条推进的序列，dp[i] 只依赖更早的状态。',
    types: [
      { slug: 'path', title: '路径型 / 递推入门', blurb: '数字三角形·过河卒·方格取数', status: 'planned' },
      { slug: 'maxseg', title: '最大子段和', blurb: 'Kadane·环形·两段不相交', status: 'planned' },
      { slug: 'lis', title: '最长上升子序列 LIS', blurb: 'O(n²) 与 O(n log n)·导弹拦截', status: 'planned' },
      { slug: 'lcs', title: '最长公共子序列 LCS', blurb: '排列 LCS→LIS·计数', status: 'planned' },
      { slug: 'edit', title: '编辑距离', blurb: '删/插/改三向转移', status: 'planned' },
      { slug: 'fsm', title: '线性状态机 DP', blurb: '受限选取·股票买卖', status: 'planned' },
      { slug: 'count', title: '计数 / 划分型', blurb: '方案数·高精度·整数划分', status: 'planned' },
    ],
  },
  {
    id: 'b', code: 'B', title: '背包 DP',
    motif: '逐格填充的容器 / 方格堆',
    tagline: '容量受限下的取舍：物品件数属性决定了背包的谱系。',
    types: [
      { slug: '01', title: '01 背包', blurb: '取或不取·一维逆推·恰好装满', status: 'ready' },
      { slug: 'complete', title: '完全背包', blurb: '无限件·一维正推', status: 'ready' },
      { slug: 'multiple', title: '多重背包', blurb: '朴素·二进制·单调队列', status: 'planned' },
      { slug: 'group', title: '分组背包', blurb: '每组至多选一件', status: 'planned' },
      { slug: 'mixed', title: '混合背包', blurb: '01/完全/多重同题', status: 'planned' },
      { slug: 'cost2d', title: '二维费用背包', blurb: '两种费用同时受限', status: 'planned' },
      { slug: 'dep', title: '有依赖的背包', blurb: '主件-附件·依赖→分组', status: 'planned' },
      { slug: 'variant', title: '背包综合变形', blurb: '方案数·撤销·具体方案', status: 'planned' },
      { slug: 'fractional', title: '辨析：分数背包=贪心', blurb: '可分割⇒贪心 vs 整取⇒DP', status: 'planned' },
    ],
  },
  {
    id: 'c', code: 'C', title: '区间 DP',
    motif: '嵌套的括号弧 / 区间桥',
    tagline: 'dp[l][r] 表示区间最优，枚举分割/合并点，按长度递推。',
    types: [
      { slug: 'stone', title: '石子合并（链形）', blurb: '区间合并基础模型', status: 'planned' },
      { slug: 'ring', title: '环形区间 DP', blurb: '断环为链·能量项链', status: 'planned' },
      { slug: 'palindrome', title: '回文 / 括号', blurb: '收缩扩展·端点匹配', status: 'planned' },
      { slug: 'tree', title: '加分二叉树型', blurb: '枚举根·区间即子树', status: 'planned' },
      { slug: 'merge', title: '合并 / 删除类', blurb: '2048·区间删除代价', status: 'planned' },
    ],
  },
  {
    id: 'd', code: 'D', title: '矩阵 DP',
    motif: '方阵网格 / 矩阵块',
    tagline: '两条主线：网格坐标上的 DP，与矩阵快速幂加速的递推。',
    types: [
      { slug: 'grid', title: '网格 / 矩阵上的 DP', blurb: '路径·最大正方形·双线程', status: 'planned' },
      { slug: 'matpow', title: '矩阵快速幂加速', blurb: '递推→矩阵幂·O(k³log n)', status: 'planned' },
    ],
  },
  {
    id: 'e', code: 'E', title: '换根 DP',
    motif: '以不同节点为心的放射树',
    tagline: '二次扫描：固定根一遍 DFS，再一遍换根 O(1) 推每个点。',
    types: [
      { slug: 'basic', title: '换根基础模型', blurb: '二次扫描骨架', status: 'planned' },
      { slug: 'distsum', title: '距离和换根', blurb: '深度和·带权距离和', status: 'planned' },
      { slug: 'inout', title: '子树内外合并', blurb: '距离≤k 点权和', status: 'planned' },
      { slug: 'center', title: '中心 / 偏心距', blurb: '树的直径·核', status: 'planned' },
    ],
  },
  {
    id: 'f', code: 'F', title: '树形 DP',
    motif: '分叉的树冠',
    tagline: 'dp[u][…] 表示子树最优，后序遍历自底向上合并。',
    types: [
      { slug: 'select', title: '选点 / 最大独立集', blurb: '没有上司的舞会', status: 'planned' },
      { slug: 'knapsack', title: '树上背包', blurb: '二叉苹果树·选课', status: 'planned' },
      { slug: 'diameter', title: '直径 / 重心 DP', blurb: '过点最长链', status: 'planned' },
      { slug: 'cover', title: '覆盖 / 支配 / 染色', blurb: '三状态·染色计数', status: 'planned' },
      { slug: 'count', title: '方案数 / 距离统计', blurb: '联合权值·括号树', status: 'planned' },
    ],
  },
  {
    id: 'g', code: 'G', title: '状压 DP',
    motif: '比特点阵 / 超立方体',
    tagline: '状态是一个集合，用二进制整数表示；转移在 mask 间进行。',
    types: [
      { slug: 'board', title: '棋盘 / 轮廓状压', blurb: '互不侵犯·炮兵阵地', status: 'planned' },
      { slug: 'tsp', title: '集合状压 / TSP', blurb: '最短 Hamilton·吃奶酪', status: 'planned' },
      { slug: 'cover', title: '状压 + 覆盖', blurb: '愤怒的小鸟·宝藏', status: 'planned' },
      { slug: 'subset', title: '综合技巧', blurb: '枚举子集·计数变形', status: 'planned' },
      { slug: 'plug', title: '插头 DP（选修）', blurb: '轮廓线连通性', status: 'planned' },
    ],
  },
]

export const getPart = (id: string): Part | undefined => PARTS.find((p) => p.id === id)
