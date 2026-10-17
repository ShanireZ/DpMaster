# DP大師部署指南

本文面向需要把 DP大師發佈到線上、設定站內回饋機器人、或排查部署問題的維護者。所有命令預設在 `site` 目錄下執行。

DP大師是一個 React + Vite 預繪製靜態站。**生產只有一個發佈目標**：把 `site/dist/` 發佈到 Cloudflare Workers Static Assets，入口是 `site/worker.js`，網域是 `https://dp.round1.cc`。

產物包含 47 個預繪製公開路由及其同 URL Markdown 表示、React 水合、自指 canonical、sitemap/robots/llms.txt 與 JSON-LD。單域站台不發佈任何 hreflang 備選。站內回饋走同源 `POST /api/feedback`；有限的頁面與回饋統計事件走同源 `POST /api/analytics`。

> **2026-08 遷移**：此前的國內 EdgeOne 站 `dp.betaoi.cn` 與國際站 `dp.betaoi.cc` 已一併退役，儲存庫裡不再保留任何相關設定、指令碼或產物目錄。舊網域不做 301 跳轉（owner 決定），已收錄頁面會自然掉索引。★ 退役同時帶走了「瀏覽器跨域直連國內站 → 國內站轉發進釘釘」這條回饋/告警連線路徑，替代方案尚未確定，見下文「回饋與告警送達」。

## 一頁流程

```bash
# pnpm 由全域獨立安裝，見 ../Init_essential.md（本機不裝 corepack）
pnpm install --frozen-lockfile
pnpm release
```

發佈工具鏈（`wrangler`、`gh`、`cnb`）由發佈機全域安裝並登入，見“全域 CLI 準備”；新機器先完成該節再跑上面的流程。

`pnpm release` 是唯一完整發布入口：先執行完整 `pnpm verify`，重複使用該次建置產物，再發布 Cloudflare Worker。

如果需要跳過 `release` 直接部署，必須先自行完成完整驗證：

```bash
pnpm verify
pnpm deploy:cf
```

## 全域 CLI 準備

發佈 CLI 全部**系統全域安裝、提前登入**，不在各專案內重複安裝，升級也只在全域做一次。新機器或新維護者首次接手時，按順序執行：

```bash
# 1. 安裝（Windows 預設 shell；gh 也可用 winget install --id GitHub.cli）
pnpm add -g wrangler @cnbcool/cnb-cli
winget install --id GitHub.cli   # 已裝則跳過

# 2. 登入（均為一次性 OAuth，憑證快取在使用者目錄，各專案共用）
wrangler login
cnb login
gh auth login
```

驗證：

```bash
wrangler --version && wrangler whoami
git -C .. ls-remote --heads cnb refs/heads/main
gh auth status
```

`cnb status` 未登入也可能回傳成功，因此不作為 Git 憑證判據；上面的 `ls-remote` 會從帶 `cnb` remote 的儲存庫上下文走已設定的 credential helper。

> **cnb 只保留 pnpm 全域安裝這一條渠道。** 不要再安裝 `~/.cnb/bin/cnb.exe` 原生副本；兩份並存會被 PATH 靜默遮蔽，且行為不同。工作區 Git credential helper 使用 PATH 形式的 `!cnb git-credential`，完整驗證方法見根 `AGENTS.md` 與 `../Init_essential.md` §4.3。

全域 CLI 升級：

```bash
pnpm add -g wrangler @cnbcool/cnb-cli  # gh 用 winget upgrade --id GitHub.cli
```

升級後把下方“全域 CLI 基線”表中的版本號同步為實際安裝版本，並在本儲存庫跑一次 `pnpm verify` 確認部署連線路徑不受影響。

### 全域 CLI 基線

本表是機器可讀的當前基線宣告，`site/scripts/check-toolchain-drift.mjs` 每週巡檢會讀取並與 npm 最新穩定版比對。全域升級後必須同步更新本表數字：

| CLI | 當前基線 |
| --- | --- |
| wrangler | 4.128.0 |

## 部署前準備

需要準備：

- Node.js 26.10.0 與 pnpm 12.6.0，均為**全域安裝**（見 [`../Init_essential.md`](../Init_essential.md)）。儲存庫使用 `pnpm-lock.yaml` 鎖版，版本權威是 `site/.node-version`、`site/package.json` 和 `site/pnpm-workspace.yaml`。
- 已完成“全域 CLI 準備”：`wrangler`、`gh`、`cnb` 全域安裝並登入。
- Cloudflare 帳號，已允許 Wrangler 發佈 Workers，且 `round1.cc` zone 在該帳號下。
- 如果需要站內回饋，先讀完“回饋與告警送達”一節——當前這條連線路徑是斷的。

