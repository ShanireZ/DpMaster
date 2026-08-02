---
type: Design Standard
title: DP Family Visual Standard
description: Durable visual contract for A–G family heroes, course journeys, and lesson semantic plates.
tags: [design, family-art, polygon, accessibility]
status: stable
generated: { by: openai/codex, at: 2026-08-02T00:00:00+08:00 }
sources:
  - resource: ../../site/src/components/art/
---

# DP 家族视觉标准

> 状态：A–G 设计与实现基线已锁定
> 适用：分类主雕塑、课程路径、课程页头图例、正文 Demo 壳层
> 产品基线：Warm Ink；catalog 是标题、slug、顺序与内容的唯一来源

## 1. 三槽位合同

每个家族只通过 `HeroArt / JourneyArt / LessonPlate` 接入页面：

- `HeroArt`：透明高保真 poly 主雕塑，纯装饰，必须使用空替代文本和 `aria-hidden`。
- `JourneyArt`：确定性 SVG/CSS 背景；真实课程链接本身构成路径节点。
- `LessonPlate`：透明 poly 图集按 slug 唯一裁切，外层可访问名称解释本课状态或转移。

不允许在页面组件中为新家族增加条件渲染链，也不允许艺术模块复制 catalog 的课程标题和顺序。

## 2. 同一工坊、不同矿材

统一项：

- 三分之四视角、清楚的多面切片和受控高光；
- 暖墨色工程辅助线、克制的地面投影与透明边缘；
- 相同的光照方向、细节密度与缩略图清晰度；
- 深浅主题使用同一几何，只改变 token、阴影和环境对比。

差异项：

| 家族 | 矿材与颜色 | 空间语法 |
|---|---|---|
| C 区间 | 陶土 / `--grad-c` | 端点、张力拱、嵌套与分割 |
| D 矩阵 | 橄榄石 / `--grad-d` | 晶格平面、折页与变换轴 |
| E 换根 | 灰紫晶 / `--grad-e` | 根站、巡游轨道与双向流 |
| F 树形 | 赭金矿 / `--grad-f` | 固定根、子树容器与向上汇聚 |
| G 状压 | 玫瑰石英 / `--grad-g` | 稀疏状态星座、合法边与轮廓线 |

身份色不能替代 `--viz-current/source/chosen/settled/invalid` 等跨家族状态色。

## 3. Poly 资产

- 主雕塑与图集均为 1536×1024 源画布，透明 WebP 交付。
- 图集布局：C 3×2、D 2×1、E 2×2、F 3×2、G 3×2。
- 所有图集单元使用 3:2 页面视窗；可见轮廓约留 6% 安全区。
- 图像内禁止课程标题、公式、数字和说明文字；语义由 DOM 提供。
- 空图集格必须真正为空，不能复制已有图例填满。
- 单文件不得超过 760 KB；CSS 文件不得超过 80 KB。
- 居中以实际可见轮廓 frame 为准，不能以透明画布或单元格中心代替。

## 4. 分类课程路径

- 禁止“左侧列表 + 右侧附加图解”。
- 链接、序号、标题和摘要都是真实 DOM；背景图只连接和解释这些节点。
- C 使用嵌套端点站，D 使用双平面，E 使用巡根轨道，F 使用汇聚树冠，G 使用稀疏星座。
- 900px 以下取消绝对构图并进入两列顺序流；700px 以下进入单列。
- 移动端隐藏辅助结构图，但保留完整课程标题、摘要、序号和操作。

## 5. 概念板与评审

每个家族目录包含：

- `family-concept-dark.svg`：深色桌面总览；
- `family-concept-light.svg`：同几何浅色桌面总览；
- `family-concept-mobile.svg`：390×844 的降维策略；
- `README.md`：逐课语义、必须/允许/禁止、保真清单。

评审先比较五类总览，再按 C→G 检查分类页与代表课程。任何方案都必须回答“它在解释哪个状态、转移、约束或边界”。

## 6. 正文仪器壳层

- catalog 中全部 37 门有效课程统一标记为 `data-demo-standard="instrument"` 与 `data-demo-intensity="enhanced"`，不得维护代表课程白名单。
- 历史 `.demo` 使用连续纵向仪表脊、顺序编号、工程网格、共享焦点与 44×44px 触控基线；新式 Demo 使用 `DemoWorkbench` 及其共享原语。
- 14 门代表课的高保真静态 Hero 是家族构图拍板样例，A/complete 另有独立课程 Hero；它们只承担装饰，不读取参数、求解结果或播放帧。
- 其余课程继续使用各自唯一的页头 `LessonPlate` 与真实交互 Demo；禁止为了“每课一张”而复制无语义静态资产。
- 大表只能在局部仪器视窗内滚动；移动端保留算法主脊柱并重排参数、表格与解释层，禁止页面横向滚动。
- 当前、来源、被选、已确定、非法五态必须具有颜色之外的第二编码；light/dark 与 reduced-motion 不得改变信息结构。

## 7. 验收

- light/dark：几何、顺序和信息一致。
- 1600×1000、1440×900、1024、820、390×844：无页面横向溢出。
- 分类页存在唯一主雕塑和同源路径；课程页不存在 `PartGlyph` 回退。
- 37 个 slug 均有唯一图例和可访问名称。
- 37 门课程均有至少一个真实 Demo，并使用统一正文仪器合同。
- 14 门代表静态 Hero 保持独立、纯装饰且与动态数据解耦。
- 当前路由只加载所属家族的艺术模块与资产。
- `prefers-reduced-motion` 下移除非必要滤镜和动效。
