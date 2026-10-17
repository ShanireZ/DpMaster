<a id="2026-10-11-chromium-的-navigation-positioning-用例不穩"></a>

# 2026-10-11 · chromium 的 navigation-positioning 案例不穩

> 交接給下一位接手者。本文寫於修復 webkit-smoke 超時（`063893b`）的過程中，**只記錄了現象和線索，還沒有開始修復**。
> 修復、驗證完成後按清單勾選，然後刪除本檔案。

## 1. 現象

`site/tests/browser/navigation-positioning.spec.ts` 跑在 chromium 專案上，本機 Windows、4 個 worker、完整瀏覽器套件。
2026-10-11 共跑了 24 輪，其中兩條**不同的**案例各掛了 1 次，都是 `expect.poll` 等滿 5 秒超時：

| 案例（行號） | 失敗的斷言 | 實際得到的值 |
|---|---|---|
| `mobile outline and ordinary page fragments use the same sticky-header offset`（59） | 第 66 行：點開 `.lesson-outline--mobile` 的 `summary` 後，`links.count()` 應 `> 3` | 一直是 `0` |
| `cross-page navigation resets scroll immediately instead of animating from the old page`（76） | 第 84 行：點 `.type-nav a` 跳到 `/part/a/complete` 後，`scrollY` 應 `<= 1` | 停在 `72` |

- 兩次失敗都發生在 webkit/firefox 冒煙開跑之前，和 `063893b` 的 WebKit 超時改動無關。
- 失敗當時的 trace 沒有保留：那次實驗 worktree 已經刪了。

## 2. 線索（都還沒驗證，不能當結論）

- 第 59 行：`TypePage.tsx` 裡的 `<details className="lesson-outline lesson-outline--mobile">` 沒有受控的 `open`，外面還包著一層 `AnimatedContent`。如果點擊發生在水合完成之前，或者這個子樹之後被重新掛載，`details` 會回到關閉狀態，`getByRole('link')` 也就數到 0。
- 第 76 行：`Shell.tsx` 的 `useLayoutEffect` 在路徑變化時會 `scrollTo({ top: 0, behavior: 'instant' })`，並且用 `focus({ preventScroll: true })`。最後停在 72 px，說明置頂之後還有別的東西又滾了一下，候選是 Suspense 正文晚到之後的佈局變化，或者別處的捲動邏輯。先用 trace 確認 72 px 是誰滾出來的。

## 3. 重現的約束

- `playwright.config.ts` 的連接埠寫死在 4173（strictPort），並且被 `scripts/accessibility-contract.test.mjs:41` 鎖住。主 checkout 可能有別的工作階段正在用它，owner 也會在那裡跑 `pnpm release`。
- 所以要在 DpMaster 外另建 git worktree，只在 worktree 裡臨時改連接埠，並且**絕不提交這個改動**。verify 分兩段跑：瀏覽器門之前的各門用原樣內容，瀏覽器門單獨換連接埠。
- 機器負載大時才容易重現。可以用 `--project=chromium -g "navigation-positioning" --repeat-each=N`，同時並行壓上其他測試，或者直接重複跑完整套件，記下失敗率。

## 4. 清單

- [ ] 重現，記下各案例的失敗率和對應 trace
- [ ] 定位根因，修復方案經 owner 彈出視窗確認（不刪斷言、不加 lint 豁免、不靠單純調大超時消紅）
- [ ] 同樣負載下重複跑穩定通過；`pnpm verify` 全綠
- [ ] 在本機 main 上做一個聚焦的 commit，並刪除本檔案
