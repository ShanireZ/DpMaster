---
type: Design Audit
title: A–G Body Visualization and Demo Audit
description: Current A–G lesson-body figure and Demo inventory, shared contracts, and regression priorities.
tags: [design, visualization, demos, audit]
status: stable
generated: { by: openai/codex, at: 2026-08-02T00:00:00+08:00 }
sources:
  - resource: ../../site/src/content/
  - resource: ../../site/src/components/demos/
  - resource: ../../site/src/pages/TypePage.tsx
---

# A–G 正文图版与 Demo 一致性审计

## 审计口径

- 本文记录当前代码事实，不记录任务流水。图版数按课程 JSX 中的 `<figure>` 实例计，Demo 数按实际挂载的 `components/demos/` 组件实例计。
- A–G 共 37 门课程、**111 个正文图版、56 个 Demo**；每门课程至少有一个真实 Demo，G/plug 已不再是例外。
- catalog 是课程范围、slug、顺序与元数据的唯一来源；正文标准不维护第二份课程白名单。
- solver、输入合同、播放状态机和家族游戏逻辑仍是稳定边界；统一层只负责表达壳层、交互语法与可视状态。

## 当前统一合同

- 所有有效课程文章都由 `TypePage` 标记为 `data-demo-standard="instrument"` 与 `data-demo-intensity="enhanced"`。
- 历史 `.demo` 获得同一条纵向仪表脊、`ALGORITHM INSTRUMENT` 标识、连续编号、背景网格、焦点外观和至少 44×44px 的触控目标。
- 新式 Demo 通过 `DemoWorkbench`、`InstrumentRail`、`DemoTableViewport`、`DemoDetailSwitch` 与 `VizStateRole` 复用播放、表格、细节和五态语法；课程正文不直接调用底层 `PlaybackControls`。
- 大表只在自身仪器视窗内滚动；页面不得横向滚动。活动格、来源、被选转移、已确定和非法态必须保留颜色之外的轮廓、符号、纹理或线型编码。
- 移动端按主对象重排，控制轨允许分行，但不得缩小触控目标、裁切桌面图或把整张大表压进屏幕。
- 深浅主题使用相同 DOM、数据和几何；`prefers-reduced-motion` 只移除非必要演绎，不改变步骤与结果。
- 全部 37 门课程的首个真实 Demo 均有一张按课程机制独立构图的高保真静态 Hero；每张资产只属于一个课程 slug，不跨课复用。
- Hero 统一由 `DemoSculptureHero` 承载，使用空替代文本与 `aria-hidden`，内部禁止按钮、输入、SVG 和播放状态节点；它们只建立课程视觉记忆，不读取参数、播放帧或求解状态。

## 逐课台账

### A 背包 DP — 26 图版 / 14 Demo

| 课程 | 图版 | Demo | 主对象与持续回归重点 |
|---|---:|---:|---|
| `01` | 3 | 2 | 物品编辑、逆序容量轨与当前转移。 |
| `complete` | 2 | 2 | 可重复取用、正序容量轨与独立静态 Hero。 |
| `multiple` | 3 | 2 | 二进制拆包、余数链与单调队列密度。 |
| `group` | 3 | 2 | 组内互斥、组间推进与冲突编码。 |
| `mixed` | 3 | 1 | 01 / 完全 / 多重三类物品的调度规则。 |
| `cost2d` | 3 | 1 | 二维容量活动邻域与局部滚动。 |
| `dep` | 3 | 1 | 主件附件树、合法组合与分组归约。 |
| `variant` | 3 | 2 | 最大值、计数、可行性与撤销的共享状态角色。 |
| `fractional` | 3 | 1 | 贪心密度序与离散背包的对照边界。 |

### B 线性 DP — 22 图版 / 14 Demo