不要把以下內容寫入儲存庫：

- `FEEDBACK_WEBHOOK_URL`
- `FEEDBACK_WEBHOOK_SECRET`
- `FEEDBACK_RELAY_SECRET`
- `ALERT_WEBHOOK_URL`
- `ALERT_WEBHOOK_SECRET`
- `EGRESS_DIAG_SECRET`
- Cloudflare API token
- 本機 `.env`、`.dev.vars`、認證快取或 CLI 登入快取

## 本機建置

```bash
# pnpm 由全域獨立安裝，見 ../Init_essential.md（本機不裝 corepack）
pnpm install --frozen-lockfile
pnpm lint
pnpm build
```

建置輸出在 `site/dist/`，不入儲存庫。`pnpm build` 會執行：

1. `tsc -b`
2. Vite 用戶端建置。
3. 在隔離的 production Node 處理程序中用 React 19 `prerender()` 繪製 47 個公開路由與 1 個內部標本頁。
4. 從每個公開頁面同一次本機語義繪製生成 47 份內部 Markdown 資產。
5. 寫入 canonical、sitemap、robots、`llms.txt`、`route-summaries.json` 與 `404.html`。

`pnpm check:html` 在 `verify` 鏈裡檢核產物：HTML 數量正確（96 份 = 首頁 1 + 其餘 47 條預繪製路由各 2 份 + 404），47 份 Markdown 與公開路線集合完全一致、足夠精簡且無瀏覽器控件/內部路徑洩漏，並且**任何一份 HTML 都不含手動注入的 Cloudflare Web Analytics beacon**（beacon 由 Cloudflare 代理自動注入，手動再來一份就是重複統計）。

本機預覽：

```bash
pnpm preview
```

## Cloudflare 部署

### Cloudflare 使用的檔案

| 檔案                               | 作用                                                             |
| ---------------------------------- | ---------------------------------------------------------------- |
| `site/wrangler.jsonc`             | Worker 名稱、入口、自定義網域路由、靜態資源目錄與 404 設定。 |
| `site/worker.js`                  | 在公開頁面上協商 HTML/Markdown，並接住回饋、統計與診斷 API。 |
| `site/worker/content-negotiation.js` | 解析 `Accept` 並在 HTML、Markdown、406 之間作確定性選擇。 |
| `site/worker/feedback-core.js`    | 回饋處理核心，同時是外部 relay 主機的參考實作。 |
| `site/worker/analytics-core.js`   | 第一方統計事件核心。 |
| `site/worker/webhook-core.js`     | Webhook 訊息格式、釘釘加簽、CORS 判定與 relay 協定。 |
| `site/worker/egress-probe.js`     | 出口可達性探針，只在設定 `EGRESS_DIAG_SECRET` 後存在。 |
| `site/dist/`                      | 預繪製產物。 |

當前 Cloudflare Worker 名稱是 `dpmaster`。`wrangler.jsonc` 中的關鍵設定是：

