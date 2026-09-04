# DP大师部署指南

本文面向需要把 DP大师发布到线上、配置站内反馈机器人、或排查部署问题的维护者。所有命令默认在 `site` 目录下执行。

DP大师是一个 React + Vite 预渲染静态站。**生产只有一个发布目标**：把 `site/dist/` 发布到 Cloudflare Workers Static Assets，入口是 `site/worker.js`，域名是 `https://dp.round1.cc`。

产物包含 47 个预渲染公开路由及其同 URL Markdown 表示、React 水合、自指 canonical、sitemap/robots/llms.txt 与 JSON-LD。单域站点不发布任何 hreflang 备选。站内反馈走同源 `POST /api/feedback`；有限的页面与反馈统计事件走同源 `POST /api/analytics`。

> **2026-08 迁移**：此前的国内 EdgeOne 站 `dp.betaoi.cn` 与国际站 `dp.betaoi.cc` 已一并退役，仓库里不再保留任何相关配置、脚本或产物目录。旧域名不做 301 跳转（owner 决定），已收录页面会自然掉索引。★ 退役同时带走了「浏览器跨域直连国内站 → 国内站转发进钉钉」这条反馈/告警链路，替代方案尚未确定，见下文「反馈与告警送达」。

## 一页流程

```bash
# pnpm 由全局独立安装，见 ../Init_essential.md（本机不装 corepack）
pnpm install --frozen-lockfile
pnpm release
```

发布工具链（`wrangler`、`gh`、`cnb`）由发布机全局安装并登录，见“全局 CLI 准备”；新机器先完成该节再跑上面的流程。

`pnpm release` 是唯一完整发布入口：先执行完整 `pnpm verify`，复用该次构建产物，再发布 Cloudflare Worker。

如果需要跳过 `release` 直接部署，必须先自行完成完整验证：

```bash
pnpm verify
pnpm deploy:cf
```

## 全局 CLI 准备

发布 CLI 全部**系统全局安装、提前登录**，不在各项目内重复安装，升级也只在全局做一次。新机器或新维护者首次接手时，按顺序执行：

```bash
# 1. 安装（Windows 默认 shell；gh 也可用 winget install --id GitHub.cli）
pnpm add -g wrangler @cnbcool/cnb-cli
winget install --id GitHub.cli   # 已装则跳过

# 2. 登录（均为一次性 OAuth，凭证缓存在用户目录，各项目共用）
wrangler login
cnb login
gh auth login
```

验证：

```bash
wrangler --version && wrangler whoami
git -C .. ls-remote --heads cnb refs/heads/main
gh auth status
```

`cnb status` 未登录也可能返回成功，因此不作为 Git 凭据判据；上面的 `ls-remote` 会从带 `cnb` remote 的仓库上下文走已配置的 credential helper。

> **cnb 只保留 pnpm 全局安装这一条渠道。** 不要再安装 `~/.cnb/bin/cnb.exe` 原生副本；两份并存会被 PATH 静默遮蔽，且行为不同。工作区 Git credential helper 使用 PATH 形式的 `!cnb git-credential`，完整验证方法见根 `AGENTS.md` 与 `../Init_essential.md` §4.3。

全局 CLI 升级：

```bash
pnpm add -g wrangler @cnbcool/cnb-cli  # gh 用 winget upgrade --id GitHub.cli
```

升级后把下方“全局 CLI 基线”表中的版本号同步为实际安装版本，并在本仓库跑一次 `pnpm verify` 确认部署链路不受影响。

### 全局 CLI 基线

本表是机器可读的当前基线声明，`site/scripts/check-toolchain-drift.mjs` 每周巡检会读取并与 npm 最新稳定版比对。全局升级后必须同步更新本表数字：

| CLI | 当前基线 |
| --- | --- |
| wrangler | 4.128.0 |

## 部署前准备

需要准备：

