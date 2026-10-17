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

# DP 家族視覺標準

> 狀態：A–G 設計與實作基線已鎖定
> 適用：分類主雕塑、課程路徑、課程頁頭圖例、正文 Demo 殼層
> 產品基線：Warm Ink；catalog 是標題、slug、順序與內容的唯一來源

## 1. 三槽位合同

每個家族只通過 `HeroArt / JourneyArt / LessonPlate` 接入頁面：

- `HeroArt`：透明高保真 poly 主雕塑，純裝飾，必須使用空替代文字和 `aria-hidden`。
- `JourneyArt`：確定性 SVG/CSS 背景；真實課程連結本身構成路徑節點。
- `LessonPlate`：透明 poly 圖集按 slug 唯一裁切，外層可訪問名稱解釋本課狀態或轉移。

不允許在頁面元件中為新家族增加條件繪製鏈，也不允許藝術模組複製 catalog 的課程標題和順序。

## 2. 同一工坊、不同礦材

統一項：

- 三分之四視角、清楚的多面切片和受控高光；
- 暖墨色工程輔助線、剋制的地面投影與透明邊緣；
- 相同的光照方向、細節密度與縮略圖清晰度；
- 深淺主題使用同一幾何，只改變 token、陰影和環境對比。

差異項：

| 家族 | 礦材與顏色 | 空間語法 |
|---|---|---|
| C 區間 | 陶土 / `--grad-c` | 端點、張力拱、嵌套與分割 |
| D 矩陣 | 橄欖石 / `--grad-d` | 晶格平面、摺頁與變換軸 |
| E 換根 | 灰紫晶 / `--grad-e` | 根站、巡遊軌道與雙向流 |
| F 樹形 | 赭金礦 / `--grad-f` | 固定根、子樹容器與向上匯聚 |
| G 狀壓 | 玫瑰石英 / `--grad-g` | 稀疏狀態星座、合法邊與輪廓線 |

身分色不能替代 `--viz-current/source/chosen/settled/invalid` 等跨家族狀態色。

## 3. Poly 資產

- 分類主雕塑、課程圖集與 Demo Hero 均保留獨立高解析度源圖；生產交付統一使用透明 AVIF，並按實際展示尺寸壓縮，不把生成母版直接傳送到用戶端。
- 圖集佈局：C 3×2、D 2×1、E 2×2、F 3×2、G 3×2。
- 所有圖集單元使用 3:2 頁面視窗；可見輪廓約留 6% 安全區。
- 圖像內禁止課程標題、公式、數字和說明文字；語義由 DOM 提供。
- 空圖集格必須真正為空，不能複製已有圖例填滿。
- 單檔案不得超過 760 KB；CSS 檔案不得超過 80 KB。
- 居中以實際可見輪廓 frame 為準，不能以透明畫布或單元格中心代替。

## 4. 分類課程路徑

- 禁止“左側列表 + 右側附加圖解”。
- 連結、序號、標題和摘要都是真實 DOM；背景圖只連接和解釋這些節點。
- C 使用嵌套端點站，D 使用雙平面，E 使用巡根軌道，F 使用匯聚樹冠，G 使用稀疏星座。
- 900px 以下取消絕對構圖並進入兩列順序流；700px 以下進入單列。
- 行動裝置端隱藏輔助結構圖，但保留完整課程標題、摘要、序號和操作。

## 5. 概念板與評審

每個家族目錄包含：

- `family-concept-dark.svg`：深色桌面總覽；
- `family-concept-light.svg`：同幾何淺色桌面總覽；
- `family-concept-mobile.svg`：390×844 的降維策略；
- `README.md`：逐課語義、必須/允許/禁止、保真清單。

評審先比較五類總覽，再按 C→G 檢查分類頁與代表課程。任何方案都必須回答“它在解釋哪個狀態、轉移、約束或邊界”。

## 6. 正文儀器殼層

- catalog 中全部 37 門有效課程統一標記為 `data-demo-standard="instrument"` 與 `data-demo-intensity="enhanced"`，不得維護代表課程白名單。
- 歷史 `.demo` 使用連續縱向儀表脊、順序編號、工程網格、共享焦點與 44×44px 觸控基線；新式 Demo 使用 `DemoWorkbench` 及其共享原語。
- 14 門代表課繼續作為家族構圖的評審歸檔；實作範圍則覆蓋全部 37 門課程，每課首個真實 Demo 都有按該課機制獨立生成、獨立檔案的靜態 Hero。
- Demo Hero 通過共享 `DemoSculptureHero` 接入，只承擔裝飾，不讀取參數、求解結果或播放影格；禁止複製另一課程資產、圖集裁片或把動態資料烘焙進 Hero。
- 大表只能在局部儀器視窗內捲動；行動裝置端保留演算法主脊柱並重排參數、表格與解釋層，禁止頁面橫向捲動。
- 當前、來源、被選、已確定、非法五態必須具有顏色之外的第二編碼；light/dark 與 reduced-motion 不得改變資訊結構。

## 7. 驗收

- light/dark：幾何、順序和資訊一致。
- 1600×1000、1440×900、1024、820、390×844：無頁面橫向溢出。
- 分類頁存在唯一主雕塑和同源路徑；課程頁不存在 `PartGlyph` 退回。
- 37 個 slug 均有唯一圖例和可訪問名稱。
- 37 門課程均有至少一個真實 Demo，並使用統一正文儀器合同。
- 37 門靜態 Hero 保持一課一資產、純裝飾且與動態資料解耦；14 門代表課仍保留為視覺方向評審樣本。
- 當前路由只載入所屬家族的藝術模組與資產。
- `prefers-reduced-motion` 下移除非必要濾鏡和動畫效果。
