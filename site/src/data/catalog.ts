import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type PartId = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g'
type LazyView = LazyExoticComponent<ComponentType>
type LessonContentModule = `../content/${string}.tsx`
type LessonContentLoader = () => Promise<{ default: ComponentType }>

function lessonContent(source: LessonContentModule, load: LessonContentLoader) {
  return {
    contentSource: source,
    loadContent: load,
    content: lazy(load),
  }
}

export interface DPType {
  slug: string
  title: string
  blurb: string
  status: 'ready' | 'planned'
  contentSource: LessonContentModule
  loadContent: LessonContentLoader
  content: LazyView
}

export interface Part {
  id: PartId
  code: string
  title: string
  motif: string
  tagline: string
  game: { title: string; content: LazyView }
  types: DPType[]
}

export interface Lesson {
  part: Part
  type: DPType
  path: string
}

export const PARTS: Part[] = [
  {
    id: 'a', code: 'A', title: '背包 DP',
    motif: '逐格填充的容器 / 方格堆',
    tagline: '容量受限下的取舍：物品件数属性决定了背包的谱系。',
    game: { title: '装包大师', content: lazy(() => import('../components/games/PackMasterGame')) },
    types: [
      { slug: '01', title: '01 背包', blurb: '取或不取·一维逆推·恰好装满', status: 'ready', ...lessonContent('../content/a/Knapsack01.tsx', () => import('../content/a/Knapsack01')) },
      { slug: 'complete', title: '完全背包', blurb: '无限件·一维正推', status: 'ready', ...lessonContent('../content/a/KnapsackComplete.tsx', () => import('../content/a/KnapsackComplete')) },
      { slug: 'multiple', title: '多重背包', blurb: '朴素·二进制·单调队列', status: 'ready', ...lessonContent('../content/a/KnapsackMultiple.tsx', () => import('../content/a/KnapsackMultiple')) },
      { slug: 'group', title: '分组背包', blurb: '每组至多选一件', status: 'ready', ...lessonContent('../content/a/KnapsackGroup.tsx', () => import('../content/a/KnapsackGroup')) },
      { slug: 'mixed', title: '混合背包', blurb: '01/完全/多重同题', status: 'ready', ...lessonContent('../content/a/KnapsackMixed.tsx', () => import('../content/a/KnapsackMixed')) },
      { slug: 'cost2d', title: '二维费用背包', blurb: '两种费用同时受限', status: 'ready', ...lessonContent('../content/a/KnapsackCost2D.tsx', () => import('../content/a/KnapsackCost2D')) },
      { slug: 'dep', title: '有依赖的背包', blurb: '主件-附件·依赖→分组', status: 'ready', ...lessonContent('../content/a/KnapsackDependency.tsx', () => import('../content/a/KnapsackDependency')) },
      { slug: 'variant', title: '背包综合变形', blurb: '方案数·撤销·具体方案', status: 'ready', ...lessonContent('../content/a/KnapsackVariant.tsx', () => import('../content/a/KnapsackVariant')) },
      { slug: 'fractional', title: '辨析：分数背包=贪心', blurb: '可分割⇒贪心 vs 整取⇒DP', status: 'ready', ...lessonContent('../content/a/KnapsackFractional.tsx', () => import('../content/a/KnapsackFractional')) },
    ],
  },
  {
    id: 'b', code: 'B', title: '线性 DP',
    motif: '沿一条链推进的刻度序列',
    tagline: '把问题排成一条推进的序列，dp[i] 只依赖更早的状态。',
    game: { title: 'LIS 接龙', content: lazy(() => import('../components/games/LISChainGame')) },
    types: [
      { slug: 'path', title: '路径型 / 递推入门', blurb: '数字三角形·过河卒·方格取数', status: 'ready', ...lessonContent('../content/b/LinearPath.tsx', () => import('../content/b/LinearPath')) },
      { slug: 'maxseg', title: '最大子段和', blurb: 'Kadane·环形·两段不相交', status: 'ready', ...lessonContent('../content/b/MaxSubarray.tsx', () => import('../content/b/MaxSubarray')) },
      { slug: 'lis', title: '最长上升子序列 LIS', blurb: 'O(n²) 与 O(n log n)·导弹拦截', status: 'ready', ...lessonContent('../content/b/LIS.tsx', () => import('../content/b/LIS')) },
      { slug: 'lcs', title: '最长公共子序列 LCS', blurb: '排列 LCS→LIS·计数', status: 'ready', ...lessonContent('../content/b/LCS.tsx', () => import('../content/b/LCS')) },
      { slug: 'edit', title: '编辑距离', blurb: '删/插/改三向转移', status: 'ready', ...lessonContent('../content/b/EditDistance.tsx', () => import('../content/b/EditDistance')) },
      { slug: 'fsm', title: '线性状态机 DP', blurb: '受限选取·股票买卖', status: 'ready', ...lessonContent('../content/b/StateMachine.tsx', () => import('../content/b/StateMachine')) },
      { slug: 'count', title: '计数 / 划分型', blurb: '方案数·高精度·整数划分', status: 'ready', ...lessonContent('../content/b/LinearCount.tsx', () => import('../content/b/LinearCount')) },
    ],
  },
  {
    id: 'c', code: 'C', title: '区间 DP',
    motif: '嵌套的括号弧 / 区间桥',
    tagline: 'dp[l][r] 表示区间最优，枚举分割/合并点，按长度递推。',
    game: { title: '合并石子', content: lazy(() => import('../components/games/StoneMergeGame')) },
    types: [
      { slug: 'stone', title: '石子合并（链形）', blurb: '区间合并基础模型', status: 'ready', ...lessonContent('../content/c/StoneMerge.tsx', () => import('../content/c/StoneMerge')) },
      { slug: 'ring', title: '环形区间 DP', blurb: '断环为链·能量项链', status: 'ready', ...lessonContent('../content/c/RingInterval.tsx', () => import('../content/c/RingInterval')) },
      { slug: 'palindrome', title: '回文 / 括号', blurb: '收缩扩展·端点匹配', status: 'ready', ...lessonContent('../content/c/Palindrome.tsx', () => import('../content/c/Palindrome')) },
      { slug: 'tree', title: '加分二叉树型', blurb: '枚举根·区间即子树', status: 'ready', ...lessonContent('../content/c/ScoreTree.tsx', () => import('../content/c/ScoreTree')) },
      { slug: 'merge', title: '合并 / 删除类', blurb: '2048·区间删除代价', status: 'ready', ...lessonContent('../content/c/MergeInterval.tsx', () => import('../content/c/MergeInterval')) },
    ],
  },
  {
    id: 'd', code: 'D', title: '矩阵 DP',
    motif: '方阵网格 / 矩阵块',
    tagline: '两条主线：网格坐标上的 DP，与矩阵快速幂加速的递推。',
    game: { title: '幂次加速器', content: lazy(() => import('../components/games/PowerAccelGame')) },
    types: [
      { slug: 'grid', title: '网格 / 矩阵上的 DP', blurb: '路径·最大正方形·双线程', status: 'ready', ...lessonContent('../content/d/GridDP.tsx', () => import('../content/d/GridDP')) },
      { slug: 'matpow', title: '矩阵快速幂加速', blurb: '递推→矩阵幂·O(k³log n)', status: 'ready', ...lessonContent('../content/d/MatrixPower.tsx', () => import('../content/d/MatrixPower')) },
    ],
  },
  {
    id: 'e', code: 'E', title: '换根 DP',
    motif: '以不同节点为心的放射树',
    tagline: '二次扫描：固定根一遍 DFS，再一遍换根 O(1) 推每个点。',
    game: { title: '换根巡礼', content: lazy(() => import('../components/games/RerootGame')) },
    types: [
      { slug: 'basic', title: '换根基础模型', blurb: '二次扫描骨架', status: 'ready', ...lessonContent('../content/e/RerootBasic.tsx', () => import('../content/e/RerootBasic')) },
      { slug: 'distsum', title: '距离和换根', blurb: '深度和·带权距离和', status: 'ready', ...lessonContent('../content/e/RerootDistSum.tsx', () => import('../content/e/RerootDistSum')) },
      { slug: 'inout', title: '子树内外合并', blurb: '距离≤k 点权和', status: 'ready', ...lessonContent('../content/e/RerootInOut.tsx', () => import('../content/e/RerootInOut')) },
      { slug: 'center', title: '中心 / 偏心距', blurb: '树的直径·核', status: 'ready', ...lessonContent('../content/e/RerootCenter.tsx', () => import('../content/e/RerootCenter')) },
    ],
  },
  {
    id: 'f', code: 'F', title: '树形 DP',
    motif: '分叉的树冠',
    tagline: 'dp[u][…] 表示子树最优，后序遍历自底向上合并。',
    game: { title: '舞会邀请', content: lazy(() => import('../components/games/TreePartyGame')) },
    types: [
      { slug: 'select', title: '选点 / 最大独立集', blurb: '没有上司的舞会', status: 'ready', ...lessonContent('../content/f/TreeSelect.tsx', () => import('../content/f/TreeSelect')) },
      { slug: 'knapsack', title: '树上背包', blurb: '二叉苹果树·选课', status: 'ready', ...lessonContent('../content/f/TreeKnapsack.tsx', () => import('../content/f/TreeKnapsack')) },
      { slug: 'diameter', title: '直径 / 重心 DP', blurb: '过点最长链', status: 'ready', ...lessonContent('../content/f/TreeDiameter.tsx', () => import('../content/f/TreeDiameter')) },
      { slug: 'cover', title: '覆盖 / 支配 / 染色', blurb: '三状态·染色计数', status: 'ready', ...lessonContent('../content/f/TreeCover.tsx', () => import('../content/f/TreeCover')) },
      { slug: 'count', title: '方案数 / 距离统计', blurb: '联合权值·括号树', status: 'ready', ...lessonContent('../content/f/TreeCount.tsx', () => import('../content/f/TreeCount')) },
    ],
  },
  {
    id: 'g', code: 'G', title: '状压 DP',
    motif: '比特点阵 / 超立方体',
    tagline: '状态是一个集合，用二进制整数表示；转移在 mask 间进行。',
    game: { title: '棋盘布阵', content: lazy(() => import('../components/games/BitBoardGame')) },
    types: [
      { slug: 'board', title: '棋盘 / 轮廓状压', blurb: '互不侵犯·炮兵阵地', status: 'ready', ...lessonContent('../content/g/BitBoard.tsx', () => import('../content/g/BitBoard')) },
      { slug: 'tsp', title: '集合状压 / TSP', blurb: '最短 Hamilton·吃奶酪', status: 'ready', ...lessonContent('../content/g/BitTSP.tsx', () => import('../content/g/BitTSP')) },
      { slug: 'cover', title: '状压 + 覆盖', blurb: '愤怒的小鸟·宝藏', status: 'ready', ...lessonContent('../content/g/BitCover.tsx', () => import('../content/g/BitCover')) },
      { slug: 'subset', title: '综合技巧', blurb: '枚举子集·计数变形', status: 'ready', ...lessonContent('../content/g/BitSubset.tsx', () => import('../content/g/BitSubset')) },
      { slug: 'plug', title: '插头 DP（选修）', blurb: '轮廓线连通性', status: 'ready', ...lessonContent('../content/g/BitPlug.tsx', () => import('../content/g/BitPlug')) },
    ],
  },
]

export const getPart = (id: string): Part | undefined => PARTS.find((part) => part.id === id)

export function getLesson(partId: string, slug: string): Lesson | undefined {
  const part = getPart(partId)
  const type = part?.types.find((candidate) => candidate.slug === slug)
  return part && type ? { part, type, path: `/part/${part.id}/${type.slug}` } : undefined
}

export function getLessonNeighbors(partId: string, slug: string) {
  const lessons = PARTS.flatMap((part) =>
    part.types
      .filter((type) => type.status === 'ready')
      .map((type) => ({ part, type, path: `/part/${part.id}/${type.slug}` })),
  )
  const index = lessons.findIndex((lesson) => lesson.part.id === partId && lesson.type.slug === slug)
  return {
    previous: index > 0 ? lessons[index - 1] : undefined,
    next: index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : undefined,
  }
}