- Node.js 26.8.1 与 pnpm 12.3.1，均为**全局安装**（见 [`../Init_essential.md`](../Init_essential.md)）。仓库使用 `pnpm-lock.yaml` 锁版，版本权威是 `site/.node-version`、`site/package.json` 和 `site/pnpm-workspace.yaml`。
- 已完成“全局 CLI 准备”：`wrangler`、`gh`、`cnb` 全局安装并登录。
- Cloudflare 账号，已允许 Wrangler 发布 Workers，且 `round1.cc` zone 在该账号下。
- 如果需要站内反馈，先读完“反馈与告警送达”一节——当前这条链路是断的。

不要把以下内容写入仓库：

- `FEEDBACK_WEBHOOK_URL`
- `FEEDBACK_WEBHOOK_SECRET`
- `FEEDBACK_RELAY_SECRET`
- `ALERT_WEBHOOK_URL`
- `ALERT_WEBHOOK_SECRET`
- `EGRESS_DIAG_SECRET`
- Cloudflare API token
- 本地 `.env`、`.dev.vars`、认证缓存或 CLI 登录缓存

## 本地构建

```bash
# pnpm 由全局独立安装，见 ../Init_essential.md（本机不装 corepack）
pnpm install --frozen-lockfile
pnpm lint
pnpm build
```

构建输出在 `site/dist/`，不入仓库。`pnpm build` 会执行：

1. `tsc -b`
2. Vite 客户端构建。
3. 在隔离的 production Node 进程中用 React 19 `prerender()` 渲染 47 个公开路由与 1 个内部标本页。
4. 从每个公开页面同一次本地语义渲染生成 47 份内部 Markdown 资产。
5. 写入 canonical、sitemap、robots、`llms.txt`、`route-summaries.json` 与 `404.html`。

`pnpm check:html` 在 `verify` 链里校验产物：HTML 数量正确（96 份 = 首页 1 + 其余 47 条预渲染路由各 2 份 + 404），47 份 Markdown 与公开路线集合完全一致、足够精简且无浏览器控件/内部路径泄漏，并且**任何一份 HTML 都不含手工注入的 Cloudflare Web Analytics beacon**（beacon 由 Cloudflare 代理自动注入，手工再来一份就是重复统计）。

本地预览：

```bash
pnpm preview
```

## Cloudflare 部署

### Cloudflare 使用的文件

| 文件                               | 作用                                                             |
| ---------------------------------- | ---------------------------------------------------------------- |
| `site/wrangler.jsonc`             | Worker 名称、入口、自定义域名路由、静态资源目录与 404 配置。 |
| `site/worker.js`                  | 在公开页面上协商 HTML/Markdown，并接住反馈、统计与诊断 API。 |
| `site/worker/content-negotiation.js` | 解析 `Accept` 并在 HTML、Markdown、406 之间作确定性选择。 |
| `site/worker/feedback-core.js`    | 反馈处理核心，同时是外部 relay 主机的参考实现。 |
| `site/worker/analytics-core.js`   | 第一方统计事件核心。 |
| `site/worker/webhook-core.js`     | Webhook 报文格式、钉钉加签、CORS 判定与 relay 协议。 |
| `site/worker/egress-probe.js`     | 出口可达性探针，只在配置 `EGRESS_DIAG_SECRET` 后存在。 |
| `site/dist/`                      | 预渲染产物。 |

当前 Cloudflare Worker 名称是 `dpmaster`。`wrangler.jsonc` 中的关键配置是：

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

`run_worker_first: true` 保证匹配到静态文件的请求也先经过 `worker.js`，否则平台的默认静态资产优先路由会绕过同 URL 内容协商。已登记公开路由默认读取预渲染 HTML；当 `Accept` 明确更偏好 `text/markdown` 时，Worker 从隔离的内部资产路径读取同页 Markdown。直接请求 `/_representations/` 固定返回 404，内部标本、未知路由、API 与普通静态资产不参与协商，但仍先经过 Worker 路由层再按各自规则处理。未知静态路径由 `404-page` 返回 `404.html` 与 HTTP 404；`/api/feedback`、`/api/analytics` 与 `/api/_diag/egress` 进入 `worker.js`。

内容协商发布冒烟：

