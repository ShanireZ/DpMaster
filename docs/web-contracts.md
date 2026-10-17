---
type: contract
title: Sitemap / 同 URL Markdown 協商 / Accept 判據（工作區唯一權威）
description: 三塊跨專案通用的公共 HTTP 契約，dp.round1.cc 線上正按它們執行。
tags: [sitemap, markdown, content-negotiation, accept, contract]
status: stable
---

# Sitemap · 同 URL Markdown 協商 · Accept 判據

> ⛔ **本檔案正文不得出現相對連結**（外部 URL 可以）：它會被逐位元組複製到各專案 `docs/` 的不同深度。
>
> ★★★ **本檔案是唯一權威**，與 `web-baseline.md` 同一套 hash 門：
> 啟用這三塊的專案在自己的 `docs/` 下持完整副本並釘住本檔案的 sha256，不一致即紅。
>
> `dp.round1.cc` 線上按本檔案的三項契約執行。
> DpMaster 退出門的上線預檢驗收依據已內聯進 [`ShanireZ/DpMaster#6`](https://github.com/ShanireZ/DpMaster/issues/6)。

## 1. Sitemap 契約

啟用專案必須滿足：

- 根路徑固定為 `/sitemap.xml`。
- UTF-8 XML，使用 sitemap 協定命名空間。
- 只包含同一 canonical host 下的 HTTPS URL。
- 每個 URL 必須直接回傳 200、允許索引、無重定向、無 query、無 fragment。
- 不包含登入、工作階段、管理、token、驗證、錯誤、搜尋結果或個人化 URL。
- URL 來自一個專案內唯一路線/內容權威，不維護第二份手寫列表。
- 按 canonical URL 穩定排序。
- 只有真實、可證明的正文更新時間才能生成 `lastmod`。
- 不使用建置時間偽造 `lastmod`。
- 不生成無依據的 `changefreq` 或 `priority`。
- URL 集為空時 `/sitemap.xml` 回傳 404 或不存在，`robots.txt` 不聲明它；禁止發佈空 `<urlset>`。
- `robots.txt` 的最終線上版本由 Cloudflare 管理，專案倉保存期望契約和可驗證源資料。
- Sitemap 協定與 Google 的提交規範以 [sitemaps.org](https://www.sitemaps.org/protocol.html) 和 [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) 為準。

## 2. 同 URL Markdown 內容協商

只對登記的公開內容頁面啟用，不新增 `.md` URL。

#### 請求選擇規則

對每個可協商頁面分別計算 `text/html` 與 `text/markdown` 的有效匹配：

1. 先按 media range 的有效 q 值。
2. q 值相同時，更具體的 media range 優先。
3. 仍相同時 HTML 優先，保持現有瀏覽器相容。
4. 缺失 `Accept`、僅有 `text/*` 或 `*/*` 時預設 HTML。
5. `q=0` 明確排除該表示。
6. 無效成員忽略；沒有任何有效且可接受的表示時回傳 406。
7. 只在已登記頁面上執行該邏輯；API、靜態資源、未知路由和 N/A 專案保持原行為。

該行為遵循 [RFC 9110 內容協商語義](https://www.rfc-editor.org/info/rfc9110)。Markdown media type 採用 [RFC 7763](https://www.rfc-editor.org/info/rfc7763/) 註冊的 `text/markdown`。

#### 回應契約

Markdown 回應：

```http
Content-Type: text/markdown; charset=utf-8
Content-Language: zh-CN
Content-Signal: <该项目已批准的公开内容策略>
Vary: Accept
X-Content-Type-Options: nosniff
```

HTML 與 Markdown 均須：

- 合併而不是覆蓋已有 `Vary`，大小寫不敏感去重 `Accept`。
- 使用表示專屬 ETag，避免 HTML 和 Markdown 共享驗證器。
- 使用隔離的 CDN/Worker 快取鍵。
- Markdown 的快取範圍和壽命不得比對應 HTML 更寬。
- HTML 回應聲明同 URL、`type="text/markdown"` 的 alternate。
- Markdown 回應聲明 canonical 以及同 URL、`type="text/html"` 的 alternate。
- `HEAD` 與相應 `GET` 狀態碼、協商選擇及回應頭一致，但不回傳正文。
- 條件請求只命中相同表示的 ETag。
- Content-Signal 只表達對**已批准公開內容**的使用授權，不替代認證、授權或 noindex。具體取值由各專案自己的權威聲明，**本檔案不規定**。
- ★ Content-Signal 必須與該域邊緣**實際下發**的 `robots.txt` 同向 —— 包括 CDN 託管塊注入的 `Content-Signal` 與爬蟲 `Disallow`。回應頭與 `robots.txt` 各說各話，就是對外發出互相矛盾的聲明，而**兩邊都不會因此變紅**：倉內判據看不見邊緣注入，邊緣也不讀倉內聲明。同一個 user-agent 同時落進「託管塊 Disallow」與「倉內 Allow」兩個組時，各家抓取器的合併與優先級實作並不一致，靠「後面的 Allow 覆蓋前面的 Disallow」不可靠。

專案主動生成的 Markdown 是權威實作。Cloudflare Markdown for Agents 只允許作為經批准的可關閉加速器，不能成為唯一內容源；其能力和 Content-Signal 語義參考 [Cloudflare 官方說明](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)。

#### Markdown 內容規則

- 與 HTML 使用同一內容模型或同一次本機語義建置輸出。
- 禁止遠程抓取線上 HTML 再轉換。
- 禁止維護第二份手寫正文。
- 保留標題層級、段落、列表、表格、程式碼、公式、圖片替代文字及公共連結。
- 去掉指令碼、樣式、導覽噪音、純裝飾、隱藏節點、表單控制項、驗證碼和個人化狀態。
- 互動演示轉換為靜態說明、關鍵結論和原頁面 canonical 連結。
- 不包含認證頁面、使用者資料、課程私有內容、管理功能、token URL、錯誤頁或偵錯資訊。
- 不強制新增 `llms.txt`；DpMaster 現有 `llms.txt` 保留並消除與新訓練政策衝突的說明。

## 3. Accept 判據與測試向量

至少覆蓋：

| Accept | 預期 |
|---|---|
| 缺失 | HTML 200 |
| `text/html` | HTML 200 |
| `text/markdown` | Markdown 200 |
| `text/markdown, */*;q=0.5` | Markdown 200 |
| `text/html;q=1, text/markdown;q=0.8` | HTML 200 |
| `text/html;q=0, text/markdown;q=1` | Markdown 200 |
| `text/*` | HTML 200 |
| `*/*` | HTML 200 |
| `text/html;q=0, text/markdown;q=0` | 406 |
| `application/json` | 406 |
| `text/markdown;q=0, */*;q=1` | HTML 200 |
| 非法成員 + 有效 HTML | 忽略非法成員，回傳 HTML |
| 僅非法且無有效範圍 | 406 |

每個向量同時測試 GET、HEAD 和條件請求。

## 4. Sitemap 測試

- XML schema/namespace。
- UTF-8 與轉義。
- URL 去重和穩定排序。
- canonical host、HTTPS、無 query/fragment。
- 路線註冊表、prerender、Markdown 和 sitemap 集合一致。
- 每個 URL 線上 200 且無重定向。
- noindex 與 sitemap 互斥。
- 空集合時 404 且 robots 無聲明。
- 正文摘要變化與真實 `lastmod` 聯動。
- `.cc`、token 和內部表示路徑永不出現。

## 5. Markdown 內容測試

- 標題、摘要、主要正文與 HTML 同源。
- 標題層級合法。
- 程式碼圍欄、表格、數學公式和連結可讀。
- 互動元件有靜態說明和 canonical 連結。
- 不含 `<script>`、樣式、事件處理器、表單值、驗證碼、使用者資料或內部路徑。
- 所有公共連結可解析。
- 輸出確定性：相同源資料連續建置位元組一致。
- HTML 正文改變但 Markdown 未變時 CI 失敗，反之亦然。
