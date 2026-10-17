---
type: Design Audit
title: A–G Body Visualization and Demo Audit
description: Current A–G lesson-body figure and Demo inventory, shared contracts, and regression priorities.
tags: [design, visualization, demos, audit]
status: stable
generated: { by: openai/codex, at: 2026-08-02T00:00:00+08:00 }
sources:
  - resource: ../../site/src/content/
  - resource: ../../site/src/components/demos/
  - resource: ../../site/src/pages/TypePage.tsx
---

# A–G 正文圖版與 Demo 一致性稽核

## 稽核口徑

- 本文記錄當前程式碼事實，不記錄任務流水。圖版數按課程 JSX 中的 `<figure>` 執行個體計，Demo 數按實際掛載的 `components/demos/` 元件執行個體計。
- A–G 共 37 門課程、**111 個正文圖版、56 個 Demo**；每門課程至少有一個真實 Demo，G/plug 已不再是例外。
- catalog 是課程範圍、slug、順序與中繼資料的唯一來源；正文標準不維護第二份課程白名單。
- solver、輸入合同、播放狀態機和家族遊戲邏輯仍是穩定邊界；統一層只負責表達殼層、交互語法與可視狀態。

## 當前統一合同

- 所有有效課程文章都由 `TypePage` 標記為 `data-demo-standard="instrument"` 與 `data-demo-intensity="enhanced"`。
- 歷史 `.demo` 獲得同一條縱向儀表脊、`ALGORITHM INSTRUMENT` 標識、連續編號、背景網格、焦點外觀和至少 44×44px 的觸控目標。
- 新式 Demo 通過 `DemoWorkbench`、`InstrumentRail`、`DemoTableViewport`、`DemoDetailSwitch` 與 `VizStateRole` 重複使用播放、表格、細節和五態語法；課程正文不直接呼叫底層 `PlaybackControls`。
- 大表只在自身儀器視窗內捲動；頁面不得橫向捲動。活動格、來源、被選轉移、已確定和非法態必須保留顏色之外的輪廓、符號、紋理或線型編碼。
- 行動裝置端按主物件重排，控制軌允許分行，但不得縮小觸控目標、裁切桌面圖或把整張大表壓進螢幕。
- 深淺主題使用相同 DOM、資料和幾何；`prefers-reduced-motion` 只移除非必要演繹，不改變步驟與結果。
- 全部 37 門課程的首個真實 Demo 均有一張按課程機制獨立構圖的高保真靜態 Hero；每張資產只屬於一個課程 slug，不跨課重複使用。
- Hero 統一由 `DemoSculptureHero` 承載，使用空替代文字與 `aria-hidden`，內部禁止按鈕、輸入、SVG 和播放狀態節點；它們只建立課程視覺記憶，不讀取參數、播放影格或求解狀態。

## 逐課紀錄表

### A 揹包 DP — 26 圖版 / 14 Demo

| 課程 | 圖版 | Demo | 主物件與持續迴歸重點 |
|---|---:|---:|---|
| `01` | 3 | 2 | 物品編輯、逆序容量軌與當前轉移。 |
| `complete` | 2 | 2 | 可重複取用、正序容量軌與獨立靜態 Hero。 |
| `multiple` | 3 | 2 | 二進位拆包、餘數鏈與單調佇列密度。 |
| `group` | 3 | 2 | 組內互斥、組間推進與衝突編碼。 |
| `mixed` | 3 | 1 | 01 / 完全 / 多重三類物品的排程規則。 |
| `cost2d` | 3 | 1 | 二維容量活動鄰域與局部捲動。 |
| `dep` | 3 | 1 | 主件附件樹、合法組合與分組歸約。 |
| `variant` | 3 | 2 | 最大值、計數、可行性與撤銷的共享狀態角色。 |
| `fractional` | 3 | 1 | 貪心密度序與離散揹包的對照邊界。 |

### B 線性 DP — 22 圖版 / 14 Demo

