---
type: Family Visual Specification
title: E Reroot DP Visual Specification
description: Current visual grammar and semantic plate contract for the E family.
tags: [design, family-art, reroot-dp]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
---

# E 換根 DP 視覺概念板

> 狀態：`已实现基线`
> 代表課程：`basic`、`distsum`

## 家族視覺語法

- 主母題：同一棵樹上的根站、巡遊軌道和父子雙向資訊流。
- 主雕塑：灰紫晶樹保持拓撲不變，三處根站由軌道連接，青/金流向表現兩次掃描。
- 課程路徑：四個真實課程連結圍繞同一棵樹形成巡根路線。
- 家族礦材：灰紫晶與拉絲黃銅，使用 `--grad-e`。
- 邊界：必須看見“根在移動”；不能成為 F 的普通固定根樹冠。

## 逐課語義

| slug | 圖例必須說明的一句話 |
|---|---|
| `basic` | 第一遍從子樹向根彙總，第二遍把父側答案傳給子節點。 |
| `distsum` | 根跨邊後，一側節點變近、另一側節點變遠，數量決定總距離變化。 |
| `inout` | 子樹內狀態和父側外狀態在當前節點合成為完整狀態。 |
| `center` | 最長和次長方向決定偏心距，並使候選中心向直徑中部收斂。 |

## 必須、允許與禁止

必須：樹拓撲在換根前後不變；兩次掃描可區分；根站不等同於普通高亮節點。

允許：行動裝置端減少根站數量和軌道裝飾，但保留換根方向。

禁止：並排畫兩棵不同樹冒充換根；使用 F 的子樹容器作為主母題。

## 行動裝置端與保真

- 主雕塑縮減外圈軌道密度，但保留根站與雙向箭頭。
- 課程路徑改為單列，不裁掉父側流。
- 圖集為 2×2，四課均必須出現父側資訊或根移動線索。
