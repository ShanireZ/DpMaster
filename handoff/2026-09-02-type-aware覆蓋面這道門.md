# 2026-09-02 · 裝「type-aware 覆蓋面」這道門

> **本文原為計畫，已於 2026-09-04 執行並完成驗收；清單按新鮮證據勾選。**
> 測量由 workspace-e2（Claude 工作階段）於 2026-09-02 16:20–17:00 唯讀完成，
> **該工作階段未對本儲存庫做任何寫入**（本檔案除外）。執行留給接手者。
> 同一形態已在 BetAI（`b0e73af`）與 BetaPass（`990c443`）完成實作，兩份都做過撤掉即紅的反證。

## 1. 要擋的是什麼

`.oxlintrc.json` 裡 `"options": { "typeAware": true }` —— **本儲存庫開著 type-aware**
（不是靠命令列旗標，`lint` 指令碼只是 `oxlint --deny-warnings`）。

★★★ oxlint 走查到一個**不在任何 TS 處理程序裡**的檔案時，type-aware 那一趟會**整趟靜默放棄**：
表現是 **0 條錯、stderr 全空、結束代碼 0** —— 與「全綠」在任何觀察點上都一模一樣。

BetAI 同日的實收代價：

```
oxlint --type-aware                                    → 444 文件 / 0 错 / 1.5s
oxlint --type-aware --ignore-pattern '.storybook/**'   → 442 文件 / 75 错 / exit 1
```

**少走查兩個檔案反而多報 75 條錯**，且快的那趟壓根沒啟動 tsgolint。
代價是 2026-08-29 → 09-02 **連續 7 次 CI 紅而本機一次沒紅**（Linux 與 Windows 觸發條件不同）。

⚠ **本儲存庫 type-aware 目前是活的**（已探針驗證，見 §5），**但前提已經大面積成立**。

## 2. 現狀測量（2026-09-02 16:50，唯讀）

```
走查集 392 个文件
程序集 318 个（root 0 + tsconfig.app.json 317 + tsconfig.node.json 1）
程序外 74 个
```

| 組 | 數量 | 說明 |
|---|---|---|
| `scripts/*.mjs` | 53 | 建置 / 生成 / 各類 `*.test.mjs` |
| `tests/browser/*.spec.ts` | 11 | ⚠ Playwright 規格，在 `page.evaluate()` 裡用 DOM 全域 |
| `worker/*.js` | 6 | analytics-core · content-negotiation · egress-probe · feedback-core · socket-fetch · webhook-core |
| 根 | 4 | `baseline-targets.ts` · `playwright.config.ts` · `vitest.config.ts` · `worker.js` |

★ 根 `tsconfig.json` 是 solution 式（`files: []` + 兩個 `references`），
`tsc --showConfig` **合法地回傳空 files** —— 直接照抄 BetAI 那份門會先在
「處理程序集 > 100」那條自證上紅，**而那個紅指不出真原因**。

**重現命令**（唯讀，不寫盤）：取 `oxlint --debug=files` 作走查集，
對根與每個 reference 各跑一次 `tsc --showConfig [-p <path>]` 取 `files` 並集，兩者求差。

## 3. 計畫：加**兩個** project，不是一個

⛔ **不要把這 74 個塞進 `tsconfig.node.json`**。它是 `lib: ["ES2023"] / types: ["node"]`，
而 `tests/browser/*.spec.ts` 用 `document` / `getComputedStyle` / `HTMLElement`。

★★★ 這條是 BetaPass 已踩過並寫進它 `tsconfig.json` 註解的教訓：
**TS 的 `lib` 引用沒有目錄作用域，「同一次編譯」才是唯一邊界。**
並進 node 檔 → DOM 類型對整檔可見；並進 app 檔 → `dom` 洩漏進 `src/**`。
⇒ 瀏覽器測試必須**自成一個 project**。

- [x] 新增 `site/tsconfig.scripts.json`
      —— `"allowJs": true`、**不開 `checkJs`**（目的是把 `.mjs`/`.js` 收進 Program
      供 oxlint 用，不是讓 tsc 檢查它們）；`types: ["node"]`；
      include：`scripts` 下的 `.mjs`、`worker` 下的 `.js`、`worker.js`、
      `baseline-targets.ts`、`vitest.config.ts`
- [x] 新增 `site/tsconfig.browser-tests.json`
      —— include：`tests/browser` 下的 `.ts`、`playwright.config.ts`；`lib` 含 DOM
      ⚠ **這 11 個 `.ts` 會被 tsc 真檢查**（不像 `.mjs`），大概率要修幾處，
      **這是本次工作量的主要來源**
- [x] 兩者掛進 `site/tsconfig.json` 的 `references`
- [x] 探針復算：**處理程序外 = 0**

## 4. 門本身：抄 BetaPass 那份，改三處

源：`../BetaPass/test/lint-type-aware-coverage.test.ts`（該倉 `990c443`）。

- [x] 移植測試檔案（放 `scripts/*.test.mjs` 還是 vitest 那套按本儲存庫慣例定；
      放進前者的話它自己也要進 §3 第一個 project 的 include）
- [x] 改動一：**不傳任何旗標**跑 `oxlint --debug=files`
      —— 本儲存庫靠設定開 type-aware，傳旗標會問出一份**不屬於 `pnpm lint`** 的清單
- [x] 改動二：**處理程序集取並集** —— 讀根 `--showConfig` 的 `references`，逐個 `-p` 再並
- [x] 改動三：★★★ **子專案的 `files` 相對它自己所在目錄解析**，不是相對倉根