| 課程 | 圖版 | Demo | 主物件與持續迴歸重點 |
|---|---:|---:|---|
| `path` | 3 | 2 | 三角形 / 網格的來源格與推進方向。 |
| `maxseg` | 3 | 2 | 延續、重新啟動和全域最優區間。 |
| `lis` | 3 | 2 | 相依鏈與牌堆尾值的雙演算法視角。 |
| `lcs` | 4 | 2 | 雙序列編輯、二維表、回溯和局部捲動。 |
| `edit` | 3 | 2 | 插入 / 刪除 / 替換三向來源與播放軌。 |
| `fsm` | 3 | 2 | 狀態機節點、轉移邊與股票狀態表。 |
| `count` | 3 | 2 | 遞推來源、累加過程與確定值。 |

### C 區間 DP — 15 圖版 / 10 Demo

| 課程 | 圖版 | Demo | 主物件與持續迴歸重點 |
|---|---:|---:|---|
| `stone` | 3 | 2 | 區間端點、分割點與合併代價。 |
| `ring` | 3 | 2 | 斷環成鏈、複製區間與視窗掃描。 |
| `palindrome` | 3 | 2 | 兩端收縮、插入來源與回溯。 |
| `tree` | 3 | 2 | 根枚舉、區間子樹和建樹結果。 |
| `merge` | 3 | 2 | 取端、相等合併與非法組合。 |

### D 矩陣 DP — 7 圖版 / 4 Demo

| 課程 | 圖版 | Demo | 主物件與持續迴歸重點 |
|---|---:|---:|---|
| `grid` | 3 | 2 | 最大正方形、雙路徑來源與衝突紋理。 |
| `matpow` | 4 | 2 | 狀態向量、矩陣乘法和快速冪縱向軌跡。 |

### E 換根 DP — 10 圖版 / 4 Demo

| 課程 | 圖版 | Demo | 主物件與持續迴歸重點 |
|---|---:|---:|---|
| `basic` | 3 | 1 | 向下彙總、父側回傳與根切換。 |
| `distsum` | 3 | 1 | 跨邊增減、點權模式與結果表。 |
| `inout` | 2 | 1 | 子樹內外陣列、樹結構與活動半徑。 |
| `center` | 2 | 1 | 最長 / 次長鏈、偏心距與中心收束。 |

### F 樹形 DP — 15 圖版 / 5 Demo

| 課程 | 圖版 | Demo | 主物件與持續迴歸重點 |
|---|---:|---:|---|
| `select` | 3 | 1 | 選 / 不選節點、父子衝突與禁用態。 |
| `knapsack` | 3 | 1 | 子樹容量卷積、合併來源與局部捲動。 |
| `diameter` | 3 | 1 | 兩條最長向下鏈與直徑合成。 |
| `cover` | 3 | 1 | 三狀態覆蓋、非法態與獨立集對照。 |
| `count` | 3 | 1 | 距離殼層、後序匯聚與括號樹。 |

### G 狀壓 DP — 16 圖版 / 5 Demo

| 課程 | 圖版 | Demo | 主物件與持續迴歸重點 |
|---|---:|---:|---|
| `board` | 4 | 1 | 行 mask、相鄰合法性與兩行相依。 |
| `tsp` | 4 | 1 | 集合 × 終點狀態、點位編輯與 Hamilton 路徑。 |
| `cover` | 3 | 1 | 覆蓋 mask 合成、幾何軌跡與來源分離。 |
| `subset` | 3 | 1 | 子集遍歷主鏈、進度與當前子集。 |
| `plug` | 2 | 1 | 六影格輪廓狀態、連通編碼與行動裝置端狀態脊。 |

## 持續門禁

1. 全 37 課必須保持 `instrument/enhanced` 標記、至少一個真實 Demo 和零頁面級橫向溢出。
2. 全 37 門 Hero 必須保持一課一資產、空替代文字、`aria-hidden`、無輸入和無播放狀態耦合；瀏覽器門禁同時斷言 37 個建置後資源 URL 互不重複。
3. 代表課程需持續斷言真實交互產生狀態變化且 Hero 資源不隨狀態變化；高密度課程 A/cost2d、B/edit、C/tree、D/matpow、E/inout、F/knapsack、G/tsp、G/plug 保留專項迴歸。
4. 新增或重寫 Demo 優先接入共享原語；歷史 `.demo` 可以漸進遷移，但不得重新建立課程白名單或第二套播放控件。
5. 資源預算保持區域產物 6.30 MB、單檔案 760 KB、CSS 80 KB，不以調高閾值替代優化。