| 课程 | 图版 | Demo | 主对象与持续回归重点 |
|---|---:|---:|---|
| `path` | 3 | 2 | 三角形 / 网格的来源格与推进方向。 |
| `maxseg` | 3 | 2 | 延续、重启和全局最优区间。 |
| `lis` | 3 | 2 | 依赖链与牌堆尾值的双算法视角。 |
| `lcs` | 4 | 2 | 双序列编辑、二维表、回溯和局部滚动。 |
| `edit` | 3 | 2 | 插入 / 删除 / 替换三向来源与播放轨。 |
| `fsm` | 3 | 2 | 状态机节点、转移边与股票状态表。 |
| `count` | 3 | 2 | 递推来源、累加过程与确定值。 |

### C 区间 DP — 15 图版 / 10 Demo

| 课程 | 图版 | Demo | 主对象与持续回归重点 |
|---|---:|---:|---|
| `stone` | 3 | 2 | 区间端点、分割点与合并代价。 |
| `ring` | 3 | 2 | 断环成链、复制区间与窗口扫描。 |
| `palindrome` | 3 | 2 | 两端收缩、插入来源与回溯。 |
| `tree` | 3 | 2 | 根枚举、区间子树和建树结果。 |
| `merge` | 3 | 2 | 取端、相等合并与非法组合。 |

### D 矩阵 DP — 7 图版 / 4 Demo

| 课程 | 图版 | Demo | 主对象与持续回归重点 |
|---|---:|---:|---|
| `grid` | 3 | 2 | 最大正方形、双路径来源与冲突纹理。 |
| `matpow` | 4 | 2 | 状态向量、矩阵乘法和快速幂纵向轨迹。 |

### E 换根 DP — 10 图版 / 4 Demo

| 课程 | 图版 | Demo | 主对象与持续回归重点 |
|---|---:|---:|---|
| `basic` | 3 | 1 | 向下汇总、父侧回传与根切换。 |
| `distsum` | 3 | 1 | 跨边增减、点权模式与结果表。 |
| `inout` | 2 | 1 | 子树内外数组、树结构与活动半径。 |
| `center` | 2 | 1 | 最长 / 次长链、偏心距与中心收束。 |

### F 树形 DP — 15 图版 / 5 Demo

| 课程 | 图版 | Demo | 主对象与持续回归重点 |
|---|---:|---:|---|
| `select` | 3 | 1 | 选 / 不选节点、父子冲突与禁用态。 |
| `knapsack` | 3 | 1 | 子树容量卷积、合并来源与局部滚动。 |
| `diameter` | 3 | 1 | 两条最长向下链与直径合成。 |
| `cover` | 3 | 1 | 三状态覆盖、非法态与独立集对照。 |
| `count` | 3 | 1 | 距离壳层、后序汇聚与括号树。 |

### G 状压 DP — 16 图版 / 5 Demo

| 课程 | 图版 | Demo | 主对象与持续回归重点 |
|---|---:|---:|---|
| `board` | 4 | 1 | 行 mask、相邻合法性与两行依赖。 |
| `tsp` | 4 | 1 | 集合 × 终点状态、点位编辑与 Hamilton 路径。 |
| `cover` | 3 | 1 | 覆盖 mask 合成、几何轨迹与来源分离。 |
| `subset` | 3 | 1 | 子集遍历主链、进度与当前子集。 |
| `plug` | 2 | 1 | 六帧轮廓状态、连通编码与移动端状态脊。 |

## 持续门禁

1. 全 37 课必须保持 `instrument/enhanced` 标记、至少一个真实 Demo 和零页面级横向溢出。
2. 全 37 门 Hero 必须保持一课一资产、空替代文本、`aria-hidden`、无输入和无播放状态耦合；浏览器门禁同时断言 37 个构建后资源 URL 互不重复。
3. 代表课程需持续断言真实交互产生状态变化且 Hero 资源不随状态变化；高密度课程 A/cost2d、B/edit、C/tree、D/matpow、E/inout、F/knapsack、G/tsp、G/plug 保留专项回归。
4. 新增或重写 Demo 优先接入共享原语；历史 `.demo` 可以渐进迁移，但不得重新建立课程白名单或第二套播放控件。
5. 资源预算保持区域产物 6.30 MB、单文件 760 KB、CSS 80 KB，不以调高阈值替代优化。