⚠ 改動三是實收教訓：按倉根解析會得到一批不存在的絕對路徑，
症狀是**處理程序集數字變大了、差集卻一個都沒減少** —— 「加了東西卻沒生效」最難看出來的形態。
（workspace-e2 在 BetaPass 上親手踩過：處理程序集 +29、差集紋絲不動。）

## 5. 驗收（缺一不可）

- [x] 探針：處理程序外 = 0
- [x] `pnpm verify` 十步全綠
- [x] **反證**：撤掉 `allowJs` 或任一條 include，門當場紅並逐個點名
- [x] ★★★ **另跑探針法**：臨時放一個必然違反 `typescript/no-deprecated` 的檔案
      （例：宣告一個 `@deprecated` 函式並呼叫它），確認 `pnpm lint` 當場紅，刪掉即消失

⚠ 第四條不可省，兩個理由：

1. **本判據是充分條件不是必要條件** —— 前提成立時不一定會塌
   （BetAI 逐個跑過四種組合，兩活兩死）⇒ **門綠 ≠ type-aware 一定在跑**。
2. ★★ **探針必須用本儲存庫真正啟用的規則**。本儲存庫 `rules` 裡只開了
   `typescript/no-deprecated` 一條 type-aware 規則，另外六條顯式 `"off"`
   ⇒ **拿 `no-unsafe-*` 去探它只會得到沉默，而那個沉默什麼也不說明**
   （workspace-e2 第一次就是這麼探的，差點據此寫下「本儲存庫 type-aware 已死」的錯結論）。

## 6. ⚠ 三條操作陷阱

**① `pnpm verify` 會寫盤，而且寫的是別人的在製品。**
`verify` → `build` → 自動觸發 `prebuild` → `content:generate --write` 與 `seo:generate --write`
⇒ 重寫 `public/llms.txt`、`public/sitemap.xml`、`public/route-summaries.json`、
`src/data/routeLastModified.ts`、`index.html`。
★★★ **「我只是取個基線」不等於「我什麼都沒動」** —— 前置鉤子在命令列上完全看不見。
取基線前先確認這幾個檔案的歸屬。

**② 本儲存庫 2026-09-02 下午有並行作業。**
16:49–16:54 之間實測到：一次 `pnpm install`（oxlint 1.79→1.80 的相依 `oxc-parser@0.148.0`）、
一次建置（`dist/` 423 個檔案）、以及 `test-results/.last-run.json` 被寫
—— 即**當時另有一條 verify/test:browser 在同一棵樹上跑**。開工前先確認沒有第二條門在跑。

**③ 註解裡不要寫 glob 的字面形態。**
`/* */` 塊註解裡出現**星號加斜槓**會當場閉合註解 ⇒ 整個檔案 `PARSE_ERROR`。
★★ 失效形態是測試報 **「no tests」**，而**「no tests」與「測試全過」在 CI 摘要裡長得很像**
—— 尤其那個檔案是新增的、沒人知道它本該有幾個案例時。

## 7. 2026-09-02 測量工作階段沒做什麼

- ⛔ **未改本儲存庫任何設定或程式碼**（本檔案除外）。`tsconfig` 三份、`.oxlintrc.json` 一字未動。
- 未提交、未推送本儲存庫其它任何改動；工作樹上那 7 個檔案不是 workspace-e2 的。
- 停手理由：本儲存庫當時有另一個（Codex）agent 在作業，它不在 Claude 的工作階段清單裡
  ⇒ **既發不出訊息，也收不到它的「我正在寫」**。★ 協調不了的並行，唯一安全的操作是只讀。

## 8. 2026-09-04 執行證據與後續邊界

- 覆蓋門落在 `site/scripts/lint-type-aware-coverage.test.mjs`；最終探針為
  `walked=394, program=394, outside=0`。
- `tsconfig.scripts.json` 額外使用 TypeScript 的 `noCheck`：這份 project 只負責為
  oxlint 建 Program、由 tsc 守關鍵解析錯誤，不因指令碼匯入課程 catalog 而把 DOM/JSX
  環境反向引進 Node 檔；其中兩個 TS 設定根仍由 `tsconfig.node.json` 真檢查。
  實際 type-aware 活性由下一條反證獨立證明。
- 瀏覽器 project 真檢查出 `tests/browser/web-vitals.spec.ts` 的 layout-shift 記錄形狀
  少宣告 `at` / `spacers` / `scrollY`，已補為完整 `ShiftRecord`，未改變執行環境行為。
- 臨時移除 `worker.js` include 後，門報告
  `walked=394, program=393, outside=1` 並逐名指出 `site/worker.js`；恢復後重新全綠。
- 在 `src/` 與 `scripts/` 各放一個臨時 `@deprecated` 呼叫時，真正的 `pnpm lint`
  同時報出兩條 `typescript(no-deprecated)` 並退出 1；刪除探針後 lint 恢復退出 0。
- 使用儲存庫鎖定的 Node 26.7.0 與 pnpm 12.0.0-rc.6，沙箱外完整執行 `pnpm verify`：
  Node 341/341（0 skip）、Vitest 65/65、Playwright 56/56，餘下建置/HTML/資產門均通過。
  沙箱內 Firefox/WebKit 無法建立子處理程序，瀏覽器紀錄確認發生在執行站台程式碼之前；
  同一命令移出受限處理程序環境後通過。
- 本 task 未執行 commit、push、部署、Cloudflare 或搜尋平台寫入。後續外部退出與 wave 2
  仍回到 GitHub issue #6；執行前須以當前 `main` 合同複核其帶日期的舊描述。
