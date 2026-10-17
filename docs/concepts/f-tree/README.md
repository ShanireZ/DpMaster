---
type: Family Visual Specification
title: F Tree DP Visual Specification
description: Current visual grammar and semantic plate contract for the F family.
tags: [design, family-art, tree-dp]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
---

# F 樹形 DP 視覺概念板

> 狀態：`已实现基线`
> 代表課程：`knapsack`、`cover`

## 家族視覺語法

- 主母題：固定根、子樹容器與自底向上的狀態匯聚。
- 主雕塑：赭金樹冠由多層狀態容器組成，葉層結果沿枝幹匯入父層和根。
- 課程路徑：五個真實課程連結沿固定根的三層樹冠分佈。
- 家族礦材：赭金礦與舊黃銅，使用 `--grad-f`。
- 邊界：F 強調固定根和合並；不出現 E 的巡遊軌道或換根前後態。

## 逐課語義

| slug | 圖例必須說明的一句話 |
|---|---|
| `select` | 父節點與子節點的選/不選狀態存在明確衝突。 |
| `knapsack` | 子樹揹包逐個與父節點容量狀態卷積合併。 |
| `diameter` | 最長與次長向下鏈在當前節點合成經過該點的直徑。 |
| `cover` | 三類覆蓋狀態沿父子邊組成合法組合。 |
| `count` | 子樹計數按距離殼層或組合規模逐層匯入父節點。 |

## 必須、允許與禁止

必須：固定根明確；所有主流向自底向上；課程圖例擁有不同的狀態容器。

允許：行動裝置端降低分枝數量，但必須保留至少兩層合併。

禁止：增加根移動軌道；把五課都畫成相同普通樹；重複使用 A 的揹包外形表示樹上揹包。

## 行動裝置端與保真

- 主雕塑保留根、兩層子樹和向上聚合箭頭。
- 課程路徑在 900px 以下進入兩列，700px 以下單列。
- 圖集為 3×2，右下格為空。
