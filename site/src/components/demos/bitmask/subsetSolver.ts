// 子集枚举演示：for(int T=S; T; T=(T-1)&S) 依次跳过母集 S 的每个非空子集。
// 产出逐帧数据，交给自绘比特点阵渲染。

export interface SubsetStep {
  T: number // 当前子集
  step: number // 第几个（1-based）
  prevT: number // 上一个 T（用于展示 (T-1)&S 的推导）
  isFirst: boolean
}

/** 枚举 S 的所有非空子集（含 S 自身），按 T=S,(S-1)&S,... 顺序。 */
export function enumerateSubsets(S: number): SubsetStep[] {
  const steps: SubsetStep[] = []
  let idx = 0
  for (let T = S; T > 0; T = (T - 1) & S) {
    steps.push({ T, step: idx + 1, prevT: idx === 0 ? S : steps[idx - 1].T, isFirst: idx === 0 })
    idx++
  }
  return steps
}

/** 把整数拆成 n 位数组，bits[i] = 第 i 位（i=0 最低位）。 */
export function toBits(x: number, n: number): number[] {
  return Array.from({ length: n }, (_, i) => (x >> i) & 1)
}

export function popcount(x: number): number {
  let c = 0
  while (x) {
    x &= x - 1
    c++
  }
  return c
}
