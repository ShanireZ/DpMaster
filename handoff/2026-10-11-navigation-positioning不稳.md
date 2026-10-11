# 2026-10-11 · chromium 的 navigation-positioning 用例不稳

> 交接给下一位接手者。本文写于修复 webkit-smoke 超时（`063893b`）的过程中，**只记录了现象和线索，还没有开始修复**。
> 修复、验证完成后按清单勾选，然后删除本文件。

## 1. 现象

`site/tests/browser/navigation-positioning.spec.ts` 跑在 chromium 项目上，本地 Windows、4 个 worker、完整浏览器套件。
2026-10-11 共跑了 24 轮，其中两条**不同的**用例各挂了 1 次，都是 `expect.poll` 等满 5 秒超时：

| 用例（行号） | 失败的断言 | 实际得到的值 |
|---|---|---|
| `mobile outline and ordinary page fragments use the same sticky-header offset`（59） | 第 66 行：点开 `.lesson-outline--mobile` 的 `summary` 后，`links.count()` 应 `> 3` | 一直是 `0` |
| `cross-page navigation resets scroll immediately instead of animating from the old page`（76） | 第 84 行：点 `.type-nav a` 跳到 `/part/a/complete` 后，`scrollY` 应 `<= 1` | 停在 `72` |

- 两次失败都发生在 webkit/firefox 冒烟开跑之前，和 `063893b` 的 WebKit 超时改动无关。
- 失败当时的 trace 没有保留：那次实验 worktree 已经删了。

## 2. 线索（都还没验证，不能当结论）

- 第 59 行：`TypePage.tsx` 里的 `<details className="lesson-outline lesson-outline--mobile">` 没有受控的 `open`，外面还包着一层 `AnimatedContent`。如果点击发生在水合完成之前，或者这个子树之后被重新挂载，`details` 会回到关闭状态，`getByRole('link')` 也就数到 0。
- 第 76 行：`Shell.tsx` 的 `useLayoutEffect` 在路径变化时会 `scrollTo({ top: 0, behavior: 'instant' })`，并且用 `focus({ preventScroll: true })`。最后停在 72 px，说明置顶之后还有别的东西又滚了一下，候选是 Suspense 正文晚到之后的布局变化，或者别处的滚动逻辑。先用 trace 确认 72 px 是谁滚出来的。

## 3. 复现的约束

- `playwright.config.ts` 的端口写死在 4173（strictPort），并且被 `scripts/accessibility-contract.test.mjs:41` 锁住。主 checkout 可能有别的会话正在用它，owner 也会在那里跑 `pnpm release`。
- 所以要在 DpMaster 外另建 git worktree，只在 worktree 里临时改端口，并且**绝不提交这个改动**。verify 分两段跑：浏览器门之前的各门用原样内容，浏览器门单独换端口。
- 机器负载大时才容易复现。可以用 `--project=chromium -g "navigation-positioning" --repeat-each=N`，同时并行压上其他测试，或者直接重复跑完整套件，记下失败率。

## 4. 清单

- [ ] 复现，记下各用例的失败率和对应 trace
- [ ] 定位根因，修复方案经 owner 弹窗确认（不删断言、不加 lint 豁免、不靠单纯调大超时消红）
- [ ] 同样负载下重复跑稳定通过；`pnpm verify` 全绿
- [ ] 在本地 main 上做一个聚焦的 commit，并删除本文件
