---
type: Family Visual Specification
title: C Interval DP Visual Specification
description: Current visual grammar and semantic plate contract for the C family.
tags: [design, family-art, interval-dp]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
---

# C 區間 DP 視覺概念板

> 狀態：`已实现基线`
> 代表課程：`stone`、`ring`

## 家族視覺語法

- 主母題：兩端點之間的張力、嵌套拱頂、分割與收縮。
- 主雕塑：五層陶土多面拱頂由左右端點錨定，中央支點表現分割點。
- 課程路徑：五個真實課程連結交替落在逐層收縮的端點站上。
- 家族礦材：陶土與燒結礦面，使用 `--grad-c`。
- 邊界：不能退化為圓環；必須看見端點、區間長度或分割位置。

## 逐課語義

| slug | 圖例必須說明的一句話 |
|---|---|
| `stone` | `[l,r]` 在 `k` 拆成左右區間，兩側代價與合併代價共同形成答案。 |
| `ring` | 環從斷點切開並複製首段，轉化為長度受限的線性區間。 |
| `palindrome` | 左右端點匹配時同步內收，不匹配時由刪除一側後的狀態轉移。 |
| `tree` | 區間中枚舉根，左右子區間分別成為左右子樹。 |
| `merge` | 內部狀態消除後，相同端點能夠重新連接併合並。 |

## 必須、允許與禁止

必須：端點和嵌套關係清楚；分割點可感知；路徑與主雕塑同源。

允許：行動裝置端隱藏最外層工程圓；複雜課程減少次要拱線。

禁止：用一組普通圓環代表所有區間；複製 A 的容量軌道；讓課程連結脫離拱頂路徑。

## 行動裝置端與保真

- 390px 使用單列課程流，保留課程順序；路徑背景隱藏。
- 主雕塑完整縮放，不能裁掉左右端點。
- 圖集為 3×2，右下格為空；五課均按可見 frame 光學居中。
