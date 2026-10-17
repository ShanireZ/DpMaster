---
type: Family Visual Specification
title: A Backpack DP Visual Specification
description: Current visual grammar, concept references, and fidelity contract for the A family.
tags: [design, family-art, backpack-dp]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
---

# A 揹包 DP 視覺規格

本目錄保存 A「揹包 DP」大類頁與 9 個課程子頁的已確認概念稿。實作不得把這些圖片直接鋪到網頁中，圖片只作為視覺對照，頁面使用 React、SVG 與 CSS 原子元件復刻。

## 概念稿分工

| 檔案 | 對應頁面 | 實作重點 |
|---|---|---|
| `category-hero-dark.png` | A 大類頁首屏 | 多面體揹包、建構圓、網格、左右分欄 |
| `category-path-dark.png` | A 大類頁課程路徑 | 縱向課程軌跡、線框揹包、實驗室承接 |
| `lesson-opening-light.png` | 子頁開場 | 課程標題、狀態圖譜、摘要與目錄 |
| `lesson-body-light.png` | 子頁正文 | 紙面推演、物品圖解、頁邊標註 |
| `lesson-demo-light.png` | 子頁實驗與題目 | DP 表格劇場、例題檔案、練習路徑 |
| `lesson-atoms-core-light.png` | 完全、多重、分組、混合 | 正序、拆分、互斥、排程四類原子 |
| `lesson-atoms-advanced-light.png` | 二維、依賴、綜合、分數 | 雙費用、依賴樹、聚合器、比例填充原子 |

## 保真度紀錄表

1. 大類頁首屏使用同一套多面體揹包幾何，不再顯示九宮格字形。
2. 大類頁課程路徑使用同一幾何的線框模式，9 門課程與箭頭沿縱向軌跡排列。
3. 9 個子頁英雄區按課程切換獨立狀態圖，不共享一張通用佔點陣圖。
4. 網格屬於頁面背景或真實狀態座標，只在 01 狀態圖、二維費用矩陣等有座標語義的圖版出現；其他圖版保持乾淨紙面。
5. DP 表格繼續使用真實求解器資料，並保留播放、重置、速度和參數編輯。
6. 亮色與暗色只切換材質變數，圖形骨架、資訊位置和交互含義保持一致。
7. 行動裝置端縮排為單列，保留完整課程標題、圖形和操作，不裁掉關鍵狀態。
