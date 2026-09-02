# 2026-09-02 · 装「type-aware 覆盖面」这道门

> **本文是计划，不是完成报告。下面清单一项都还没勾。**
> 测量由 workspace-e2（Claude 会话）于 2026-09-02 16:20–17:00 只读完成，
> **该会话未对本仓做任何写入**（本文件除外）。执行留给接手者。
> 同一形态已在 BetAI（`b0e73af`）与 BetaPass（`990c443`）落地，两份都做过撤掉即红的反证。

## 1. 要挡的是什么

`.oxlintrc.json` 里 `"options": { "typeAware": true }` —— **本仓开着 type-aware**
（不是靠命令行旗标，`lint` 脚本只是 `oxlint --deny-warnings`）。

★★★ oxlint 走查到一个**不在任何 TS 程序里**的文件时，type-aware 那一趟会**整趟静默放弃**：
表现是 **0 条错、stderr 全空、退出码 0** —— 与「全绿」在任何观察点上都一模一样。

BetAI 同日的实收代价：

```
oxlint --type-aware                                    → 444 文件 / 0 错 / 1.5s
oxlint --type-aware --ignore-pattern '.storybook/**'   → 442 文件 / 75 错 / exit 1
```

**少走查两个文件反而多报 75 条错**，且快的那趟压根没启动 tsgolint。
代价是 2026-08-29 → 09-02 **连续 7 次 CI 红而本地一次没红**（Linux 与 Windows 触发条件不同）。

⚠ **本仓 type-aware 目前是活的**（已探针验证，见 §5），**但前提已经大面积成立**。

## 2. 现状测量（2026-09-02 16:50，只读）

```
走查集 392 个文件
程序集 318 个（root 0 + tsconfig.app.json 317 + tsconfig.node.json 1）
程序外 74 个
```

| 组 | 数量 | 说明 |
|---|---|---|
| `scripts/*.mjs` | 53 | 构建 / 生成 / 各类 `*.test.mjs` |
| `tests/browser/*.spec.ts` | 11 | ⚠ Playwright 规格，在 `page.evaluate()` 里用 DOM 全局 |
| `worker/*.js` | 6 | analytics-core · content-negotiation · egress-probe · feedback-core · socket-fetch · webhook-core |
| 根 | 4 | `baseline-targets.ts` · `playwright.config.ts` · `vitest.config.ts` · `worker.js` |

★ 根 `tsconfig.json` 是 solution 式（`files: []` + 两个 `references`），
`tsc --showConfig` **合法地返回空 files** —— 直接照抄 BetAI 那份门会先在
「程序集 > 100」那条自证上红，**而那个红指不出真原因**。

**复现命令**（只读，不写盘）：取 `oxlint --debug=files` 作走查集，
对根与每个 reference 各跑一次 `tsc --showConfig [-p <path>]` 取 `files` 并集，两者求差。

## 3. 计划：加**两个** project，不是一个

⛔ **不要把这 74 个塞进 `tsconfig.node.json`**。它是 `lib: ["ES2023"] / types: ["node"]`，
而 `tests/browser/*.spec.ts` 用 `document` / `getComputedStyle` / `HTMLElement`。

★★★ 这条是 BetaPass 已踩过并写进它 `tsconfig.json` 注释的教训：
**TS 的 `lib` 引用没有目录作用域，「同一次编译」才是唯一边界。**
并进 node 档 → DOM 类型对整档可见；并进 app 档 → `dom` 泄漏进 `src/**`。
⇒ 浏览器测试必须**自成一个 project**。

- [ ] 新增 `site/tsconfig.scripts.json`
      —— `"allowJs": true`、**不开 `checkJs`**（目的是把 `.mjs`/`.js` 收进 Program
      供 oxlint 用，不是让 tsc 检查它们）；`types: ["node"]`；
      include：`scripts` 下的 `.mjs`、`worker` 下的 `.js`、`worker.js`、
      `baseline-targets.ts`、`vitest.config.ts`
- [ ] 新增 `site/tsconfig.browser-tests.json`
      —— include：`tests/browser` 下的 `.ts`、`playwright.config.ts`；`lib` 含 DOM
      ⚠ **这 11 个 `.ts` 会被 tsc 真检查**（不像 `.mjs`），大概率要修几处，
      **这是本次工作量的主要来源**
