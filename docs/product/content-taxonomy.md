---
type: Product Reference
title: DP Content Taxonomy
description: The current A-G family taxonomy and type inventory used by the live site.
tags: [content, taxonomy, routing]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
sources:
  - resource: ../../site/src/data/catalog.ts
---

# Authority

The live taxonomy and route order are `site/src/data/catalog.ts`. Older planning documents used a different order where A was 線性 DP and B was 揹包 DP. The implemented site has reversed that order: A is now 揹包 DP and B is now 線性 DP. New documentation must use the implemented order below.

# Families

| Code | Route ID | Family | Types | Motif |
|---|---:|---|---:|---|
| A | `a` | 揹包 DP | 9 | 逐格填充的容器 / 方格堆 |
| B | `b` | 線性 DP | 7 | 沿一條鏈推進的刻度序列 |
| C | `c` | 區間 DP | 5 | 嵌套的括號弧 / 區間橋 |
| D | `d` | 矩陣 DP | 2 | 方陣網格 / 矩陣塊 |
| E | `e` | 換根 DP | 4 | 以不同節點為心的放射樹 |
| F | `f` | 樹形 DP | 5 | 分叉的樹冠 |
| G | `g` | 狀壓 DP | 5 | 位元點陣 / 超立方體 |

# Type Inventory

## A 揹包 DP

01 揹包; 完全揹包; 多重揹包; 分組揹包; 混合揹包; 二維費用揹包; 有依賴的揹包; 揹包綜合變形; 辨析：分數揹包=貪心.

## B 線性 DP

路徑型 / 遞推入門; 最大子段和; 最長上升子序列 LIS; 最長公共子序列 LCS; 編輯距離; 線性狀態機 DP; 計數 / 劃分型.

## C 區間 DP

石子合併（鍊形）; 環形區間 DP; 迴文 / 括號; 加分二叉樹型; 合併 / 刪除類.

## D 矩陣 DP

網格 / 矩陣上的 DP; 矩陣快速冪加速.

## E 換根 DP

換根基礎模型; 距離和換根; 子樹內外合併; 中心 / 偏心距.

## F 樹形 DP

選點 / 最大獨立集; 樹上揹包; 直徑 / 重心 DP; 覆蓋 / 支配 / 染色; 方案數 / 距離統計.

## G 狀壓 DP

棋盤 / 輪廓狀壓; 集合狀壓 / TSP; 狀壓 + 覆蓋; 綜合技巧; 插頭 DP.

# Cross-Family Reuse

Problem reuse is intentional. A reused problem should have one main teaching position and may appear elsewhere as a review, exercise, or cross-reference. The problem index may therefore contain more entries than unique Luogu IDs.
