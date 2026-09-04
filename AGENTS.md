# AGENTS.md — DP大师

> 继承工作区总规则：[`../AGENTS.md`](../AGENTS.md)。本文件只记录 DP大师 的项目级约束。

## Project identity

- 产品与文档显示名是 **DP大师**。
- 为兼容现有发布链路，保留目录名 `DpMaster`、GitHub 仓库 `ShanireZ/DpMaster`、Cloudflare Worker 名 `dpmaster`，不要把显示名或域名改动机械扩散到这些标识。
- **只有一个发布目标**：`site/dist/` → Cloudflare Workers Static Assets，域名 `https://dp.round1.cc`。★ **不得以任何形式复活区域站、双域或第二个发布平台**（EdgeOne 与 betaoi 双域已于 2026-08 退役）。
- 站点是 `site/` 下的静态 React/Vite 应用，不引入账号、数据库或在线评测后端。
- `pnpm build` 只产出 `site/dist/`。canonical 一律自指，且**不输出任何 hreflang 备选**——单域站点没有语言备选这回事。

## Source of truth

- `site/src/data/catalog.ts` 是 DP 家族、课程顺序、正文懒加载和家族游戏懒加载的权威 Module。
- 题目语料以课程正文中的 `ExampleCard` / `Exercise` 为准。
- `site/src/data/problems.ts` 是生成文件；不要手改。课程题目变化后运行 `pnpm content:generate`。
- `site/src/lib/publicRoutes.ts` 的 `PUBLIC_PATHS` 是公开 URL、sitemap、预渲染和同 URL Markdown 内容协商的唯一集合权威；内部标本与未知路由不得进入公开表示。
- 部署与反馈操作以根目录 `deploy.md` 为准；长期工程知识维护在 `docs/` OKF 文档包。

## Cloudflare Web Analytics / RUM contract

- Rocket Loader 保持关闭，Web Analytics / RUM 保持开启，且**只使用 Cloudflare 代理自动注入**。源码、预渲染产物和任何 HTML 都不得出现手工 beacon —— 多一份就是同一次浏览重复统计。`pnpm check:html` 是这条的门禁。
- 任何覆盖 Analytics 页面响应的 CSP 都必须在 `script-src` 放行 `https://static.cloudflareinsights.com`，并在 `connect-src` 放行 `'self' https://cloudflareinsights.com`，同时保留站点自身需要的来源。
- 构建、预渲染、CSP 或部署合同变化时，必须由测试锁住「HTML 数量正确」与「零手工 beacon」这两条。

## Design system

- **Token 权威是 [`site/src/styles/tokens.css`](./site/src/styles/tokens.css) 本身**；方向（Warm Ink）与主题机制写在该文件头部注释，改它之前先读那段。[`docs/design/visual-system.md`](./docs/design/visual-system.md) 是 OKF 导航层**不是权威** —— 冲突以 tokens.css 为准，并把 docs 那一处一并改掉。
- ★ **判据是 [`site/scripts/design-token-contract.test.mjs`](./site/scripts/design-token-contract.test.mjs)**（在 `pnpm test` 里）：锁「每处 `var(--x)` 都有定义」与「深色有的颜色 token 浅色也要有」，各带一条反证。⚠ **白名单每条必须写清谁在 CSS 之外设置它** —— 写不出来的不是豁免，是缺陷。浅色豁免名单**当前为空**，加一条就得说明凭什么复用深色值。
- ★★ **对比度也归这道门**：做 `color:` 的 token 必须登记，按 AA 4.5:1 对它**实际落地的表面**（`--viz-cell-2` 不算，那上面的文字是 `--text-1`）在**两个主题**下核算；新增文字色不登记就红。★ **债务清单当前为空且数量钉死** —— 想登记一条来消红会被另一条断言拦住，只能把颜色改够、或让它不再做字色（`--viz-settled` 走的是后一条）。
- ⚠ 仍不判**不走 token 的硬编码色值**。
- 改变视觉方向属于「必须带对比证据弹窗确认」那一类（见下面 Change rules），**不得静默代替 owner 拍板**。

## Commands

