---
type: Family Visual Specification
title: C Interval DP Visual Specification
description: Current visual grammar and semantic plate contract for the C family.
tags: [design, family-art, interval-dp]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
---

# C 区间 DP 视觉概念板

> 状态：`已实现基线`
> 代表课程：`stone`、`ring`

## 家族视觉语法

- 主母题：两端点之间的张力、嵌套拱顶、分割与收缩。
- 主雕塑：五层陶土多面拱顶由左右端点锚定，中央支点表现分割点。
- 课程路径：五个真实课程链接交替落在逐层收缩的端点站上。
- 家族矿材：陶土与烧结矿面，使用 `--grad-c`。
- 边界：不能退化为圆环；必须看见端点、区间长度或分割位置。

## 逐课语义

| slug | 图例必须说明的一句话 |
|---|---|
| `stone` | `[l,r]` 在 `k` 拆成左右区间，两侧代价与合并代价共同形成答案。 |
| `ring` | 环从断点切开并复制首段，转化为长度受限的线性区间。 |
| `palindrome` | 左右端点匹配时同步内收，不匹配时由删除一侧后的状态转移。 |
| `tree` | 区间中枚举根，左右子区间分别成为左右子树。 |
| `merge` | 内部状态消除后，相同端点能够重新连接并合并。 |

## 必须、允许与禁止

必须：端点和嵌套关系清楚；分割点可感知；路径与主雕塑同源。

允许：移动端隐藏最外层工程圆；复杂课程减少次要拱线。

禁止：用一组普通圆环代表所有区间；复制 A 的容量轨道；让课程链接脱离拱顶路径。

## 移动端与保真

- 390px 使用单列课程流，保留课程顺序；路径背景隐藏。
- 主雕塑完整缩放，不能裁掉左右端点。
- 图集为 3×2，右下格为空；五课均按可见 frame 光学居中。
