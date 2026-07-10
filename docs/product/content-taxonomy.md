---
type: Product Reference
title: DP Content Taxonomy
description: The current A-G family taxonomy and type inventory used by the live site.
tags: [content, taxonomy, routing]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/src/data/catalog.ts
---

# Authority

The live taxonomy and route order are `site/src/data/catalog.ts`. Older planning documents used a different order where A was 线性 DP and B was 背包 DP. The implemented site has reversed that order: A is now 背包 DP and B is now 线性 DP. New documentation must use the implemented order below.

# Families

| Code | Route ID | Family | Types | Motif |
|---|---:|---|---:|---|
| A | `a` | 背包 DP | 9 | 逐格填充的容器 / 方格堆 |
| B | `b` | 线性 DP | 7 | 沿一条链推进的刻度序列 |
| C | `c` | 区间 DP | 5 | 嵌套的括号弧 / 区间桥 |
| D | `d` | 矩阵 DP | 2 | 方阵网格 / 矩阵块 |
| E | `e` | 换根 DP | 4 | 以不同节点为心的放射树 |
| F | `f` | 树形 DP | 5 | 分叉的树冠 |
| G | `g` | 状压 DP | 5 | 比特点阵 / 超立方体 |

# Type Inventory

## A 背包 DP

01 背包; 完全背包; 多重背包; 分组背包; 混合背包; 二维费用背包; 有依赖的背包; 背包综合变形; 辨析：分数背包=贪心.

## B 线性 DP

路径型 / 递推入门; 最大子段和; 最长上升子序列 LIS; 最长公共子序列 LCS; 编辑距离; 线性状态机 DP; 计数 / 划分型.

## C 区间 DP

石子合并（链形）; 环形区间 DP; 回文 / 括号; 加分二叉树型; 合并 / 删除类.

## D 矩阵 DP

网格 / 矩阵上的 DP; 矩阵快速幂加速.

## E 换根 DP

换根基础模型; 距离和换根; 子树内外合并; 中心 / 偏心距.

## F 树形 DP

选点 / 最大独立集; 树上背包; 直径 / 重心 DP; 覆盖 / 支配 / 染色; 方案数 / 距离统计.

## G 状压 DP

棋盘 / 轮廓状压; 集合状压 / TSP; 状压 + 覆盖; 综合技巧; 插头 DP（选修）.

# Cross-Family Reuse

Problem reuse is intentional. A reused problem should have one main teaching position and may appear elsewhere as a review, exercise, or cross-reference. The problem index may therefore contain more entries than unique Luogu IDs.
