---
type: Family Visual Specification
title: G Bitmask DP Visual Specification
description: Current visual grammar and semantic plate contract for the G family.
tags: [design, family-art, bitmask-dp]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
---

# G 狀壓 DP 視覺概念板

> 狀態：`已实现基线`
> 代表課程：`board`、`plug`

## 家族視覺語法

- 主母題：稀疏狀態星座、合法鄰邊、當前 mask 與移動輪廓線。
- 主雕塑：玫瑰石英狀態節點構成稀疏超立方體投影，只高亮當前狀態及合法鄰居。
- 課程路徑：五個真實課程連結成為狀態星座中的可訪問節點。
- 家族礦材：玫瑰石英與拉絲黃銅，使用 `--grad-g`。
- 邊界：不鋪滿二進位字元，不使用無法在行動裝置端降維的炫技 3D。

## 逐課語義

| slug | 圖例必須說明的一句話 |
|---|---|
| `board` | 合法行 mask 依據行內與相鄰行約束逐行轉移。 |
| `tsp` | 狀態同時由已訪問子集和當前終點決定。 |
| `cover` | 幾何物件覆蓋的目標集合通過按位或合成為 mask。 |
| `subset` | 子掩碼沿 `(sub-1)&mask` 的關係被完整枚舉。 |
| `plug` | 掃描輪廓逐格前進，插頭配對編碼已處理區域的連通性。 |

## 必須、允許與禁止

必須：狀態空間保持稀疏；當前狀態與合法邊清楚；五課使用不同結構。

允許：行動裝置端只顯示當前狀態和一層合法鄰居；隱藏遠端超立方體邊。

禁止：顯示大面積 0/1 字元牆；把 TSP 畫成普通地圖；繼續稱插頭 DP 為選修。

## 行動裝置端與保真

- 主雕塑保留當前核心、合法鄰居與輪廓軌道。
- 課程路徑在小屏退回順序流，背景星座隱藏。
- 圖集為 3×2，右下格為空；插頭圖例必須完整保留掃描線與配對端點。