```bash
curl.exe -i https://dp.round1.cc/part/a/01 -H "Accept: text/markdown"
curl.exe -i https://dp.round1.cc/part/a/01 -H "Accept: text/html"
curl.exe -I https://dp.round1.cc/part/a/01 -H "Accept: text/markdown"
curl.exe -i https://dp.round1.cc/part/a/01 -H "Accept: application/json"
curl.exe -i https://dp.round1.cc/_representations/markdown/part/a/01.md
```

依次应看到 Markdown 200、HTML 200、无正文的 Markdown HEAD 200、406，以及内部路径 404。两种 200 都必须带 `Vary: Accept`、alternate `Link` 和 `Content-Signal: search=yes, ai-train=no, ai-input=yes`；Markdown 还必须带独立的静态资产 ETag、`Content-Type: text/markdown; charset=utf-8`、`Content-Language: zh-CN` 与 canonical `Link`。HTML 在 Worker 内保留其资产 ETag，但 Cloudflare 会向最终响应注入 Web Analytics 与 JavaScript Detections；[JSD 注入会移除 HTML ETag](https://developers.cloudflare.com/cloudflare-challenges/challenge-types/javascript-detections/#if-you-have-etags)，所以客户端看不到 HTML ETag 是当前边缘合同，不得为制造 304 关闭既定注入。

目录名 `DpMaster`、GitHub 仓库 `ShanireZ/DpMaster` 与 Worker 名 `dpmaster` 都是历史标识符，域名迁移不改动它们。

### 首次发布到 Cloudflare

```bash
wrangler login
pnpm build
pnpm deploy:cf
```

发布成功后，到 Cloudflare Dashboard 检查：

1. 打开 **Workers & Pages**。
2. 选择 Worker `dpmaster`。
3. 进入 **Settings**。
4. 确认 Worker 已部署，静态资源绑定来自 `./dist/`，入口脚本是 `worker.js`。

自定义域名 `dp.round1.cc` 已绑定到该 Worker。`wrangler.jsonc` 里的 `routes` 条目声明的是同一个绑定，`wrangler deploy` 会与现状对齐而不是重复创建。换域名时同步改 `pattern`、`zone_name` 和 `site/src/config/site.ts` 的 `SITE`，然后重跑 `pnpm verify`——SEO 合同测试会拒绝残留的旧域名。

### Cloudflare 配置反馈变量

必须在 Cloudflare 的生产 Worker 上配置变量。Dashboard 路径：

1. **Workers & Pages** -> `dpmaster` -> **Settings**。
2. 打开 **Variables and Secrets**。
3. 添加下面的变量。
4. 点击 **Deploy** 让变量进入线上版本。

| 名称                      | 类型   |         必填 | 值                                           |
| ------------------------- | ------ | -----------: | -------------------------------------------- |
| `FEEDBACK_WEBHOOK_URL`    | Secret |           否 | 反馈 webhook 完整 URL。Worker 直连钉钉当前不通，见下节。 |
| `FEEDBACK_WEBHOOK_KIND`   | Text   |           否 | `dingtalk` / `wecom` / `feishu` / `slack` / `discord`。 |
| `FEEDBACK_WEBHOOK_SECRET` | Secret | 加签模式选填 | 钉钉机器人加签密钥，通常以 `SEC` 开头。      |
| `FEEDBACK_RELAY_URL`      | Text   |           否 | relay 主机的 `/api/feedback`。配了就启用中转，反馈与告警都走它。 |
| `FEEDBACK_RELAY_SECRET`   | Secret |           否 | relay 共享密钥，必须与 relay 主机一致。       |
| `ALERT_WEBHOOK_URL`       | Secret |           否 | 独立告警机器人；建议与反馈用不同的群或频道。 |
| `ALERT_WEBHOOK_KIND`      | Text   |           否 | 告警机器人类型，默认沿用反馈类型。           |
| `ALERT_WEBHOOK_SECRET`    | Secret | 加签模式选填 | 告警机器人的签名密钥。                       |
| `EGRESS_DIAG_SECRET`      | Secret |           否 | 启用 `POST /api/_diag/egress`。排查期之外应删除，**并重新部署**（secret 按版本绑定）。 |

CLI 设置 Secret：

```bash
wrangler secret put FEEDBACK_RELAY_SECRET
```

### Cloudflare 验收

深链：

```bash
curl.exe -I https://dp.round1.cc/part/a/01
```

期望状态码是 200。任意未登记路径必须返回 404 且带 `noindex,nofollow`。

反馈（同源）：

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

验收标准：

- Worker 日志出现结构化的 `feedback_received` 记录。
- 配好送达通道后，HTTP 响应的 `ok` 为 `true`、`status` 为 `delivered`，并带 `requestId`，目标群/频道收到消息。
- ★ 送达通道未定之前这一步只能到 `feedback_received`，响应会是 503 `delivery_unavailable`（未配 webhook）或 502 `delivery_failed`（配了但发不出去）。这是已知状态，不是回归。

可以用 Wrangler 看实时日志：

```bash
wrangler tail dpmaster
```

## Sitemap 与搜索平台提交

构建把 sitemap 写进发布目录，线上地址固定为 `https://dp.round1.cc/sitemap.xml`，列出 47 个页面，每条带源码证据派生的 `lastmod`：已提交源码取 Git 提交时间，工作树编辑取文件修改时间，绝不使用模板或构建日期。单域站点不输出 hreflang 互指，`xmlns:xhtml` 命名空间也不再出现。

★ 域名迁移后必须重新提交，旧域名的验证与 sitemap 记录不会自动继承：

1. Google Search Console：新建 `dp.round1.cc` 资源并验证，提交 `sitemap.xml`。
2. Bing Webmaster Tools：验证新站点并提交 sitemap；可从 Search Console 导入。
3. 百度搜索资源平台：站点已迁到境外托管，收录预期本就有限；如仍要提交，验证 `dp.round1.cc` 并提交同一份 sitemap。

`robots.txt` 除 `User-agent: *` 外，只显式放行检索类与用户触发类生成式引擎抓取器（`OAI-SearchBot`、`ChatGPT-User`、`Claude-User`、`Claude-SearchBot`、`PerplexityBot`、`Perplexity-User`）。训练类抓取器交给 Cloudflare 托管 robots.txt 的 `Disallow`，仓内不再对它们表态。当前已批准的公开内容策略是 `search=yes, ai-train=no, ai-input=yes`。

★ **AI 抓取策略的权威是边缘，仓内与它同向。** round1.cc 开着 Cloudflare 的托管 robots.txt，开关在 **AI Crawl Control → 概览 / 信号 → 「托管 robots.txt」**（旧文档写的 Security → Settings → Bot traffic 是同一设置的旧入口）。它会把一段托管内容合并到仓内这份的**前面**：

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

⚠ 这个开关是 **zone 级（round1.cc）而不是 hostname 级**：AI Crawl Control 的「信号」页把 `dp.round1.cc` 与 `luogusp.round1.cc` 都列为「Cloudflare 托管」。动它之前先确认 LuoguSP 侧没有反向依赖。

因此仓内 `robots.txt` **不得**再对被托管块 `Disallow` 的那批抓取器写 `Allow: /` —— 同一个 user-agent 落进两个组时，各家抓取器的合并与优先级实现并不一致，靠「后面的 Allow 覆盖前面的 Disallow」是不可靠的。`site/src/lib/discovery.ts` 的 `AI_CRAWLERS` 只保留托管块未点名的检索类与用户触发类，`site/scripts/seo-contract.test.mjs` 用正反两组断言锁这条边界（正组必须出现、反组必须不出现）。

`ai-input` 托管块未声明。按 Content Signals 规范「未声明＝既不授予也不限制」，所以仓内保留 `ai-input=yes` 不与边缘冲突。

线上验收必须同时检查：被托管块 `Disallow` 的抓取器不出现在仓内 `Allow` 组中；HTML 与 Markdown 响应都带 `Content-Signal: search=yes, ai-train=no, ai-input=yes`。任一项对不上，停止搜索平台提交并先查控制面。

同时确认以下文件可匿名访问且返回 200：

- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/route-summaries.json`

## 统计

前端只调用统一的 `trackAnalyticsEvent`，事件白名单见 `site/src/analytics/index.ts`。

- Cloudflare Web Analytics / RUM 由 Cloudflare 代理**自动注入**，Rocket Loader 保持关闭。源码与预渲染产物都不得再加手工 beacon；`pnpm check:html` 会在构建后拒绝任何一份带 beacon 的 HTML。域名迁移后无需任何操作：`round1.cc` 整个 zone 在 Cloudflare 上，注入照常，Core Web Vitals（LCP / INP / CLS）按 URL 拆分可见。

  ★ **别用光秃秃的 `curl` 判断注入是否生效。** 自动注入只对**看起来像真实浏览器导航**的请求生效，裸 `curl` 拿到的 HTML 里没有 beacon，据此会得出「没生效」的错误结论（2026-08-22 就这么误判过一次）。要验证请带上浏览器请求头：

  ```bash
  curl.exe -s https://dp.round1.cc/ -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140" -H "Accept: text/html" -H "Sec-Fetch-Mode: navigate" -H "Sec-Fetch-Dest: document" | findstr cloudflareinsights
  ```

  更可靠的判据是直接看 Dashboard 的 Web Analytics 面板有没有 Core Web Vitals 曲线。
- 站内路由、学习与反馈漏斗事件发送到同源 `/api/analytics`，成功返回 204，由 Worker 写入 `dpmaster` Analytics Engine 数据集。
- 接收器拒绝跨站请求、未知事件、未知 Provider、非 JSON 和过大请求；只记录裁剪后的路径、标题及少量原始类型元数据，不读取反馈内容、联系方式、Cookie 或账号标识。
- 统计失败由客户端静默降级，不影响课程、小游戏、导航或反馈提交。

同源冒烟测试：

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

期望 HTTP 204，并在 `wrangler tail dpmaster` 中看到 `analytics_event`。

## 反馈与告警送达

★ **方案已定并落地：Worker 内经 raw socket 直发钉钉。**

Cloudflare 数据中心出口到钉钉 `oapi.dingtalk.com` 的 TLS 握手被系统性打断，稳定 525（2026-08 多轮实测复现；普通海外节点到钉钉正常）。旧架构靠「浏览器跨域直连国内站 → 国内站转发进钉钉」绕开，国内站退役后这条路没了。

### 2026-08-22 出口探针实测结论

★ **`connect()` 能到钉钉，`fetch()` 不能。方案已定：Worker 内直发，不需要 relay 主机、不需要换渠道、不需要 Tunnel。**

| 目标 | `fetch()` | `connect()` |
| --- | --- | --- |
| `oapi.dingtalk.com` | 525 | **200 OK** |
| `api.dingtalk.com` | 525 | **200 OK** |
| `qyapi.weixin.qq.com` | 525 | 403（应用层回的） |
| `open.feishu.cn` | 525 | 404 |
| `open.larksuite.com` | 525 | 404 |
| `api.telegram.org` | 302 | 302 |
| `www.cloudflare.com`（自检） | 200 | 拒绝——文档禁止连 CF 自己的 IP 段 |

POST 往返（`{"mode":"post"}`，不带 token，不投递任何消息）同样成功：

- `oapi.dingtalk.com/robot/send` → `HTTP/1.1 200`，`application/json`，
  body `{"errcode":40035,"errmsg":"缺少参数 access_token"}`
- `api.dingtalk.com/v1.0/robot/oToMessages/batchSend` → `HTTP/1.1 400`，
  body `{"code":"AuthenticationFailed.MissingParameter",...}`

两条都是钉钉**应用层**的回复：请求体发过去了、被解析了，只因为缺凭证才拒绝。响应均为 `Content-Length` 定长，未出现 chunked（解析器两种都支持）。

★ **原来「Cloudflare 出口到中国境内基础设施不通」这个说法是错的**：海外的 `open.larksuite.com` 同样 525，而 `api.telegram.org` 正常。这不是地理问题，是特定一批对端拒绝 Cloudflare 反代出口；`connect()` 换了出口前缀就通了（官方文档：TCP 出站的出口前缀不在 Cloudflare 公开 IP 段内）。

**实现：`site/worker/socket-fetch.js` 是一个最小 HTTPS 客户端，走 `cloudflare:sockets` 的 `connect()`。`forwardWebhook` 的投递顺序是「fetch 优先，只有在 Cloudflare 到源站那一跳失败（52x 或直接抛错）时才降级到 socket」。**

★ 顺序不能反。`connect()` 被禁止连 Cloudflare 自己的 IP 段（探针里 `www.cloudflare.com` 那条就是这么失败的），而 Discord / Slack 这类 webhook 常托管在 Cloudflare 后面 —— socket 优先会把它们全打死。反过来钉钉稳定给 525，正好触发降级。普通 4xx/5xx 是对端应用层的回复，不重试。

投递结果里会带 `transport` 字段（`fetch` / `socket` / `fetch+socket`），排查时一眼看出走的哪条出口。两条都失败时保留 fetch 的结论并附上 socket 的错误原因。

代码侧的 relay 协议（`FEEDBACK_RELAY_URL` + `x-dp-relay-secret` / `x-dp-client-ip` / `x-dp-relay-kind: alert`）完整保留且有测试覆盖，但**现在用不上了** —— 留着是为了日后真需要中转时不用重写。`site/worker/feedback-core.js` 既是 Worker 处理器，也是 relay 主机侧的参考实现。

需要在 Worker 上配的只剩两个：`FEEDBACK_WEBHOOK_URL`（带 `access_token` 的完整钉钉 webhook URL）与 `FEEDBACK_WEBHOOK_SECRET`（加签密钥，`SEC` 开头）。加签是在选出口之前算的，所以降级到 socket 时 `timestamp` / `sign` 原样带上。

## 出口探针

★ 排查完请把 `EGRESS_DIAG_SECRET` 删掉，并**重新部署一次**：secret 是按版本绑定的，只在 Dashboard 删除只会创建新版本，当前生效的版本里还带着它，端点依然可用（2026-08-22 实测确认过这个坑）。

要再测一次出口时，配上 `EGRESS_DIAG_SECRET` 并部署，然后：

```bash
curl.exe -s -X POST https://dp.round1.cc/api/_diag/egress -H "x-dp-diag-secret: THE_SECRET"
```

探针对钉钉两个接入点、企业微信、飞书、Lark 国际版、Telegram 和一个 Cloudflare 对照组，各跑 `fetch()` 与 `connect()` 两条出口，全部是无副作用的 `GET /` / `HEAD /`，不会真的发消息。**关键在于 `connect()`**：Cloudflare 官方文档写明 `cloudflare:sockets` 的出口前缀**不在** Cloudflare 公开 IP 段内，与 `fetch()` 不同——如果钉钉是按公开段封的，手写 HTTPS 走 `connect()` 就能打通，后面几条方案全都不用做。

候选方案，按成本从低到高：

| 方案 | 保钉钉 | 需要额外组件 | 说明 |
| --- | :--: | --- | --- |
| raw socket 直连 | 是 | 无 | ✅ **已采用**：用 `cloudflare:sockets` 手写 HTTPS 请求。 |
| 换钉钉接入点 | 是 | 无 | `api.dingtalk.com` 与 `oapi.dingtalk.com` 是不同 ingress。 |
| 换通知渠道 | 否 | 无 | Telegram / Discord / Slack / Lark 国际版；`webhookBody()` 已支持多数格式。 |
| Cloudflare Tunnel + Workers VPC | 是 | 一台常开机器 | 跑 `cloudflared`，Worker 用 `vpc_networks` 绑定后投递。无公网 IP、无入站端口、无需备案；Workers VPC 目前 beta 且对所有 Workers 计划免费。 |
| 外部 relay 主机 | 是 | 一台机器或 serverless | 原样部署 relay 协议，Worker 侧只改两个环境变量，代码零改动。 |

定下来之后：更新本节与 `docs/operations/analytics.md`，删掉不再适用的分支，并把 `EGRESS_DIAG_SECRET` 从 Worker 变量里删除。

## 钉钉反馈机器人

### 当前支持方式

当前代码支持的是**群自定义机器人 / 群 Webhook 机器人**。它的配置模型是一个 webhook URL，加签时再加一个 secret。这正好对应当前的：

- `FEEDBACK_WEBHOOK_URL`
- `FEEDBACK_WEBHOOK_KIND=dingtalk`
- `FEEDBACK_WEBHOOK_SECRET`

钉钉官方说明里，群 Webhook 机器人只能往群里发消息，不支持单聊，也不支持接收消息。它还被标为不推荐长期新增的方向。因此，当前实现适合“把用户反馈推送到一个维护者群”。

### 创建群自定义机器人

1. 在钉钉客户端进入接收反馈的群。
2. 打开群设置。
3. 找到 **机器人** 或 **智能群助手**。
4. 添加 **自定义机器人**。
5. 命名，例如 `DP大师反馈`。
6. 选择安全设置：
   - 推荐 **加签**：复制 `SEC...` 密钥，填入 `FEEDBACK_WEBHOOK_SECRET`。
   - 简单测试可用 **自定义关键词**：关键词填 `反馈` 或 `DP大师`，此时不要配置 `FEEDBACK_WEBHOOK_SECRET`。
7. 复制 webhook URL，填入 Worker 的 `FEEDBACK_WEBHOOK_URL`。
8. 在 Worker 上配置 `FEEDBACK_WEBHOOK_KIND=dingtalk`。

不建议使用 IP 白名单。Cloudflare Workers 的 Serverless 出口 IP 不适合手工维护白名单，`connect()` 的出口前缀还与 `fetch()` 不同。

## 反馈接口合同

前端 `FeedbackWidget` 向同源 `POST /api/feedback` 发送 JSON。

请求字段：

| 字段          | 来源         | 说明                                                   |
| ------------- | ------------ | ------------------------------------------------------ |
| `kind`        | 前端表单     | `内容有误` / `显示异常` / `功能问题` / `建议` / `其他` |
| `page`        | 前端自动生成 | 人类可读页面名                                         |
| `path`        | 当前路由     | 例如 `/part/a/01`                                      |
| `description` | 必填         | trim 后至少 4 个字符                                   |
| `steps`       | 选填         | 复现步骤或期望                                         |
| `contact`     | 选填         | 用户自愿留下的联系方式                                 |
| `url`         | 用户选择     | 勾选诊断信息后附带当前完整 URL                         |
| `ua`          | 用户选择     | 勾选诊断信息后附带 User-Agent                         |
| `viewport`    | 用户选择     | 勾选诊断信息后附带视口尺寸                             |
| `ts`          | 前端自动生成 | ISO 时间                                               |

字段长度上限与前端表单一致：`description` 2000、`steps` 1000、`contact` 120；请求整体不得超过 16 KB。类型必须是表中的五种之一，浏览器请求必须同源并使用 `application/json`。

响应：

| 条件                       | 状态 | Body 要点                                                      |
| -------------------------- | ---: | -------------------------------------------------------------- |
| 非 JSON 内容类型            |  415 | `error: "unsupported_media_type"`                              |
| 跨站浏览器请求             |  403 | `error: "forbidden_origin"`                                   |
| 非法 JSON                  |  400 | `error: "bad_json"`                                          |
| 字段、类型或描述长度无效       |  422 | 稳定的 `error` 代码与可读 `message`                           |
| JSON 过大                  |  413 | `error: "too_large"`                                         |
| 同一来源 30 分钟内第 11 条     |  429 | `error: "rate_limited"`，并带 `Retry-After`                 |
| 结构化日志写入失败            |  500 | `error: "log_failed"`                                        |
| Webhook 确认送达            |  200 | `{ "ok": true, "status": "delivered", "forwarded": true, "requestId": … }` |
| Webhook 未配置              |  503 | `error: "delivery_unavailable"`                       |
| Webhook 转发失败            |  502 | `error: "delivery_failed"`                            |

合法请求会先输出一条 `[feedback]` 结构化日志，其中 `event=feedback_received`。只有 Webhook 返回成功且业务码通过时，浏览器才收到 `status: delivered` 和回执编号；未配置或转发失败会明确返回 503/502。第二条 `event=feedback_webhook` 日志会记录 `forwarded`、`http_error`、`business_error` 或 `network_error`。日志不输出 Webhook URL 和签名密钥。

### 限流边界

代码内置“同一来源滚动 30 分钟最多 10 条”限流，但状态保存在单个边缘实例内存中，只是低成本保护，不是跨实例强一致安全边界。如果需要全局严格限制，在 Cloudflare WAF / Rate Limiting 中为 `/api/feedback` 配置每来源 30 分钟 10 次。

## 常见问题

| 现象                                   | 优先检查                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 已登记的深链返回 404                   | 是否发布了 `dist/`，该路径的预渲染 `.html` 是否存在，`html_handling` 是否仍为 `drop-trailing-slash`。 |
| `/api/feedback` 返回 HTML              | 请求方法是否是 `POST`，URL 是否真的指向 `/api/feedback`，Worker 是否是最新版本。                    |
| 未知路径返回 200                       | `not_found_handling` 是否仍是 `404-page`，`dist/404.html` 是否存在。                                |
| `/api/analytics` 返回 403              | 请求带了非本站 `Origin`；统计端点只允许同源浏览器请求。                                            |
| `/api/_diag/egress` 返回 405 / 404     | 未配 `EGRESS_DIAG_SECRET`，或 `x-dp-diag-secret` 不匹配。请求落回静态资源，与任意未知路径完全一致（POST → 405，GET → 404，响应体皆空）——这是设计行为，不泄露端点是否存在。 |
| 页面 canonical 指向旧域名              | 发布的是迁移前的旧产物；重新 `pnpm build`，`pnpm check:seo` 会拒绝残留旧域名。                      |
| `Failed to fetch dynamically imported module` / `Unable to preload CSS` | 先确认 HTML 为 `max-age=0` / `no-cache` 且报错的哈希资源返回正确的 JS/CSS；客户端会按 build + path 自动恢复刷新一次，重复告警说明资源仍不可用，需查 Worker 静态资源请求日志。 |
| 端点返回 502 / 503                   | 检查生产环境的 `FEEDBACK_WEBHOOK_URL`，再按 `requestId` 查 `feedback_delivery_failed` / `feedback_delivery_unavailable`。 |
| 端点返回 429                         | 同一来源在 30 分钟窗口已提交 10 条；按 `Retry-After` 等待，或核对平台限流规则。                       |
| 钉钉签名错误                           | `FEEDBACK_WEBHOOK_SECRET` 是否与机器人加签密钥一致。                                                |
| 钉钉关键词错误                         | 关键词是否包含 `反馈` 或 `DP大师`。                                                                 |
| 收到企业微信格式或完全无消息           | `FEEDBACK_WEBHOOK_KIND` 是否漏配为 `dingtalk`。                                                     |

## 维护边界

- `site/wrangler.jsonc` 是唯一的部署合同，应随仓库维护。
- `wrangler` 由发布机全局安装，不在仓库锁版；全局升级后同步更新上文“全局 CLI 基线”表格。
- `site/dist/`、`.env`、`.dev.vars`、CLI 登录缓存和平台 token 不入仓库。
- 如果更改 Cloudflare Worker 名称，同步更新 `site/wrangler.jsonc` 的 `name`。
- 如果更改域名，同步更新 `wrangler.jsonc` 的 `routes` 与 `site/src/config/site.ts` 的 `SITE`，再跑 `pnpm verify`。
- 如果修改反馈字段或响应格式，同步更新本文件的“反馈接口合同”。
- 如果迁移到钉钉应用机器人，需要把本文件的“钉钉反馈机器人”和 `site/worker/feedback-core.js` 一起改掉。

## 官方参考

- [Cloudflare Workers Static Assets routing](https://developers.cloudflare.com/workers/static-assets/routing/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare Workers Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Cloudflare Workers TCP sockets (`connect()`)](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/)
- [Cloudflare Workers VPC](https://developers.cloudflare.com/workers-vpc/)
- [钉钉聊天机器人概述](https://open-dingtalk.github.io/developerpedia/docs/learn/bot/overview/)
- [钉钉群自定义机器人](https://open-dingtalk.github.io/developerpedia/docs/learn/bot/webhook/overview/)
- [钉钉应用机器人](https://open-dingtalk.github.io/developerpedia/docs/learn/bot/appbot/overview/)
