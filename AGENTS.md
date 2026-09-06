# AGENTS.md — DP大师

> 继承 [`../AGENTS.md`](../AGENTS.md) 与 [`../Docs/dev_guide.md`](../Docs/dev_guide.md)；勿假定自动加载。

## 项目与权威

- 显示名 **DP大师**；目录 `DpMaster`、仓库 `ShanireZ/DpMaster`、Worker `dpmaster` 是发布标识，勿随显示名/域名改名。
- 唯一发布目标：`site/dist/` → Cloudflare Workers Static Assets → `https://dp.round1.cc`。不得恢复区域站、双域、EdgeOne 或第二发布平台。
- `site/` 是静态 React/Vite 应用，不引入账号、数据库、在线评测后端；构建只产出 `site/dist/`，canonical 自指，无 hreflang。
- `site/src/data/catalog.ts` 统一课程身份、顺序、正文与家族游戏 lazy import，勿另建 registry；正文按课独立分包，游戏也须 lazy-load。
- 题目以 `ExampleCard` / `Exercise` 为准；`site/src/data/problems.ts` 是生成文件，不手改。题目变化跑 `pnpm content:generate`，提交生成物并同步 README/OKF 数量。
- `site/src/lib/publicRoutes.ts` 的 `PUBLIC_PATHS` 是公开 URL、sitemap、预渲染、同 URL Markdown 协商的唯一集合；内部标本、未知路由不得公开。
- 部署与反馈操作读 [`deploy.md`](deploy.md)；Web 合同读 [`docs/web-contracts.md`](docs/web-contracts.md)，Baseline 读 [`docs/web-baseline.md`](docs/web-baseline.md)。核心路由、语料、部署标识变化同步对应文档与测试。

## 命令与验收

从 `site/` 执行；Node 权威 `.node-version`，Node/pnpm 要求及脚本权威 `package.json`。二者全局安装、不经 Corepack，准备见 [`../Init_essential.md`](../Init_essential.md)；不混用 npm/yarn/bun。

| 何时 | 命令与前置 | 能证明什么 / 边界 |
|---|---|---|
| 首次准备或锁文件变化 | `pnpm install --frozen-lockfile`；运行时匹配 | 锁文件可安装；不是质量验收 |
| 页面开发 | `pnpm dev`；依赖已装 | 本地开发服务；不是验收 |
| 脚本、Worker、内容合同变化 | `pnpm test` | Node 脚本测试；不含组件/浏览器 |
| React 组件变化 | `pnpm test:unit` | Vitest 组件/单元测试；不代替实机 |
| 代码诊断 | `pnpm lint` | 零 warning lint；不证明运行行为 |
| 需要产物 | `pnpm build` | 先生成内容/SEO，再类型检查与构建；会写生成物，不是完整 gate |
| 完整本地交付 | `pnpm verify`；依赖和 Playwright 浏览器已准备 | Baseline、内容/SEO、两类单测、lint、构建、HTML、浏览器路由、资产预算；不能证明生产配置或真实 Edge/Safari |

`verify` 的顺序以 `package.json` 为准，CI 在 `site/` 调同一入口。Chromium 跑全量、Firefox/WebKit 跑关键冒烟；浏览器合同为四大引擎当前稳定版及上一主版本，真实 Edge/Safari 发布前人工抽检。报告实际结果、skip、未覆盖项。

`pnpm release` 是唯一完整生产发布入口：verify 后复用产物发布 Worker；会外部写入。GitHub Actions 只做 CI，不保存生产密钥、不部署。全局 `wrangler` 须提前安装登录，版本基线由 `deploy.md` 管理，`pnpm maintenance:check` 读取；升级后同步基线并重跑 verify。

## 数据与边缘合同