- [ ] 两者挂进 `site/tsconfig.json` 的 `references`
- [ ] 探针复算：**程序外 = 0**

## 4. 门本身：抄 BetaPass 那份，改三处

源：`../BetaPass/test/lint-type-aware-coverage.test.ts`（该仓 `990c443`）。

- [ ] 移植测试文件（放 `scripts/*.test.mjs` 还是 vitest 那套按本仓惯例定；
      放进前者的话它自己也要进 §3 第一个 project 的 include）
- [ ] 改动一：**不传任何旗标**跑 `oxlint --debug=files`
      —— 本仓靠配置开 type-aware，传旗标会问出一份**不属于 `pnpm lint`** 的清单
- [ ] 改动二：**程序集取并集** —— 读根 `--showConfig` 的 `references`，逐个 `-p` 再并
- [ ] 改动三：★★★ **子项目的 `files` 相对它自己所在目录解析**，不是相对仓根

⚠ 改动三是实收教训：按仓根解析会得到一批不存在的绝对路径，
症状是**程序集数字变大了、差集却一个都没减少** —— 「加了东西却没生效」最难看出来的形态。
（workspace-e2 在 BetaPass 上亲手踩过：程序集 +29、差集纹丝不动。）

## 5. 验收（缺一不可）

- [ ] 探针：程序外 = 0
- [ ] `pnpm verify` 十步全绿
- [ ] **反证**：撤掉 `allowJs` 或任一条 include，门当场红并逐个点名
- [ ] ★★★ **另跑探针法**：临时放一个必然违反 `typescript/no-deprecated` 的文件
      （例：声明一个 `@deprecated` 函数并调用它），确认 `pnpm lint` 当场红，删掉即消失

⚠ 第四条不可省，两个理由：

1. **本判据是充分条件不是必要条件** —— 前提成立时不一定会塌
   （BetAI 逐个跑过四种组合，两活两死）⇒ **门绿 ≠ type-aware 一定在跑**。
2. ★★ **探针必须用本仓真正启用的规则**。本仓 `rules` 里只开了
   `typescript/no-deprecated` 一条 type-aware 规则，另外六条显式 `"off"`
   ⇒ **拿 `no-unsafe-*` 去探它只会得到沉默，而那个沉默什么也不说明**
   （workspace-e2 第一次就是这么探的，差点据此写下「本仓 type-aware 已死」的错结论）。

## 6. ⚠ 三条操作陷阱

**① `pnpm verify` 会写盘，而且写的是别人的在制品。**
`verify` → `build` → 自动触发 `prebuild` → `content:generate --write` 与 `seo:generate --write`
⇒ 重写 `public/llms.txt`、`public/sitemap.xml`、`public/route-summaries.json`、
`src/data/routeLastModified.ts`、`index.html`。
★★★ **「我只是取个基线」不等于「我什么都没动」** —— 前置钩子在命令行上完全看不见。
取基线前先确认这几个文件的归属。

**② 本仓 2026-09-02 下午有并发作业。**
16:49–16:54 之间实测到：一次 `pnpm install`（oxlint 1.79→1.80 的依赖 `oxc-parser@0.148.0`）、
一次构建（`dist/` 423 个文件）、以及 `test-results/.last-run.json` 被写
—— 即**当时另有一条 verify/test:browser 在同一棵树上跑**。开工前先确认没有第二条门在跑。

**③ 注释里不要写 glob 的字面形态。**
`/* */` 块注释里出现**星号加斜杠**会当场闭合注释 ⇒ 整个文件 `PARSE_ERROR`。
★★ 失效形态是测试报 **「no tests」**，而**「no tests」与「测试全过」在 CI 摘要里长得很像**
—— 尤其那个文件是新增的、没人知道它本该有几个用例时。

## 7. 本次没做什么

- ⛔ **未改本仓任何配置或代码**（本文件除外）。`tsconfig` 三份、`.oxlintrc.json` 一字未动。
- 未提交、未推送本仓其它任何改动；工作树上那 7 个文件不是 workspace-e2 的。
- 停手理由：本仓当时有另一个（Codex）agent 在作业，它不在 Claude 的会话清单里
  ⇒ **既发不出消息，也收不到它的「我正在写」**。★ 协调不了的并发，唯一安全的操作是只读。
