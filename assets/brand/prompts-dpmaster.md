# DP大師（dpmaster）— 提示詞

> ★ **本專案不是 BetaPass 平台**，只借用 `BetaPass/std/` 的製作標準（五件套、畫幅、安全區、
> 「先圖後字」的合成紀律）。資產**不進** `BetaPass/src/web/assets/platform/`，也不登記它的
> `manifest.json`；`validate.cjs` 那條「正好 25 張」的硬斷言與本專案無關。
>
> | 落位 | 路徑 |
> | --- | --- |
> | BetaPass 鏡像 | `BetaPass/std/brand/dpmaster/` |
> | 專案完整副本 | `DpMaster/assets/brand/` |
> | 指令碼 | `BetaPass/std/candidates/_build/`（只存 BetaPass） |
>
> 正文一律寫工作區相對路徑、不用 Markdown 相對連結 —— 兩份副本要能逐位元組相同。
>
> ★★ **這份檔案落在 DpMaster 儲存庫裡就進了品牌門禁的掃描範圍**：
> `DpMaster/site/scripts/brand-contract.test.mjs` 遞歸掃儲存庫根下所有文字檔案（跳過 `.git`、`dist`、
> `node_modules`），命中它 `forbiddenNames` 裡的兩個舊名就紅。**改本檔案時不要寫出那兩個舊名的
> 任何字面形態**（要確認寫法去讀那個測試，別在這裡複述——複述本身就會踩雷）。

## 專案檔案

| 項 | 值 |
| --- | --- |
| code / 顯示名 | `dpmaster` / DP大師 |
| 定位 | 面向 C++ 演算法學習者的動態規劃交互式學習網站：講解 + 可編輯演示 + 小遊戲 + 題目索引 |
| 最終文字 | 主標「DP大師」· 副標 `DpMaster` |
| 字體 | 中文 **Noto Sans SC Bold**（站台 `--font-body`）· 拉丁 **Space Grotesk**（站台 `--font-display`；品牌重建讀取固定副本 `BetaPass/std/brand/dpmaster/fonts/space-grotesk-latin-700-normal.woff2`，授權文字隨副本保存） |
| 色板 | 暖墨 `#0b0a09` · 表面 `#1a1614` · 蜜金 `#f0cd83` → `#e0a24c` · 正文暖白 `#ece7de` · 七族低飽和寶石色 |
| 背景方向 | ★ **「教學器物」**（owner 2026-08-19 拍板）：DP 表格實體化成暖墨石磚/煙燻玻璃狀態格陣，蜜金光沿最優子結構逐格爬行 |

## 視覺方向

一切錨在站台的 **Warm Ink** 體系（權威是 `DpMaster/site/src/styles/tokens.css`）：暖中性近黑底、
蜜金全域強調、七部分各一枚低飽和礦物寶石色、髮絲描邊、彌散軟陰影。**它明確取代過早期的
高飽和彩虹漸變方向**，所以任何彩虹、糖果色、藍紫科技網格都是走回頭路。

背景不走現有社交圖那種「抽象光軌」，而走**器物**：把 DP 表格做成看得見摸得著的格陣——
方形狀態磚、倒角、髮絲金線、邊緣刻度，**光是被點亮的格子自己發出來的**，不是外面打了一盞燈。
這樣一眼說得清「這是講動態規劃的」，而不只是好看。

Logo 是**狀態旋印**：七枚狀態片旋轉匯聚到中心一枚最優狀態。它與站台 `DpMaster/site/public/favicon.svg`
是同一個概念的高精插畫版——**必須認得出是同一族**（七片、旋轉、中心一枚），但這次是重新生成，
不從那個 SVG 派生。

## 1. Logo 原生生成（隨後摳圖）

```text
Use case: logo-brand
Asset type: transparent platform logo source
Primary request: an original mark for an interactive dynamic-programming learning site — seven state fragments spinning inward and settling onto one optimal state
Subject: seven identical tapered shards arranged in a seven-fold pinwheel rotation, each shard a different low-saturation mineral gem tone, all leaning and converging toward the center; at the exact center a small faceted diamond of honey gold sits in a dark recess, lit as if it were the settled optimal value; the shards must read as one deliberate rotational system, countable at a glance
Style/medium: premium editorial identity mark, flat to slightly dimensional, precise geometric construction, mineral pigment quality rather than candy color, crisp clean edges
Composition/framing: one centered radially symmetric mark, 15% padding, the seven-fold rotation clearly countable, readable at 208px
Color palette: honey gold #f0cd83 and #e6b45c leading, low-saturation mineral accents #c8863a, #82ab9f, #d2896a, #97a06a, #a693c0, #c0899a, one shard in warm off-white #ece7de, dark warm ink #0b0a09 in the center recess; no magenta inside the subject
Scene/backdrop: perfectly flat solid #FF00FF chroma-key background for local removal
Constraints: one uniform backdrop with no shadow, gradient, texture, floor or reflection; no text; no letters; no numbers; no watermark; no frame
Avoid: rainbow saturation, candy colors, flower or petal look, pinwheel toy, loading spinner, sparkle burst, neon, glassmorphism, 3D chrome, six or eight shards, a rounded square plate behind the mark
```

摳圖後入庫 `DpMaster/assets/brand/dpmaster-logo.png`。

## 2. 徽章背景原生生成（3:1）