```jsonc
{
  "name": "dpmaster",
  "main": "worker.js",
  "routes": [
    { "pattern": "dp.round1.cc", "custom_domain": true, "zone_name": "round1.cc" }
  ],
  "assets": {
    "directory": "./dist/",
    "binding": "ASSETS",
    "run_worker_first": true,
    "html_handling": "drop-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

`run_worker_first: true` 保證匹配到靜態檔案的請求也先經過 `worker.js`，否則平台的預設靜態資產優先路由會繞過同 URL 內容協商。已登記公開路由預設讀取預繪製 HTML；當 `Accept` 明確更偏好 `text/markdown` 時，Worker 從隔離的內部資產路徑讀取同頁 Markdown。直接請求 `/_representations/` 固定回傳 404，內部標本、未知路由、API 與普通靜態資產不參與協商，但仍先經過 Worker 路由層再按各自規則處理。未知靜態路徑由 `404-page` 回傳 `404.html` 與 HTTP 404；`/api/feedback`、`/api/analytics` 與 `/api/_diag/egress` 進入 `worker.js`。

內容協商發佈冒煙：

```bash
curl.exe -i https://dp.round1.cc/part/a/01 -H "Accept: text/markdown"
curl.exe -i https://dp.round1.cc/part/a/01 -H "Accept: text/html"
curl.exe -I https://dp.round1.cc/part/a/01 -H "Accept: text/markdown"
curl.exe -i https://dp.round1.cc/part/a/01 -H "Accept: application/json"
curl.exe -i https://dp.round1.cc/_representations/markdown/part/a/01.md
```

依次應看到 Markdown 200、HTML 200、無正文的 Markdown HEAD 200、406，以及內部路徑 404。兩種 200 都必須帶 `Vary: Accept`、alternate `Link` 和 `Content-Signal: search=yes, ai-train=yes, ai-input=yes`；Markdown 還必須帶獨立的靜態資產 ETag、`Content-Type: text/markdown; charset=utf-8`、`Content-Language: zh-CN` 與 canonical `Link`。HTML 在 Worker 內保留其資產 ETag，但 Cloudflare 會向最終回應注入 Web Analytics 與 JavaScript Detections；[JSD 注入會移除 HTML ETag](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/#if-you-have-etags)，所以用戶端看不到 HTML ETag 是當前邊緣合同，不得為製造 304 關閉既定注入。

目錄名 `DpMaster`、GitHub 儲存庫 `ShanireZ/DpMaster` 與 Worker 名 `dpmaster` 都是歷史標識符，網域遷移不改動它們。

### 首次發佈到 Cloudflare

```bash
wrangler login
pnpm build
pnpm deploy:cf
```

發佈成功後，到 Cloudflare Dashboard 檢查：

1. 打開 **Workers & Pages**。
2. 選擇 Worker `dpmaster`。
3. 進入 **Settings**。
4. 確認 Worker 已部署，靜態資源綁定來自 `./dist/`，入口指令碼是 `worker.js`。

自定義網域 `dp.round1.cc` 已綁定到該 Worker。`wrangler.jsonc` 裡的 `routes` 條目宣告的是同一個綁定，`wrangler deploy` 會與現狀對齊而不是重複建立。換網域時同步改 `pattern`、`zone_name` 和 `site/src/config/site.ts` 的 `SITE`，然後重跑 `pnpm verify`——SEO 合同測試會拒絕殘留的舊網域。

### Cloudflare 設定回饋變數

必須在 Cloudflare 的生產 Worker 上設定變數。Dashboard 路徑：

1. **Workers & Pages** -> `dpmaster` -> **Settings**。
2. 打開 **Variables and Secrets**。
3. 添加下面的變數。
4. 點擊 **Deploy** 讓變數進入線上版本。

| 名稱                      | 類型   |         必填 | 值                                           |
| ------------------------- | ------ | -----------: | -------------------------------------------- |
| `FEEDBACK_WEBHOOK_URL`    | Secret |           否 | 回饋 webhook 完整 URL。Worker 直連釘釘當前不通，見下節。 |
| `FEEDBACK_WEBHOOK_KIND`   | Text   |           否 | `dingtalk` / `wecom` / `feishu` / `slack` / `discord`。 |
| `FEEDBACK_WEBHOOK_SECRET` | Secret | 加簽模式選填 | 釘釘機器人加簽金鑰，通常以 `SEC` 開頭。      |
| `FEEDBACK_RELAY_URL`      | Text   |           否 | relay 主機的 `/api/feedback`。配了就啟用中轉，回饋與告警都走它。 |
| `FEEDBACK_RELAY_SECRET`   | Secret |           否 | relay 共享金鑰，必須與 relay 主機一致。       |
| `ALERT_WEBHOOK_URL`       | Secret |           否 | 獨立告警機器人；建議與回饋用不同的群或頻道。 |
| `ALERT_WEBHOOK_KIND`      | Text   |           否 | 告警機器人類型，預設沿用回饋類型。           |
| `ALERT_WEBHOOK_SECRET`    | Secret | 加簽模式選填 | 告警機器人的簽名金鑰。                       |
| `EGRESS_DIAG_SECRET`      | Secret |           否 | 啟用 `POST /api/_diag/egress`。排查期之外應刪除，**並重新部署**（secret 按版本綁定）。 |

CLI 設定 Secret：

```bash
wrangler secret put FEEDBACK_RELAY_SECRET
```

### Cloudflare 驗收

深鏈：

```bash
curl.exe -I https://dp.round1.cc/part/a/01
```

期望狀態碼是 200。任意未登記路徑必須回傳 404 且帶 `noindex,nofollow`。

回饋（同源）：

```powershell
$body = @{
  kind = "其他建议"
  page = "Cloudflare 部署检查"
  path = "/"
  description = "Cloudflare 反馈链路测试"
  ts = (Get-Date).ToString("o")
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "https://dp.round1.cc/api/feedback" `
  -ContentType "application/json" `
  -Body $body
```

驗收標準：

- Worker 紀錄出現結構化的 `feedback_received` 記錄。
- 配好送達通道後，HTTP 回應的 `ok` 為 `true`、`status` 為 `delivered`，並帶 `requestId`，目標群/頻道收到訊息。
- ★ 送達通道未定之前這一步只能到 `feedback_received`，回應會是 503 `delivery_unavailable`（未配 webhook）或 502 `delivery_failed`（配了但發不出去）。這是已知狀態，不是迴歸。

可以用 Wrangler 看即時紀錄：

```bash
wrangler tail dpmaster
```

## Sitemap 與搜尋平台提交

建置把 sitemap 寫進發布目錄，線上位址固定為 `https://dp.round1.cc/sitemap.xml`，列出 47 個頁面，每條帶原始碼證據派生的 `lastmod`：已提交原始碼取 Git 提交時間，工作樹編輯取檔案修改時間，絕不使用範本或建置日期。單域站台不輸出 hreflang 互指，`xmlns:xhtml` 命名空間也不再出現。

★ 網域遷移後必須重新提交，舊網域的驗證與 sitemap 記錄不會自動繼承：

1. Google Search Console：新建 `dp.round1.cc` 資源並驗證，提交 `sitemap.xml`。
2. Bing Webmaster Tools：驗證新站台並提交 sitemap；可從 Search Console 匯入。
3. 百度搜尋資源平台：站台已遷到境外託管，收錄預期本就有限；如仍要提交，驗證 `dp.round1.cc` 並提交同一份 sitemap。

`robots.txt` 除 `User-agent: *` 外，顯式放行檢索類、使用者觸發類與訓練類生成式引擎抓取器（`GPTBot`、`OAI-SearchBot`、`ChatGPT-User`、`ClaudeBot`、`PerplexityBot`、`Perplexity-User`、`Claude-User`、`Claude-SearchBot`、`Google-Extended`、`Applebot-Extended`、`CCBot`、`Bytespider`、`Amazonbot`、`meta-externalagent`），不寫任何 `Disallow`。當前已批准的公開內容策略是 `search=yes, ai-train=yes, ai-input=yes`。

★ **AI 抓取策略的權威是倉內這份 `robots.txt` 與 `Content-Signal` 頭，round1.cc 的 Cloudflare 託管 robots.txt 必須保持關閉。** 開關在 **AI Crawl Control → 概覽 / 信號 → 「託管 robots.txt」**（舊入口是 Security → Settings → Bot traffic）。2026-10-11 線上複核時託管塊已不存在。一旦重新打開，它會把下面這段合併到倉內這份的**前面**，與本站策略直接衝突：

```
# BEGIN Cloudflare Managed content
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

User-agent: GPTBot
Disallow: /
（ClaudeBot / CCBot / Google-Extended / Applebot-Extended / Bytespider /
  Amazonbot / meta-externalagent / CloudflareBrowserRenderingCrawler 同样 Disallow）
# END Cloudflare Managed Content
```

⚠ 這個開關是 **zone 級（round1.cc）而不是 hostname 級**，同時作用於 `luogusp.round1.cc`。重新打開會改變本站的 AI 抓取策略，動它之前須兩個主機名的 owner 都同意。同一個 user-agent 落進託管 `Disallow` 與倉內 `Allow` 兩個組時，各家抓取器的合併與優先級實作並不一致，不能指望「後面的 Allow 覆蓋前面的 Disallow」。

託管 robots.txt 只是宣告；AI Crawl Control 對單個抓取器設的「阻止」屬於請求層攔截，robots 放行也無效。發佈後在控制檯確認訓練類抓取器沒有被設為阻止。

`site/src/lib/discovery.ts` 的 `AI_CRAWLERS` 是顯式放行名單，`site/scripts/seo-contract.test.mjs` 鎖住名單逐個出現、生成的 `robots.txt` 不含 `Disallow`。

線上驗收必須同時檢查：最終 `robots.txt` 不含 `# BEGIN Cloudflare Managed content` 託管塊、不含任何 `Disallow`；HTML 與 Markdown 回應都帶 `Content-Signal: search=yes, ai-train=yes, ai-input=yes`。任一項對不上，停止搜尋平台提交併先查控制面。

同時確認以下檔案可匿名訪問且回傳 200：

- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/route-summaries.json`

## 統計

前端只呼叫統一的 `trackAnalyticsEvent`，事件白名單見 `site/src/analytics/index.ts`。

- Cloudflare Web Analytics / RUM 由 Cloudflare 代理**自動注入**，Rocket Loader 保持關閉。原始碼與預繪製產物都不得再加手動 beacon；`pnpm check:html` 會在建置後拒絕任何一份帶 beacon 的 HTML。網域遷移後無需任何操作：`round1.cc` 整個 zone 在 Cloudflare 上，注入照常，Core Web Vitals（LCP / INP / CLS）按 URL 拆分可見。

  ★ **別用光禿禿的 `curl` 判斷注入是否生效。** 自動注入只對**看起來像真實瀏覽器導覽**的請求生效，裸 `curl` 拿到的 HTML 裡沒有 beacon，據此會得出「沒生效」的錯誤結論（2026-08-22 就這麼誤判過一次）。要驗證請帶上瀏覽器請求頭：

  ```bash
  curl.exe -s https://dp.round1.cc/ -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140" -H "Accept: text/html" -H "Sec-Fetch-Mode: navigate" -H "Sec-Fetch-Dest: document" | findstr cloudflareinsights
  ```

  更可靠的判據是直接看 Dashboard 的 Web Analytics 面板有沒有 Core Web Vitals 曲線。
- 站內路由、學習與回饋漏斗事件傳送到同源 `/api/analytics`，成功回傳 204，由 Worker 寫入 `dpmaster` Analytics Engine 資料集。
- 接收器拒絕跨站請求、未知事件、未知 Provider、非 JSON 和過大請求；只記錄裁剪後的路徑、標題及少量原始類型中繼資料，不讀取回饋內容、聯繫方式、Cookie 或帳號標識。
- 統計失敗由用戶端靜默降級，不影響課程、小遊戲、導覽或回饋提交。

同源冒煙測試：

```powershell
$event = @{
  provider = "cloudflare"
  event = "page_view"
  path = "/"
  title = "DP大师"
  ts = (Get-Date).ToString("o")
} | ConvertTo-Json

Invoke-WebRequest `
  -Method Post `
  -Uri "https://dp.round1.cc/api/analytics" `
  -ContentType "application/json" `
  -Body $event
```

期望 HTTP 204，並在 `wrangler tail dpmaster` 中看到 `analytics_event`。

## 回饋與告警送達

★ **方案已定並完成實作：Worker 內經 raw socket 直髮釘釘。**

Cloudflare 資料中心出口到釘釘 `oapi.dingtalk.com` 的 TLS 握手被系統性打斷，穩定 525（2026-08 多輪實測重現；普通海外節點到釘釘正常）。舊架構靠「瀏覽器跨域直連國內站 → 國內站轉發進釘釘」繞開，國內站退役後這條路沒了。

### 2026-08-22 出口探針實測結論

★ **`connect()` 能到釘釘，`fetch()` 不能。方案已定：Worker 內直髮，不需要 relay 主機、不需要換渠道、不需要 Tunnel。**

| 目標 | `fetch()` | `connect()` |
| --- | --- | --- |
| `oapi.dingtalk.com` | 525 | **200 OK** |
| `api.dingtalk.com` | 525 | **200 OK** |
| `qyapi.weixin.qq.com` | 525 | 403（應用層回的） |
| `open.feishu.cn` | 525 | 404 |
| `open.larksuite.com` | 525 | 404 |
| `api.telegram.org` | 302 | 302 |
| `www.cloudflare.com`（自檢） | 200 | 拒絕——文件禁止連 CF 自己的 IP 段 |

POST 往返（`{"mode":"post"}`，不帶 token，不投遞任何訊息）同樣成功：

- `oapi.dingtalk.com/robot/send` → `HTTP/1.1 200`，`application/json`，
  body `{"errcode":40035,"errmsg":"缺少参数 access_token"}`
- `api.dingtalk.com/v1.0/robot/oToMessages/batchSend` → `HTTP/1.1 400`，
  body `{"code":"AuthenticationFailed.MissingParameter",...}`

兩條都是釘釘**應用層**的回覆：請求體發過去了、被解析了，只因為缺憑證才拒絕。回應均為 `Content-Length` 定長，未出現 chunked（解析器兩種都支援）。

★ **原來「Cloudflare 出口到中國境內基礎設施不通」這個說法是錯的**：海外的 `open.larksuite.com` 同樣 525，而 `api.telegram.org` 正常。這不是地理問題，是特定一批對端拒絕 Cloudflare 反代出口；`connect()` 換了出口前綴就通了（官方文件：TCP 出站的出口前綴不在 Cloudflare 公開 IP 段內）。

**實作：`site/worker/socket-fetch.js` 是一個最小 HTTPS 用戶端，走 `cloudflare:sockets` 的 `connect()`。`forwardWebhook` 的投遞順序是「fetch 優先，只有在 Cloudflare 到源站那一跳失敗（52x 或直接拋錯）時才降級到 socket」。**

★ 順序不能反。`connect()` 被禁止連 Cloudflare 自己的 IP 段（探針裡 `www.cloudflare.com` 那條就是這麼失敗的），而 Discord / Slack 這類 webhook 常託管在 Cloudflare 後面 —— socket 優先會把它們全打死。反過來釘釘穩定給 525，正好觸發降級。普通 4xx/5xx 是對端應用層的回覆，不重試。

投遞結果裡會帶 `transport` 欄位（`fetch` / `socket` / `fetch+socket`），排查時一眼看出走的哪條出口。兩條都失敗時保留 fetch 的結論並附上 socket 的錯誤原因。

程式碼側的 relay 協定（`FEEDBACK_RELAY_URL` + `x-dp-relay-secret` / `x-dp-client-ip` / `x-dp-relay-kind: alert`）完整保留且有測試覆蓋，但**現在用不上了** —— 留著是為了日後真需要中轉時不用重寫。`site/worker/feedback-core.js` 既是 Worker 處理器，也是 relay 主機側的參考實作。

需要在 Worker 上配的只剩兩個：`FEEDBACK_WEBHOOK_URL`（帶 `access_token` 的完整釘釘 webhook URL）與 `FEEDBACK_WEBHOOK_SECRET`（加簽金鑰，`SEC` 開頭）。加簽是在選出口之前算的，所以降級到 socket 時 `timestamp` / `sign` 原樣帶上。

## 出口探針

★ 排查完請把 `EGRESS_DIAG_SECRET` 刪掉，並**重新部署一次**：secret 是按版本綁定的，只在 Dashboard 刪除只會建立新版本，當前生效的版本里還帶著它，端點依然可用（2026-08-22 實測確認過這個坑）。

要再測一次出口時，配上 `EGRESS_DIAG_SECRET` 並部署，然後：

```bash
curl.exe -s -X POST https://dp.round1.cc/api/_diag/egress -H "x-dp-diag-secret: THE_SECRET"
```

探針對釘釘兩個接入點、企業微信、飛書、Lark 國際版、Telegram 和一個 Cloudflare 對照組，各跑 `fetch()` 與 `connect()` 兩條出口，全部是無副作用的 `GET /` / `HEAD /`，不會真的發訊息。**關鍵在於 `connect()`**：Cloudflare 官方文件寫明 `cloudflare:sockets` 的出口前綴**不在** Cloudflare 公開 IP 段內，與 `fetch()` 不同——如果釘釘是按公開段封的，手寫 HTTPS 走 `connect()` 就能打通，後面幾條方案全都不用做。

候選方案，按成本從低到高：

| 方案 | 保釘釘 | 需要額外元件 | 說明 |
| --- | :--: | --- | --- |
| raw socket 直連 | 是 | 無 | ✅ **已採用**：用 `cloudflare:sockets` 手寫 HTTPS 請求。 |
| 換釘釘接入點 | 是 | 無 | `api.dingtalk.com` 與 `oapi.dingtalk.com` 是不同 ingress。 |
| 換通知渠道 | 否 | 無 | Telegram / Discord / Slack / Lark 國際版；`webhookBody()` 已支援多數格式。 |
| Cloudflare Tunnel + Workers VPC | 是 | 一臺常開機器 | 跑 `cloudflared`，Worker 用 `vpc_networks` 綁定後投遞。無公用網路 IP、無入站連接埠、無需備案；Workers VPC 目前 beta 且對所有 Workers 計畫免費。 |
| 外部 relay 主機 | 是 | 一臺機器或 serverless | 原樣部署 relay 協定，Worker 側只改兩個環境變數，程式碼零改動。 |

定下來之後：更新本節與 `docs/operations/analytics.md`，刪掉不再適用的分支，並把 `EGRESS_DIAG_SECRET` 從 Worker 變數裡刪除。

## 釘釘回饋機器人

### 當前支援方式

當前程式碼支援的是**群自定義機器人 / 群 Webhook 機器人**。它的設定模型是一個 webhook URL，加簽時再加一個 secret。這正好對應當前的：

- `FEEDBACK_WEBHOOK_URL`
- `FEEDBACK_WEBHOOK_KIND=dingtalk`
- `FEEDBACK_WEBHOOK_SECRET`

釘釘官方說明裡，群 Webhook 機器人只能往群裡發訊息，不支援單聊，也不支援接收訊息。它還被標為不推薦長期新增的方向。因此，當前實作適合“把使用者回饋推送到一個維護者群”。

### 建立群自定義機器人

1. 在釘釘用戶端進入接收回饋的群。
2. 打開群設定。
3. 找到 **機器人** 或 **智能群助手**。
4. 添加 **自定義機器人**。
5. 命名，例如 `DP大师反馈`。
6. 選擇安全設定：
   - 推薦 **加簽**：複製 `SEC...` 金鑰，填入 `FEEDBACK_WEBHOOK_SECRET`。
   - 簡單測試可用 **自定義關鍵詞**：關鍵詞填 `反馈` 或 `DP大师`，此時不要設定 `FEEDBACK_WEBHOOK_SECRET`。
7. 複製 webhook URL，填入 Worker 的 `FEEDBACK_WEBHOOK_URL`。
8. 在 Worker 上設定 `FEEDBACK_WEBHOOK_KIND=dingtalk`。

不建議使用 IP 白名單。Cloudflare Workers 的 Serverless 出口 IP 不適合手動維護白名單，`connect()` 的出口前綴還與 `fetch()` 不同。

## 回饋介面合同

前端 `FeedbackWidget` 向同源 `POST /api/feedback` 傳送 JSON。

請求欄位：

| 欄位          | 來源         | 說明                                                   |
| ------------- | ------------ | ------------------------------------------------------ |
| `kind`        | 前端表單     | `内容有误` / `显示异常` / `功能问题` / `建议` / `其他` |
| `page`        | 前端自動生成 | 人類可讀頁面名                                         |
| `path`        | 當前路由     | 例如 `/part/a/01`                                      |
| `description` | 必填         | trim 後至少 4 個字元                                   |
| `steps`       | 選填         | 重現步驟或期望                                         |
| `contact`     | 選填         | 使用者自願留下的聯繫方式                                 |
| `url`         | 使用者選擇     | 勾選診斷資訊後附帶當前完整 URL                         |
| `ua`          | 使用者選擇     | 勾選診斷資訊後附帶 User-Agent                         |
| `viewport`    | 使用者選擇     | 勾選診斷資訊後附帶視口尺寸                             |
| `ts`          | 前端自動生成 | ISO 時間                                               |

欄位長度上限與前端表單一致：`description` 2000、`steps` 1000、`contact` 120；請求整體不得超過 16 KB。類型必須是表中的五種之一，瀏覽器請求必須同源並使用 `application/json`。

回應：

| 條件                       | 狀態 | Body 要點                                                      |
| -------------------------- | ---: | -------------------------------------------------------------- |
| 非 JSON 內容類型            |  415 | `error: "unsupported_media_type"`                              |
| 跨站瀏覽器請求             |  403 | `error: "forbidden_origin"`                                   |
| 非法 JSON                  |  400 | `error: "bad_json"`                                          |
| 欄位、類型或描述長度無效       |  422 | 穩定的 `error` 程式碼與可讀 `message`                           |
| JSON 過大                  |  413 | `error: "too_large"`                                         |
| 同一來源 30 分鐘內第 11 條     |  429 | `error: "rate_limited"`，並帶 `Retry-After`                 |
| 結構化紀錄寫入失敗            |  500 | `error: "log_failed"`                                        |
| Webhook 確認送達            |  200 | `{ "ok": true, "status": "delivered", "forwarded": true, "requestId": … }` |
| Webhook 未設定              |  503 | `error: "delivery_unavailable"`                       |
| Webhook 轉發失敗            |  502 | `error: "delivery_failed"`                            |

合法請求會先輸出一條 `[feedback]` 結構化紀錄，其中 `event=feedback_received`。只有 Webhook 回傳成功且業務碼通過時，瀏覽器才收到 `status: delivered` 和回執編號；未設定或轉發失敗會明確回傳 503/502。第二條 `event=feedback_webhook` 紀錄會記錄 `forwarded`、`http_error`、`business_error` 或 `network_error`。紀錄不輸出 Webhook URL 和簽名金鑰。

### 限流邊界

程式碼內置“同一來源捲動 30 分鐘最多 10 條”限流，但狀態保存在單個邊緣執行個體記憶體中，只是低成本保護，不是跨執行個體強一致安全邊界。如果需要全域嚴格限制，在 Cloudflare WAF / Rate Limiting 中為 `/api/feedback` 設定每來源 30 分鐘 10 次。

## 常見問題

| 現象                                   | 優先檢查                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 已登記的深鏈回傳 404                   | 是否發佈了 `dist/`，該路徑的預繪製 `.html` 是否存在，`html_handling` 是否仍為 `drop-trailing-slash`。 |
| `/api/feedback` 回傳 HTML              | 請求方法是否是 `POST`，URL 是否真的指向 `/api/feedback`，Worker 是否是最新版本。                    |
| 未知路徑回傳 200                       | `not_found_handling` 是否仍是 `404-page`，`dist/404.html` 是否存在。                                |
| `/api/analytics` 回傳 403              | 請求帶了非本站 `Origin`；統計端點只允許同源瀏覽器請求。                                            |
| `/api/_diag/egress` 回傳 405 / 404     | 未配 `EGRESS_DIAG_SECRET`，或 `x-dp-diag-secret` 不匹配。請求落回靜態資源，與任意未知路徑完全一致（POST → 405，GET → 404，回應體皆空）——這是設計行為，不洩露端點是否存在。 |
| 頁面 canonical 指向舊網域              | 發佈的是遷移前的舊產物；重新 `pnpm build`，`pnpm check:seo` 會拒絕殘留舊網域。                      |
| `Failed to fetch dynamically imported module` / `Unable to preload CSS` | 先確認 HTML 為 `max-age=0` / `no-cache` 且回報錯誤的雜湊資源回傳正確的 JS/CSS；用戶端會按 build + path 自動恢復刷新一次，重複告警說明資源仍不可用，需查 Worker 靜態資源請求紀錄。 |
| 端點回傳 502 / 503                   | 檢查生產環境的 `FEEDBACK_WEBHOOK_URL`，再按 `requestId` 查 `feedback_delivery_failed` / `feedback_delivery_unavailable`。 |
| 端點回傳 429                         | 同一來源在 30 分鐘視窗已提交 10 條；按 `Retry-After` 等待，或核對平台限流規則。                       |
| 釘釘簽名錯誤                           | `FEEDBACK_WEBHOOK_SECRET` 是否與機器人加簽金鑰一致。                                                |
| 釘釘關鍵詞錯誤                         | 關鍵詞是否包含 `反馈` 或 `DP大师`。                                                                 |
| 收到企業微信格式或完全無訊息           | `FEEDBACK_WEBHOOK_KIND` 是否漏配為 `dingtalk`。                                                     |

## 維護邊界

- `site/wrangler.jsonc` 是唯一的部署合同，應隨儲存庫維護。
- `wrangler` 由發佈機全域安裝，不在儲存庫鎖版；全域升級後同步更新上文“全域 CLI 基線”表格。
- `site/dist/`、`.env`、`.dev.vars`、CLI 登入快取和平台 token 不入儲存庫。
- 如果更改 Cloudflare Worker 名稱，同步更新 `site/wrangler.jsonc` 的 `name`。
- 如果更改網域，同步更新 `wrangler.jsonc` 的 `routes` 與 `site/src/config/site.ts` 的 `SITE`，再跑 `pnpm verify`。
- 如果修改回饋欄位或回應格式，同步更新本檔案的“回饋介面合同”。
- 如果遷移到釘釘應用機器人，需要把本檔案的“釘釘回饋機器人”和 `site/worker/feedback-core.js` 一起改掉。

## 官方參考

- [Cloudflare Workers Static Assets routing](https://developers.cloudflare.com/workers/static-assets/routing/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare Workers Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Cloudflare Workers TCP sockets (`connect()`)](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/)
- [Cloudflare Workers VPC](https://developers.cloudflare.com/workers-vpc/)
- [釘釘聊天機器人概述](https://open-dingtalk.github.io/developerpedia/docs/learn/bot/overview/)
- [釘釘群自定義機器人](https://open-dingtalk.github.io/developerpedia/docs/learn/bot/webhook/overview/)
- [釘釘應用機器人](https://open-dingtalk.github.io/developerpedia/docs/learn/bot/appbot/overview/)
