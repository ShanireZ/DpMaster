# AGENTS.md — DP大師

> 繼承 [`../AGENTS.md`](../AGENTS.md)；勿假定自動載入。

<a id="项目与权威"></a>

## 專案與權威

- 顯示名 **DP大師**；目錄 `DpMaster`、儲存庫 `ShanireZ/DpMaster`、Worker `dpmaster` 是發佈標識，勿隨顯示名/網域改名。
- 唯一發布目標：`site/dist/` → Cloudflare Workers Static Assets → `https://dp.round1.cc`。不得恢復區域站、雙域、EdgeOne 或第二發佈平台。
- `site/` 是靜態 React/Vite 應用，不引入帳號、資料庫、線上評測後端；建置只產出 `site/dist/`，canonical 自指，無 hreflang。
- `site/src/data/catalog.ts` 統一課程身分、順序、正文與家族遊戲 lazy import，勿另建 registry；正文按課獨立分包，遊戲也須 lazy-load。
- 題目以 `ExampleCard` / `Exercise` 為準；`site/src/data/problems.ts` 是生成檔案，不手改。題目變化跑 `pnpm content:generate`，提交生成物並同步 README/OKF 數量。
- `site/src/lib/publicRoutes.ts` 的 `PUBLIC_PATHS` 是公開 URL、sitemap、預繪製、同 URL Markdown 協商的唯一集合；內部標本、未知路由不得公開。
- Web 治理的退出門是 [`ShanireZ/DpMaster#6`](https://github.com/ShanireZ/DpMaster/issues/6)。
- 部署與回饋操作讀 [`deploy.md`](deploy.md)；Web 合同讀 [`docs/web-contracts.md`](docs/web-contracts.md)，Baseline 讀 [`docs/web-baseline.md`](docs/web-baseline.md)。核心路由、語料、部署標識變化同步對應文件與測試。

## 命令與驗收

從 `site/` 執行；Node 權威 `.node-version`，Node/pnpm 要求及指令碼權威 `package.json`。二者全域安裝、不經 Corepack，準備見 [`../Init_essential.md`](../Init_essential.md)；不混用 npm/yarn/bun。

| 何時 | 命令與前置 | 能證明什麼 / 邊界 |
|---|---|---|
| 首次準備或鎖定檔變化 | `pnpm install --frozen-lockfile`；執行環境匹配 | 鎖定檔可安裝；不是品質驗收 |
| 頁面開發 | `pnpm dev`；相依已裝 | 本機開發服務；不是驗收 |
| 指令碼、Worker、內容合同變化 | `pnpm test` | Node 指令碼測試；不含元件/瀏覽器 |
| React 元件變化 | `pnpm test:unit` | Vitest 元件/單元測試；不代替實機 |
| 程式碼診斷 | `pnpm lint` | 零 warning lint；不證明執行行為 |
| 需要產物 | `pnpm build` | 先生成內容/SEO，再型別檢查與建置；會寫生成物，不是完整 gate |
| 完整本機交付 | `pnpm verify`；相依和 Playwright 瀏覽器已準備 | Baseline、內容/SEO、兩類單測、lint、建置、HTML、瀏覽器路由、資產預算；不能證明生產設定或真實 Edge/Safari |

`verify` 的順序以 `package.json` 為準，CI 在 `site/` 調同一入口。Chromium 跑全量、Firefox/WebKit 跑關鍵冒煙；瀏覽器合同為四大引擎當前穩定版及上一主版本，真實 Edge/Safari 發佈前人工抽檢。報告實際結果、skip、未覆蓋項。

`pnpm release` 是唯一完整生產發佈入口：verify 後重複使用產物發佈 Worker；會外部寫入。GitHub Actions 只做 CI，不保存生產金鑰、不部署。全域 `wrangler` 須提前安裝登入，版本基線由 `deploy.md` 管理，`pnpm maintenance:check` 讀取；升級後同步基線並重跑 verify。

## 資料與邊緣合同

- Rocket Loader 關閉，Cloudflare Web Analytics/RUM 開啟且只由代理注入；原始碼、預繪製及 HTML 零手動 beacon。建置/預繪製/CSP/部署合同變化須測試 HTML 數量與零 beacon（`pnpm check:html`）。
- 覆蓋 Analytics 回應的 CSP：`script-src` 放行 `https://static.cloudflareinsights.com`，`connect-src` 放行 `'self' https://cloudflareinsights.com`，保留本站所需來源。
- 投遞經 `site/worker/socket-fetch.js`：**fetch 優先，僅 52x 或拋錯才 socket 降級**；其他 4xx/5xx 不重試。socket 不能直連 Cloudflare IP，不得反轉順序。
- relay 協定及測試保留；`site/worker/feedback-core.js` 也是 relay 主機參考實作，勿因未使用刪除。
- `POST /api/_diag/egress` 僅設定 `EGRESS_DIAG_SECRET` 時存在；刪除 secret 後仍須重新部署才關閉，secret 按版本綁定。
- 公開頁提供 HTML/`text/markdown`，策略見 `site/baseline.config.json`。AI 抓取以倉內 `robots.txt` 與 `Content-Signal` 為權威（允許訓練）；round1.cc 的 Cloudflare 託管 robots 是 zone 級（含 luogusp.round1.cc），須保持關閉。HTML 邊緣注入移除 ETag，不得為消紅關閉注入。

## 視覺與工具鏈

- Token 唯一權威 [`site/src/styles/tokens.css`](site/src/styles/tokens.css)，改動前讀頭部 Warm Ink/主題說明；[`docs/design/visual-system.md`](docs/design/visual-system.md) 是導覽，衝突服從 CSS 並同步 docs。
- `site/scripts/design-token-contract.test.mjs` 隨 `pnpm test` 檢查 var 定義、深淺主題顏色覆蓋。白名單須說明 CSS 外設定者及重複使用深色值理由；無來源不豁免。
- 字色 token 須登記並在兩個主題實際表面滿足 AA 4.5:1。債務數量鎖定，不得加債務消紅；細節看測試。門不覆蓋非 token 的硬編碼色。
- `site/scripts/lint-type-aware-coverage.test.mjs` 鎖 oxlint 檔案集屬於各 TS Program；Node 指令碼進 `tsconfig.scripts.json`，Playwright 進 `tsconfig.browser-tests.json`。紅時補 project，不改 ignorePatterns；lint/tsconfig 改動須用 `typescript/no-deprecated` 臨時探針驗活。
- Baseline：`runtime: public-web`、`featureTarget: newly`；`site/baseline-targets.ts` 顯式凍結 Vite 8 Widely 目標，`widely available with downstream` 僅能力審查，不得讓 Vite 自動消費。六欄位及 Web 宣告只維護在 `site/baseline.config.json`；`pnpm baseline:check` 是 verify 首門。
- 直接相依用獲準穩定主線的 `^`，lockfile 是 CI 精確解析合同。`site/pnpm-workspace.yaml` 強制 24 小時隔離、Node 引擎、建置指令碼白名單、相依狀態檢查，禁止排除/寬鬆模式/換包管理器繞過；版本升級獨立 task、完整驗證、一個 commit。
- 禁廢棄 API、CommonJS 相容層、舊瀏覽器 polyfill、棄用 CLI、過渡選擇器、lint 豁免；無現代替代時停手彈出視窗。

## 交付與授權

- 一個 task 一個聚焦 commit，提交本機 `main`；agent 不得 push，由 owner 彙總推送。延後 push 不弱化本機 gate。
- 視覺方向、產品規則、相容策略、發佈合同變化須帶對比證據彈出視窗拍板。
- `docs/` 只放長期當前事實（OKF v0.2）；`handoff/` 放任務計畫/清單，驗證後勾選，完成計畫不留 docs。
- README 是公開入口，badge 遵循 [`../badgestd.md`](../badgestd.md)，事實來自 package/catalog/deploy；LICENSE 未宣告 only/or-later，文件統一通用 `GPL-3.0`，不得猜 SPDX variant。
- Issue tracker：本儲存庫 GitHub Issues；triage、domain、OKF 沿用 [`docs/agents/index.md`](docs/agents/index.md)。