- Rocket Loader 关闭，Cloudflare Web Analytics/RUM 开启且只由代理注入；源码、预渲染及 HTML 零手工 beacon。构建/预渲染/CSP/部署合同变化须测试 HTML 数量与零 beacon（`pnpm check:html`）。
- 覆盖 Analytics 响应的 CSP：`script-src` 放行 `https://static.cloudflareinsights.com`，`connect-src` 放行 `'self' https://cloudflareinsights.com`，保留本站所需来源。
- 投递经 `site/worker/socket-fetch.js`：**fetch 优先，仅 52x 或抛错才 socket 降级**；其他 4xx/5xx 不重试。socket 不能直连 Cloudflare IP，不得反转顺序。
- relay 协议及测试保留；`site/worker/feedback-core.js` 也是 relay 主机参考实现，勿因未使用删除。
- `POST /api/_diag/egress` 仅配置 `EGRESS_DIAG_SECRET` 时存在；删除 secret 后仍须重新部署才关闭，secret 按版本绑定。
- 公开页提供 HTML/`text/markdown`，策略见 `site/baseline.config.json`。AI 抓取以边缘为权威：round1.cc 的托管 robots 是 zone 级（含 luogusp.round1.cc），仓内不得对边缘 Disallow 的抓取器写 Allow。HTML 边缘注入移除 ETag，不得为消红关闭注入。

## 视觉与工具链

- Token 唯一权威 [`site/src/styles/tokens.css`](site/src/styles/tokens.css)，改动前读头部 Warm Ink/主题说明；[`docs/design/visual-system.md`](docs/design/visual-system.md) 是导航，冲突服从 CSS 并同步 docs。
- `site/scripts/design-token-contract.test.mjs` 随 `pnpm test` 检查 var 定义、深浅主题颜色覆盖。白名单须说明 CSS 外设置者及复用深色值理由；无来源不豁免。
- 字色 token 须登记并在两个主题实际表面满足 AA 4.5:1。债务数量锁定，不得加债务消红；细节看测试。门不覆盖非 token 的硬编码色。
- `site/scripts/lint-type-aware-coverage.test.mjs` 锁 oxlint 文件集属于各 TS Program；Node 脚本进 `tsconfig.scripts.json`，Playwright 进 `tsconfig.browser-tests.json`。红时补 project，不改 ignorePatterns；lint/tsconfig 改动须用 `typescript/no-deprecated` 临时探针验活。
- Baseline：`runtime: public-web`、`featureTarget: newly`；`site/baseline-targets.ts` 显式冻结 Vite 8 Widely 目标，`widely available with downstream` 仅能力审查，不得让 Vite 自动消费。六字段及 Web 声明只维护在 `site/baseline.config.json`；`pnpm baseline:check` 是 verify 首门。
- 直接依赖用获准稳定主线的 `^`，lockfile 是 CI 精确解析合同。`site/pnpm-workspace.yaml` 强制 24 小时隔离、Node 引擎、构建脚本白名单、依赖状态检查，禁止排除/宽松模式/换包管理器绕过；版本升级独立 task、完整验证、一个 commit。
- 禁废弃 API、CommonJS 兼容层、旧浏览器 polyfill、弃用 CLI、过渡选择器、lint 豁免；无现代替代时停手弹窗。

## 交付与许可

- 一个 task 一个聚焦 commit，提交本地 `main`；agent 不得 push，由 owner 汇总推送。延后 push 不弱化本地 gate。
- 视觉方向、产品规则、兼容策略、发布合同变化须带对比证据弹窗拍板。
- `docs/` 只放长期当前事实（OKF v0.2）；`handoff/` 放任务计划/清单，验证后勾选，完成计划不留 docs。
- README 是公开入口，badge 遵循 [`../badgestd.md`](../badgestd.md)，事实来自 package/catalog/deploy；LICENSE 未声明 only/or-later，文档统一通用 `GPL-3.0`，不得猜 SPDX variant。
- Issue tracker：本仓 GitHub Issues；triage、domain、OKF 沿用 [`docs/agents/index.md`](docs/agents/index.md)。