所有包管理命令从 `site/` 执行。运行时基线以 `site/.node-version` 与 `site/package.json` 为准（`site/pnpm-workspace.yaml` 强制 Node 引擎，版本不符即红）。Node 与 pnpm **都是全局安装、不经 Corepack**，见 [`../Init_essential.md`](../Init_essential.md)。不得混用 npm、yarn 或 bun。

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm lint
pnpm build
pnpm verify
```

`pnpm verify` 是完整本地 gate（内容/SEO 一致性、测试、零 warning lint、构建、HTML 产物合同、Playwright 路由检查、资产预算）。

`pnpm release` 是唯一完整生产发布入口：先通过 `pnpm verify` 并复用该次构建产物，再发布 Cloudflare Worker。GitHub Actions 只运行 CI，不保存生产密钥，也不部署。

发布 CLI `wrangler` 由发布机**全局安装并提前登录**，不在 `package.json` 锁版；准备与版本基线以根目录 `deploy.md` 为准（`pnpm maintenance:check` 读它）。★ 全局升级 CLI 后必须同步该基线表并重跑 `pnpm verify`。

## Outbound delivery

- Cloudflare 反代出口（`fetch()`）到钉钉的 TLS 被系统性打断，稳定 525；而 `connect()`（`cloudflare:sockets`）的出口前缀不在 CF 公开 IP 段内，实测可直达。投递因此走 `site/worker/socket-fetch.js`。
- ★ **投递顺序必须是「fetch 优先，52x 或抛错才降级到 socket」，不得反过来。** `connect()` 被禁止连 Cloudflare 自己的 IP 段，socket 优先会打死所有托管在 CF 后面的 webhook（Discord / Slack）。普通 4xx/5xx 是对端应用层的回复，不重试。这三条都有测试锁着。
- relay 协议（`FEEDBACK_RELAY_URL` + `x-dp-relay-secret` / `x-dp-client-ip` / `x-dp-relay-kind`）保留且有测试覆盖，`site/worker/feedback-core.js` 同时是 relay 主机侧的参考实现。当前用不上，但不要因为“暂时没用上”就删掉它。
- `POST /api/_diag/egress` 是出口探针，只在配了 `EGRESS_DIAG_SECRET` 时存在。★ 删除 secret 后必须**重新部署**才真正关闭 —— secret 是按版本绑定的。

## Toolchain and compatibility

- ★ `site/scripts/lint-type-aware-coverage.test.mjs` 锁 oxlint 走查集 ⊆ 根 solution 的 Program 并集。Node 脚本进 `tsconfig.scripts.json`（`allowJs` + `noCheck`、无 DOM），Playwright 进 `tsconfig.browser-tests.json`（含 DOM、真检查）。红时补 project，禁止改 `ignorePatterns`；改 lint/tsconfig 后须用 `typescript/no-deprecated` 临时探针验活。
- Web Platform Baseline：`runtime: public-web`、`featureTarget: newly`；生产构建由 `site/baseline-targets.ts` 显式冻结为 Vite 8 的 Widely 目标，`baseline widely available with downstream` 只用于能力审查，不会被误写成 Vite 自动消费的构建配置。
- `pnpm baseline:check` 校验四大桌面引擎、iOS 与 downstream、批准版本快照及 `vite.config.ts build.target` 接线；它是 `pnpm verify` 的第一道门。Baseline 六字段以及 Modern Web Guidance、sitemap、Markdown 内容协商的当前声明统一维护在 `site/baseline.config.json`。
- 已批准公开页面同时提供 HTML 与 `text/markdown` 表示，策略 `search=yes, ai-train=no, ai-input=yes`。★ **AI 抓取策略的权威是边缘**：round1.cc 开着 Cloudflare 托管 robots.txt（**zone 级**，`luogusp.round1.cc` 同受影响），仓内声明必须与它同向 —— `robots.txt` 不得对被它 `Disallow` 的抓取器写 `Allow`。Worker 必须按 `Accept` 协商、合并 `Vary: Accept`、隔离表示 ETag/缓存键并隐藏 `/_representations/`；HTML 边缘注入会移除 ETag，不得为消红关闭注入。
- 直接依赖用当前获准主线的 `^` 范围，`pnpm-lock.yaml` 是 CI 的精确解析合同。`site/pnpm-workspace.yaml` 强制 24 小时发布隔离、Node 引擎、构建脚本白名单与依赖状态检查——**不得通过排除项、宽松模式或换包管理器绕过**。
- TypeScript、React、Vite、Oxlint、Vitest、Playwright 和其余依赖保持当前稳定主线。版本升级作为独立 task，经完整验证后形成一个 commit。
- 禁止废弃 API、CommonJS 兼容层、旧浏览器 polyfill、已弃用 CLI、过渡选择器与 lint 豁免。没有现代替代方案时停手弹窗，不要将就。
- 浏览器合同：Chrome/Edge/Firefox/Safari 当前稳定版与上一主版本。CI 里 Chromium 跑全量、Firefox/WebKit 跑关键冒烟，真实 Edge/Safari 靠发布前人工抽检。

## Task and documentation governance

- 一个 task 一个聚焦 commit，提交到本地 `main`；**agent 不得 `git push`**，由 owner 汇总后一次 push，让 GitHub Actions 只为最终 SHA 跑一轮。延后 push 不得弱化本地门禁。
- 改变视觉方向、产品规则、兼容策略或发布合同的选择，必须带对比证据弹窗确认，不得静默代替用户拍板。
- `docs/` 只放长期当前事实（OKF v0.2），不放临时进度或已完成计划；`handoff/` 放当前任务计划与勾选清单。清单项只能在对应工作通过验证后改 `[x]`。

## Public README & license

- 根目录 `README.md` 是公开入口；badge 必须遵循 [`../badgestd.md`](../badgestd.md)，并从 `site/package.json`、`site/src/data/catalog.ts` 和 `deploy.md` 的当前事实取值。
- `LICENSE` 提供 GNU GPL v3 正文，但没有机器可读的 `only` / `or-later` 声明；README、badge 和新增文档统一使用通用 `GPL-3.0`，不要猜测具体 SPDX variant。
- README 的 `lessons` 数量来自 catalog；课程变更后先运行 `pnpm content:generate`，再同步 README/OKF 文档中的数量与状态。

## Change rules

- 新增或调整课程时只在 `catalog.ts` 登记课程身份与 lazy import，不要重新创建平行 registry。
- 正文题目变化后提交同步生成的 `problems.ts`，并更新涉及数量的 README/OKF 文档。
- 保持课程正文按课程独立分包；家族游戏也必须 lazy-load。
- 核心路由、内容语料、部署标识变化时同步更新对应文档和测试。

## Agent skills

- **Issue tracker：本仓 GitHub Issues。**
- triage 标签、domain 文档布局、OKF 文档系统沿用工作区约定：[`docs/agents/index.md`](docs/agents/index.md)。
- 进入工作区后必须读取根 [`../Docs/dev_guide.md`](../Docs/dev_guide.md) 的环节守则、完成判据与技能对照；Claude 由根 `CLAUDE.md` 显式导入，其他运行时不得假定自动加载。
