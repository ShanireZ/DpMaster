import { BRAND } from '../config/site.ts'
import type { Lesson } from './catalog.ts'

const LESSON_QUESTIONS: Readonly<Record<string, string>> = Object.freeze({
  '/part/a/01': '每件物品只能取一次时，为什么容量必须逆序更新',
  '/part/a/complete': '物品可无限取用时，正序更新如何复用本轮状态',
  '/part/a/multiple': '有限件物品怎样从朴素枚举优化到二进制或单调队列',
  '/part/a/group': '每组至多选一件时，如何隔离组内选择',
  '/part/a/mixed': '01、完全和多重物品怎样共用一套转移框架',
  '/part/a/cost2d': '同时受两种容量约束时，状态维度与枚举顺序如何设计',
  '/part/a/dep': '带主件附件依赖的选择怎样转化为合法组合',
  '/part/a/variant': '背包模型如何扩展到计数、撤销和方案恢复',
  '/part/a/fractional': '为什么可分割物品属于贪心而不是 01 背包',
  '/part/b/path': '沿序列或网格推进时，如何定义最小充分状态',
  '/part/b/maxseg': '如何用一个局部状态维护最大连续子段',
  '/part/b/lis': '最长上升子序列如何从二次转移优化到对数查找',
  '/part/b/lcs': '两个序列的公共结构如何通过二维状态刻画',
  '/part/b/edit': '插入、删除和替换如何统一进编辑距离转移',
  '/part/b/fsm': '带持有或选择限制的问题怎样画成有限状态机',
  '/part/b/count': '计数与划分问题如何避免重复或遗漏方案',
  '/part/c/stone': '区间合并代价为何要按长度递增计算',
  '/part/c/ring': '环形区间怎样通过复制序列转化为链形区间',
  '/part/c/palindrome': '端点匹配如何组织回文与括号类转移',
  '/part/c/tree': '枚举区间根节点时，子区间如何对应左右子树',
  '/part/c/merge': '合并与删除过程怎样压缩成区间状态',
  '/part/d/grid': '网格路径、最大正方形和双路径如何选择状态维度',
  '/part/d/matpow': '线性递推怎样写成矩阵并用快速幂加速',
  '/part/e/basic': '一次定根结果如何在线性时间转移到所有根',
  '/part/e/distsum': '换根时全树距离和为什么只需常数时间更新',
  '/part/e/inout': '子树内外贡献如何在第二遍 DFS 中合并',
  '/part/e/center': '偏心距与树中心如何由向下和向上信息共同得到',
  '/part/f/select': '父子不能同时选择时，选与不选状态如何配合',
  '/part/f/knapsack': '树上选取数量约束如何在子树间做背包合并',
  '/part/f/diameter': '过当前节点的多条链如何组合出直径与重心信息',
  '/part/f/cover': '覆盖、支配和染色约束需要哪些互斥状态',
  '/part/f/count': '树上方案数与距离统计如何在合并时避免重复',
  '/part/g/board': '逐行棋盘约束怎样编码为兼容位掩码',
  '/part/g/tsp': '集合访问状态如何保证 Hamilton 路径不重不漏',
  '/part/g/cover': '几何覆盖选择怎样预处理成可转移的状态集合',
  '/part/g/subset': '子集枚举与计数变形有哪些可复用的位运算技巧',
  '/part/g/plug': '轮廓线上的连通性怎样压缩为插头状态',
})

export interface LessonEditorial {
  summary: string
  question: string
  outcomes: readonly [string, string, string]
  reviewedBy: string
  reviewStatus: '持续复核'
}

export function getLessonEditorial(lesson: Lesson): LessonEditorial {
  const question = LESSON_QUESTIONS[lesson.path]
    ?? `${lesson.type.title}的状态、转移与实现顺序应如何设计`
  return {
    summary:
      `${lesson.type.title}课程回答“${question}”。内容以${lesson.type.blurb}为主线，配合逐步推导、可编辑演示、例题与练习形成可复查的学习闭环。`,
    question,
    outcomes: [
      `判断${lesson.type.title}的适用条件与状态边界`,
      `围绕“${lesson.type.blurb}”推导转移与计算顺序`,
      '用演示、复杂度分析和配套题目校验实现',
    ],
    reviewedBy: BRAND.owner,
    reviewStatus: '持续复核',
  }
}
