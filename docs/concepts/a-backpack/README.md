---
type: Family Visual Specification
title: A Backpack DP Visual Specification
description: Current visual grammar, concept references, and fidelity contract for the A family.
tags: [design, family-art, backpack-dp]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
---

# A 背包 DP 视觉规格

本目录保存 A「背包 DP」大类页与 9 个课程子页的已确认概念稿。实现不得把这些图片直接铺到网页中，图片只作为视觉对照，页面使用 React、SVG 与 CSS 原子组件复刻。

## 概念稿分工

| 文件 | 对应页面 | 实现重点 |
|---|---|---|
| `category-hero-dark.png` | A 大类页首屏 | 多面体背包、构造圆、网格、左右分栏 |
| `category-path-dark.png` | A 大类页课程路径 | 纵向课程轨迹、线框背包、实验室承接 |
| `lesson-opening-light.png` | 子页开场 | 课程标题、状态图谱、摘要与目录 |
| `lesson-body-light.png` | 子页正文 | 纸面推演、物品图解、页边标注 |
| `lesson-demo-light.png` | 子页实验与题目 | DP 表格剧场、例题档案、练习路径 |
| `lesson-atoms-core-light.png` | 完全、多重、分组、混合 | 正序、拆分、互斥、调度四类原子 |
| `lesson-atoms-advanced-light.png` | 二维、依赖、综合、分数 | 双费用、依赖树、聚合器、比例填充原子 |

## 保真度台账

1. 大类页首屏使用同一套多面体背包几何，不再显示九宫格字形。
2. 大类页课程路径使用同一几何的线框模式，9 门课程与箭头沿纵向轨迹排列。
3. 9 个子页英雄区按课程切换独立状态图，不共享一张通用占位图。
4. 网格属于页面背景或真实状态坐标，只在 01 状态图、二维费用矩阵等有坐标语义的图版出现；其他图版保持干净纸面。
5. DP 表格继续使用真实求解器数据，并保留播放、重置、速度和参数编辑。
6. 亮色与暗色只切换材质变量，图形骨架、信息位置和交互含义保持一致。
7. 移动端缩排为单列，保留完整课程标题、图形和操作，不裁掉关键状态。
