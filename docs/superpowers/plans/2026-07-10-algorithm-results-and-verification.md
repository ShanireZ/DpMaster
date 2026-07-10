---
type: Implementation Plan
title: DP大师算法结果与可执行验证实施计划
description: Separate typed algorithm results from teaching traces and establish executable cross-checks.
tags: [engineering, algorithms, testing, visualization]
timestamp: 2026-07-10T09:20:00+08:00
source_paths:
  - site/src/algorithms/
  - site/src/components/demos/
  - site/src/components/games/
  - site/scripts/algorithm-results.test.mjs
---

# DP大师算法结果与可执行验证实施计划

> 状态：在当前 `main` 工作区直接实施；不创建 branch 或 worktree。

## 目标

把算法事实与教学表达拆开：游戏、读数与测试只依赖领域结果 Interface；教学演示通过 Adapter 把领域事件转换为 `VizModel`。同一算法只能保留一份转移 Implementation。

首批覆盖目前存在真实重复权威实现的三条纵向链：

- 01 背包：教学演示 + 装包大师；
- LIS：教学演示 + LIS 接龙；
- 石子合并：教学演示 + 合并石子游戏。

同时建立可复用的可执行验证 Module，并用静态契约禁止旧显示名、游戏私有求解器和新的“从最后一帧反读答案”写法回流。

## 架构选择

公开 Interface 保持领域专用，不建立万能 `AlgorithmResult` 或运行时 registry：

```ts
solveZeroOneKnapsack(input): KnapsackResult
solveLis(input): LisResult
solveStoneMerge(input): StoneMergeResult
```

每个领域的内部 Module 只有一个 `execute(input, emit)` Implementation：

- 结果入口传入空 sink，只返回领域结果；
- 教学入口记录不含 HTML、颜色或 KaTeX 的领域事件；
- demo solver 作为 Adapter 重放事件，负责 caption、formula、states、arrows 和帧快照；
- 游戏只从公开 `index.ts` 导入结果 Interface，不能跨入 `internal.ts`。

## 实施步骤

### 1. 先写失败测试

新增：

- `site/scripts/algorithm-results.test.mjs`
- `site/scripts/algorithm-architecture.test.mjs`
- `site/scripts/brand-contract.test.mjs`
- `site/scripts/lib/verify-algorithm.mjs`

失败断言包括：

- 三个结果 Module 存在并返回类型化结果，不含 `frames/caption/states`；
- 小规模 01 背包、LIS、石子合并与独立穷举 oracle 一致；
- `solve(input)` 与内部记录运行的 `result` 一致；
- 游戏不再声明私有 `solveOpt/solveLIS/solveMin`；
- 三个算法 Module 不依赖 React 或 `dp-engine`；
- 旧显示名不再出现在源码和文档。

先运行 `npm test` 记录 RED。

### 2. 建立纯算法 Module

新增：

- `site/src/algorithms/contracts.ts`
- `site/src/algorithms/knapsack/index.ts`
- `site/src/algorithms/knapsack/internal.ts`
- `site/src/algorithms/lis/index.ts`
- `site/src/algorithms/lis/internal.ts`
- `site/src/algorithms/stone-merge/index.ts`
- `site/src/algorithms/stone-merge/internal.ts`

所有 Node 直接执行的 TypeScript 内部导入使用显式 `.ts` 扩展名。结果包括最优值和合法 witness；事件只记录算法事实。

### 3. 把 demo solver 降为教学 Adapter

修改：

- `site/src/components/demos/knapsack/solvers.ts`
- `site/src/components/demos/lis/lisSolver.ts`
- `site/src/components/demos/interval/stoneSolver.ts`

删除其中的核心转移循环，改为记录领域运行并重放事件。保持现有帧顺序、文案、公式、颜色和最终答案表现。

### 4. 迁移真实调用方

修改：

- `site/src/components/games/PackMasterGame.tsx`
- `site/src/components/games/LISChainGame.tsx`
- `site/src/components/games/StoneMergeGame.tsx`
- `site/src/components/demos/lis/LISDemo.tsx`
- `site/src/components/demos/interval/StoneMinMaxDemo.tsx`

游戏和答案读数改用公开结果 Interface，不再从教学帧读取或复制算法。

### 5. 品牌清理与防回归

- 主题存储键改为 `dp-master-theme`；
- 清理历史计划中的旧显示名枚举；
- 静态测试扫描受版本控制的文本文件，部署项目名、仓库路径和域名等兼容标识保持不变。

### 6. 执行验证

依次运行：

```powershell
npm test
npm run lint
npm run build
npm run check:assets
npm run verify
npm audit
```

最后复核 `git diff --check`、品牌扫描、当前分支和 worktree 数量。

## 后续迁移原则

本 P0 建立可复制的深 Module 与验证 Seam。其余 solver 后续按家族迁移时必须遵守相同合同：先有领域结果与 oracle，再把现有帧循环改为事件 Adapter；不得只增加一个浅 helper，也不得把 `VizModel` 包进结果对象冒充分离。
