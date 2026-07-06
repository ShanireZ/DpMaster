// 全站洛谷题目索引数据 —— 由各类型内容组件的 <ExampleCard> / <Exercise> 汇总提取。
// 单一来源：content/*，与讲解页保持一致。新增/修改类型题目后同步此表。
export type ProblemKind = 'example' | 'exercise'

export interface Problem {
  part: string // 'a' | 'b' | 'c' | 'd' ...
  partTitle: string
  slug: string
  typeTitle: string
  pid: string // 洛谷题号，如 P1048 / B3637
  name: string
  diff: string // 难度标签，练习可能为空
  kind: ProblemKind
  src: string // 来源/赛事，练习可能为空
}

// 数据由提取脚本/子代理填充（覆盖已上线的 a/b/c/d 全部类型）。
export const PROBLEMS: Problem[] = []
