---
type: contract
title: Web Platform Baseline 治理（工作區唯一權威）
description: 各 Web 專案可以使用哪些 Web 平台能力、面向哪些瀏覽器建置、相容性目標如何驗證。
tags: [baseline, browsers, compatibility, contract]
status: stable
---

# Web Platform Baseline 治理（工作區唯一權威）

> ★★★ **本檔案是唯一權威。** 各正式接入專案在自己的 `docs/` 下持一份**完整副本**並釘住本檔案的 sha256；
> 副本與權威不一致時，那個專案的品質門**會紅**。⇒ **改本檔案就要重跑各專案的門並同步副本**，
> 不要只改一邊。
>
> ⛔ **本檔案正文不得出現相對連結**（外部 URL 可以）：它會被逐位元組複製到各專案 `docs/` 的
> 不同深度，在那裡相對路徑必然解不開，而只有個別專案的 bundle 測試會發現。檔案名寫成程式碼跨度即可。
>
> 該 hash 門擋的是這樣一條陷阱：**自洽的陳舊抄件會通過每一道門** —— 副本與權威脫鉤後仍然自洽，沒有任何東西會因此變紅。
>
> 參考：[Baseline](https://web.dev/baseline) · [How to use Baseline](https://web.dev/how-to-use-baseline)

## 1. 權威、目標與原則

本檔案是工作區統一的 Web Platform Baseline 治理權威。它用於回答各專案可以使用哪些 Web 平台能力、應面向哪些瀏覽器建置，以及相容性目標如何驗證；它不替代各專案自己的 `AGENTS.md`、產品約束或瀏覽器支援合同。

權威順序如下：

1. 目標專案自己的產品、安全、隱私、授權和瀏覽器合同優先。
2. 本檔案統一 Baseline 分類、六欄位聲明、工具連結線和複核門。
3. `web-contracts.md` 在本檔案之上登記 sitemap、同 URL Markdown 內容協商與 Accept 判據，**不得複製或降低本檔案的瀏覽器合同**。

工作區採用以下預設策略：

- `Baseline Newly Available` 是新 Web 能力的預設開發上限。
- 面向公用網路或跨瀏覽器使用者的生產建置預設採用 `Baseline Widely Available with downstream`。
- 受控瀏覽器環境只有在相容性守衛通過後，才可以把 Newly 作為建置目標。
- 需要長期維護或可重現建置的發佈物使用固定 Baseline 年份或顯式瀏覽器版本。
- 專案已有的、更嚴格的瀏覽器支援合同優先；中央策略不得降低專案當前最低相容範圍。
- Baseline 只描述 Web 平台能力的瀏覽器可用性，不自動提供 polyfill、功能降級、建置轉換或瀏覽器測試。

## 2. 專案聲明模型

每個正式使用 Baseline 的專案都應明確以下欄位：

| 欄位 | 可選值 | 含義 |
|---|---|---|
| `runtime` | `public-web`、`controlled-web`、`browser-tool`、`render-tool`、`non-web` | 專案的實際執行環境 |
| `featureTarget` | `newly`、`widely`、固定年份、`not-applicable` | 開發時允許採用的 Web 能力上限 |
| `buildTarget` | `newly`、`widely`、固定年份、顯式瀏覽器列表、`not-applicable` | 建置產物實際承諾的相容目標 |
| `downstream` | `true` / `false`，並附理由 | 是否納入下游瀏覽器 |
| `criticalFallback` | 專案自定義 | 關鍵能力不可用時的特性檢測、降級或阻斷策略 |
| `verification` | 專案自定義 | 建置、靜態檢查、瀏覽器自動化、實機驗證和 RUM 要求 |

推薦的專案內聲明示例：

```yaml
runtime: public-web
featureTarget: newly
buildTarget: widely
downstream:
  enabled: true
  requiredBrowsers: [android, and_chr, and_ff, samsung]
  reason: 公网产品覆盖移动端下游浏览器
criticalFallback: 关键流程必须提供特性检测和可用降级
verification: 构建检查 + Chromium/Firefox/WebKit 自动化 + RUM 复核
```

該結構是治理介面，不強制所有專案採用同一種設定檔案格式。每個專案應在其已有的權威設定或文件中表達這些欄位；已有 `baseline.config.json` 的專案繼續擴充同一份設定，不建立平行契約。

## 3. 工具鏈適配

### Next.js

- 通過專案的 Browserslist 設定表達目標。
- 同時解析專案聲明與 Next.js 內置 Browserslist 消費器的實際結果；不得以專案直接依賴的 Browserslist 結果代替 Next.js 內置資料。
- 確認 Next.js 的用戶端 JavaScript 與 CSS 編譯實際消費該設定，並在守衛中對實際消費結果執行引擎完整性與最低版本檢查。
- 將語法轉換與執行環境 Web API 支援分開處理；執行環境 API 缺失仍需特性檢測、polyfill 或降級。

### Vite

- 在 Vite 設定中顯式設置 `build.target`，並單獨核實 CSS 目標。
- 不假設根目錄或專案內的 Browserslist 會自動控制 Vite 建置目標。
- 若同時保留 Browserslist，必須說明它由哪些檢查器、CSS 工具或其他建置環節消費。

### esbuild

- 顯式設置 `target`，避免依賴工具預設輸出級別。
- 對需要長期重現的使用者指令碼或發佈物固定具體目標，並記錄 esbuild 與瀏覽器資料版本。

### 原生 HTML、CSS、JavaScript

- 不虛構不存在的轉譯或打包階段。
- 通過靜態語法檢查、已聲明能力的特性檢測、關鍵路徑降級和真實瀏覽器驗證執行策略。
- 當專案權威文件明確禁止引入無消費者的 Browserslist 時，可以使用帶日期和資料來源的固定瀏覽器族合同；守衛必須檢查所有原樣下發資產，並在剔除註解後確認關鍵退回真正存在於可執行程式碼中。
- 固定瀏覽器族合同和 Node 語法檢查不能機械證明所有原樣 CSS/Web API 已相容目標版本；這類專案必須把真實目標瀏覽器矩陣作為發佈驗收，缺證時只能標記“未驗收”，不得由靜態守衛代替。
- 如果專案未來引入建置工具，再按對應適配規則遷移。

## 4. 相容性守衛

任何移動的 Baseline/Browserslist 查詢進入生產建置前，必須執行守衛：

1. 將查詢展開為具體瀏覽器及版本列表。
2. 檢核專案聲明要求的核心引擎全部存在；公用網路專案至少檢查 Chrome、Edge、Firefox、Safari，涉及行動裝置端時同時檢查 iOS Safari 和聲明的下游瀏覽器。
3. 將解析結果與專案當前最低支援合同比較，禁止相容範圍倒退。
4. 確認聲明設定確實被實際建置或檢查環節消費。
5. 記錄檢查日期、Browserslist 版本、瀏覽器資料版本和建置工具版本。
6. 任一核心引擎缺失、目標倒退或設定未串接時直接失敗，不允許進入生產建置。

快照日期必須是真實存在的 ISO 日期，且不得早於當前時間 92 天；這使最長日曆季度也不會逾期。

2026-08-24 使用當時工作區的 Browserslist 4.28.7/4.28.8 資料檢查時，`baseline newly available` 沒有解析出 Firefox 和 Safari。因此在工具鏈或資料更新並重新通過守衛之前，Newly 只能作為特性上限，不能直接作為跨瀏覽器公用網路專案的生產建置目標。該事實是帶日期的觀測，不得被當成永久結論。

## 5. 推進與複核

### 階段 0：聲明與基線記錄

- 為正式接入專案記錄六個治理欄位、當前工具鏈版本和現有瀏覽器支援合同。
- 記錄接入前的輸出語法、包體積、關鍵路徑瀏覽器結果和已有 RUM 分佈。
- 如果接入前資料在當時未採集，必須明確標記為“不可追溯”或“暫無資料”，不得事後偽造；本次實測結果作為下次複核的比較錨點。

### 階段 1：守衛與適配器

- 每個正式接入專案都要實作查詢展開、核心引擎完整性、最低版本退回與工具連結線檢查。
- 先用缺失 Firefox/Safari 的 Newly 查詢證明守衛能夠失敗，再驗證可接受目標能夠通過。

### 階段 4：複核與升級

- 至少每季度重新解析移動查詢並複核使用者瀏覽器分佈。
- 只有 RUM、現有支援合同和相容性守衛同時允許時，公用網路專案才可從 Widely 提升到 Newly。
- 固定年份或顯式版本的可重現發佈物不隨季度複核自動漂移，升級必須形成單獨變更。
- 專案數量、執行形態或公開內容面發生變化時，先重定基中央矩陣，再決定是否進入專案波次。

## 6. 驗收標準與邊界

- 每個工作區專案都要在矩陣裡有一行。★ **矩陣不再手抄**：由 `node Docs/baseline-matrix.mjs` 從各專案的 `baseline.config.json` 現算，專案數與分類計數一個都不寫死。
- 不為非 Web 專案添加 Browserslist、建置目標或無意義的相容性任務。
- 守衛必須拒絕缺失必需引擎、目標範圍倒退或聲明未被工具鏈消費的設定。
- 每個正式接入專案在變更後執行自身建置、靜態檢查和既有測試。
- 公用網路專案至少覆蓋 Chromium、Firefox 和 WebKit/Safari 等價環境的關鍵路徑驗證。
- 使用者指令碼在實際目標頁面中驗證；受控環境專案在實際部署瀏覽器中驗證。
- Baseline 不負責業務功能降級、執行環境 Web API polyfill 或測試覆蓋；這些必須由專案分別落實。
- ★ **不要在本檔案登記任何技能版本號**：那類值必然過期且不會紅。Modern Web Guidance 的使用時機寫在工作區根 `AGENTS.md`「工作方式 · 實作」，版本從當時安裝的技能現讀。
- 後續實施必須先讀取對應專案的 `AGENTS.md` 和權威文件，並尊重專案當前髒工作樹及發佈約束。