```text
Use case: stylized-concept
Asset type: platform badge background, 3:1 full-bleed
Primary request: a wide teaching-apparatus plate — a dynamic-programming table made physical, with an optimal path lighting up cell by cell
Scene/backdrop: a warm near-black ink field holding an isometric lattice of square state tiles cut from dark warm stone and smoked glass; each tile has a faint chamfered edge and a hairline honey-gold rule; a few tiles carry small engraved tick marks like a measuring instrument
Subject: right 40% holds the hero — a honey-gold light climbing diagonally through the lattice along the optimal sub-structure, the tiles it has settled glowing warm from within, thin transition arcs springing from one settled tile to the next; left 55% keeps the lattice dark, low-contrast and quiet for later typography
Style/medium: premium editorial-technical illustration, tactile stone and smoked glass, precise engineering geometry, warm ink lighting, no photorealism
Composition/framing: wide 3:1, full bleed, right focal point, clean left text-safe zone, lattice present across the whole frame
Lighting/mood: warm honey light emitted by the settled tiles themselves, everything else in deep warm shadow; studious, precise, calm
Color palette: warm ink #0b0a09 and #1a1614 base, honey gold #f0cd83 and #e0a24c light, sparse low-saturation mineral accents #82ab9f, #a693c0, #d2896a on a few distant tiles
Constraints: no text, no letters, no numbers, no logo, no watermark, no frame, no user interface, no labeled chart
Avoid: rainbow gradient, candy colors, neon cyberpunk, blue-purple tech grid, glassmorphism cards, spreadsheet screenshot, circuit board, evenly lit flat grid with no focal point, cluttered left side
```

入庫 `DpMaster/assets/brand/dpmaster-badge-bg.webp`。

## 3. 豎版背景原生生成（4:5）

```text
Use case: stylized-concept
Asset type: full-height vertical key-visual background, 4:5
Primary request: a vertical view up a corridor of dynamic-programming state tiles, the optimal path climbing from the bottom edge to a single resolved tile near the top
Scene/backdrop: warm near-black space holding a tall receding lattice of square state tiles cut from dark warm stone and smoked glass, ranks narrowing with depth toward the upper third, hairline honey-gold rules and small engraved ticks along the tile edges
Subject: a honey-gold path of settled tiles climbs from the lower edge through the frame and resolves into one brighter tile high in the upper third; thin transition arcs connect the settled tiles; the exact center and lower-middle stay calm enough for a logo and two lines of typography to be added later
Style/medium: premium editorial-technical illustration, tactile stone and smoked glass, precise geometry, warm ink lighting, no photorealism
Composition/framing: 4:5 portrait, full bleed; key visual inside the central 64% safe area; top and bottom 12% expendable to responsive cropping; strong vertical perspective
Lighting/mood: light comes only from the settled tiles, deep warm shadow elsewhere; studious, precise, quietly triumphant at the top
Color palette: #0b0a09, #1a1614, honey gold #f0cd83 and #e0a24c, sparse mineral accents #82ab9f, #a693c0, #d2896a
Constraints: no text, no letters, no numbers, no logo, no watermark, no frame, no user interface, no labeled chart
Avoid: rainbow gradient, candy colors, neon, blue-purple tech grid, glassmorphism, spreadsheet screenshot, circuit board, a small logo floating in an empty box
```

入庫 `DpMaster/assets/brand/dpmaster-stage-bg.webp`。

## 4. 後期合成

- **徽章**：左側 1/4 疊 `dpmaster-logo.png`；中間兩行排「DP大師」與 `DpMaster`；右側只保留光軌 HERO。
  主標約 78px、`#ece7de`；副標 Space Grotesk 約 32px、`#e6b45c`、字距 0.10em。
- **豎版宣傳圖**：中央疊 Logo，下方排中文與英文；整組以垂直居中為基線。
- ★★ **主標「DP大師」是本批唯一的中西混排單行**，`DP` 走 Space Grotesk、「大師」走 Noto Sans SC Bold。
  兩段**同字號並排會顯得 `DP` 偏小**——拉丁大寫字母高度只有漢字字面高度的七成上下。
  所以 `DP` 需單獨放大約 8–12% 後**與漢字齊頂（按字形包圍盒對齊，不按基線對齊）**，
  並在 `P` 與「大」之間補約 0.06em 的中西文間隙。**這一條不做，主標一眼就是歪的。**
- ✅ 2026-08-20：四專案改用獨立的
  `BetaPass/std/candidates/_build/build-non-platform-assets.cjs` 按專案輸出，不改平台資產管線。

## 5. 自檢

- Logo 必須**數得出七片**狀態片，且中心是一枚被點亮的最優狀態；六片或八片即廢。
- Logo 必須與 `DpMaster/site/public/favicon.svg` 認得出是同一族（七片、旋轉匯聚、中心一枚）；
  像一朵花、一個載入轉圈或一個風車玩具就廢。
- 背景必須是**被點亮的格子自己在發光**，不是外面打了一盞聚光燈。
- 不得出現任何可讀的表格標籤、座標軸文字、圖例或介面控件——文字只在後期合成。
- 主標 `DP` 與「大師」齊頂；副標 `DpMaster` 大小寫逐字正確（D 與 M 大寫），
  不寫成 `DP Master` / `Dpmaster` / `DPMASTER`。
- ★ 彩虹與糖果色是**已被取代的舊方向**，不是風格偏好問題；出現即判廢重做。
