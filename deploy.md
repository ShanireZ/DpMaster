# DP大师部署指南

本文面向需要把 DP大师发布到线上、配置站内反馈机器人、或排查部署问题的维护者。所有命令默认在 `site` 目录下执行。

DP大师是一个 React + Vite 预渲染静态站。生产采用区域双站：

- **国际站 `https://dp.betaoi.cc`**：发布 `site/dist/cloudflare/` 到 Cloudflare Workers Static Assets，入口是 `site/worker.js`。
- **国内站 `https://dp.betaoi.cn`**：发布 `site/dist/edgeone/` 到 Tencent EdgeOne Pages/Makers，并生成 EdgeOne 专用的 API 与真实 404 函数。

两个产物都包含 48 个预渲染公开路由、React 水合、区域 canonical/sitemap/robots/llms.txt、互指 hreflang 和 JSON-LD。站内反馈统一走同源 `POST /api/feedback`；有限的页面与反馈统计事件走同源 `POST /api/analytics`。

## 一页流程

```bash
npm ci        # 按 lockfile 精确安装（需要 Node.js ≥ 24、npm ≥ 11）
npm run lint
npm run build
```

首次部署前登录两家平台：

```bash
npx wrangler login
npx edgeone login
```

发布：

```bash
npm run deploy
```

`npm run deploy` 等价于：

```bash
npm run build
npm run deploy:cf
npm run deploy:eo
```

只发单个平台时使用：

```bash
npm run deploy:cf
npm run deploy:eo
```

## 部署前准备

需要准备：

- Node.js ≥ 24 与 npm ≥ 11。仓库使用 `package-lock.json` 锁版，`packageManager` 固定为 npm 11（见 `site/package.json` 的 `engines`），推荐用 npm。
- Cloudflare 账号，已允许 Wrangler 发布 Workers。
- 腾讯云 EdgeOne 账号，已允许 EdgeOne Pages 发布。
- 如果需要站内反馈，准备一个钉钉群自定义机器人 webhook，或按后文规划迁移到钉钉应用机器人。

不要把以下内容写入仓库：

- `FEEDBACK_WEBHOOK_URL`
- `FEEDBACK_WEBHOOK_SECRET`
- Cloudflare API token
- 腾讯云 SecretId / SecretKey
- 本地 `.env`、`.dev.vars`、认证缓存或 CLI 登录缓存

## 本地构建

```bash
npm ci        # 按 lockfile 精确安装（需要 Node.js ≥ 24、npm ≥ 11）
npm run lint
npm run build
```

构建输出在 `site/dist/cloudflare/` 与 `site/dist/edgeone/`，`dist/` 不入仓库。`npm run build` 会执行：

1. `tsc -b`
2. 为国际站和国内站分别执行 Vite 客户端构建。
3. 在隔离的 production Node 进程中用 React 19 `prerender()` 渲染 48 个公开路由。
4. 为每个区域写入自有 canonical、sitemap、robots、`llms.txt`、`route-summaries.json` 与 `404.html`。
5. 生成 EdgeOne catch-all Adapter。

`postbuild` 由 `site/scripts/postbuild.mjs` 提供，会额外生成：

- `dist/edgeone/edge-functions/[[default]].js`：负责 `/api/feedback`、`/api/analytics`，以及未知路径的 HTTP 404。

本地分别预览：

```bash
npm run preview
npm run preview -- --region china --port 4174
```

## Cloudflare 部署

### Cloudflare 使用的文件

| 文件                               | 作用                                                             |
| ---------------------------------- | ---------------------------------------------------------------- |
| `site/wrangler.jsonc`              | Worker 名称、入口、国际站静态资源目录与 404 配置。               |
| `site/worker.js`                    | 接住反馈与统计 API，其余请求交给 `env.ASSETS.fetch(request)`。 |
| `site/functions/_feedback-core.js` | 反馈处理核心，与 EdgeOne 共用。                                |
| `site/functions/_analytics-core.js`| 第一方统计事件核心，与 EdgeOne 共用。                          |
| `site/dist/cloudflare/`            | `.cc` 国际站预渲染产物。                                      |

当前 Cloudflare Worker 名称是 `dpmaster`。`wrangler.jsonc` 中的关键配置是：

```jsonc
{
  "name": "dpmaster",
  "main": "worker.js",
  "assets": {
    "directory": "./dist/cloudflare/",
    "binding": "ASSETS",
    "html_handling": "drop-trailing-slash",
    "not_found_handling": "404-page"
  }
}
```

已知路由直接命中预渲染 HTML。未知静态路径由 `404-page` 返回 `404.html` 与 HTTP 404；`/api/feedback` 和 `/api/analytics` 进入 `worker.js`。

### 首次发布到 Cloudflare

```bash
npx wrangler login
npm run build
npm run deploy:cf
```

发布成功后，到 Cloudflare Dashboard 检查：

1. 打开 **Workers & Pages**。
2. 选择 Worker `dpmaster`。
3. 进入 **Settings**。
4. 确认 Worker 已部署，静态资源绑定来自 `./dist/cloudflare/`，入口脚本是 `worker.js`。

如果需要绑定自定义域名：

1. 打开 `dpmaster` Worker。
2. 进入 **Settings** -> **Domains & Routes**。
3. 添加 `workers.dev` 路由、Custom Domain，或按 Cloudflare 当前控制台提示添加 Route。
4. 绑定 `dp.betaoi.cc`，等待证书与 DNS 生效后再做深链测试。

### Cloudflare 配置反馈变量

必须在 Cloudflare 的生产 Worker 上配置变量。Dashboard 路径：

1. **Workers & Pages** -> `dpmaster` -> **Settings**。
2. 打开 **Variables and Secrets**。
3. 添加下面的变量。
4. 点击 **Deploy** 让变量进入线上版本。

| 名称                      | 类型   |         必填 | 值                                           |
| ------------------------- | ------ | -----------: | -------------------------------------------- |
| `FEEDBACK_WEBHOOK_URL`    | Secret |           是 | 钉钉 webhook 完整 URL，包含 `access_token`。 |
| `FEEDBACK_WEBHOOK_KIND`   | Text   |           是 | 钉钉填 `dingtalk`。                          |
| `FEEDBACK_WEBHOOK_SECRET` | Secret | 加签模式必填 | 钉钉机器人加签密钥，通常以 `SEC` 开头。      |

CLI 设置 Secret：

```bash
npx wrangler secret put FEEDBACK_WEBHOOK_URL
npx wrangler secret put FEEDBACK_WEBHOOK_SECRET
```

`FEEDBACK_WEBHOOK_KIND` 不敏感，推荐在 Dashboard 里作为 Text variable 添加。如果完全用 CLI，也可以临时用 `wrangler secret put FEEDBACK_WEBHOOK_KIND` 输入 `dingtalk`，但它语义上不是 secret。

### Cloudflare 验收

深链：

```bash
curl.exe -I https://dp.betaoi.cc/part/a/01
```

期望状态码是 200。

反馈：

```powershell
$body = @{
  kind = "建议"
  page = "Cloudflare 部署检查"
  path = "/"
  description = "Cloudflare 反馈端点测试"
  ts = (Get-Date).ToString("o")
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "https://dp.betaoi.cc/api/feedback" `
  -ContentType "application/json" `
  -Body $body
```

验收标准：

- HTTP 响应的 `ok` 为 `true`、`status` 为 `logged`，并带有 `requestId`。
- Cloudflare 日志出现结构化的 `feedback_received` 记录。
- 配置 Webhook 时，日志还有同一 `requestId` 的 `feedback_webhook` 状态；钉钉目标群应收到消息。

可以用 Wrangler 看实时日志：

```bash
npx wrangler tail dpmaster
```

## EdgeOne 部署

### EdgeOne 使用的文件

| 文件                               | 作用                                               |
| ---------------------------------- | -------------------------------------------------- |
| `site/package.json`                | `deploy:eo` 命令固定发布到 `dpmaster` production。 |
| `site/scripts/postbuild.mjs`        | 生成 EdgeOne API 与真实 404 catch-all 函数。 |
| `site/functions/_feedback-core.js` | 构建期内联进 EdgeOne 函数。                  |
| `site/functions/_analytics-core.js`| 构建期内联进 EdgeOne 函数。                  |
| `site/dist/edgeone/`               | `.cn` 国内站预渲染发布目录。                |

当前 EdgeOne 发布命令是：

```bash
edgeone makers deploy ./dist/edgeone -n dpmaster -e production
```

因此 EdgeOne Pages 项目名必须是 `dpmaster`，环境是 `production`。

> EdgeOne 已把 “Pages” 品牌更名为 “Makers”，CLI 相应把 `pages` 子命令改为 `makers`，参数完全一致。旧的 `edgeone pages deploy` 仍可用（官方称过渡期内两者等价、现阶段不会下线），只会打印弃用提示；这里改用 `makers` 以消除警告并跟随官方推荐方向。

### 首次发布到 EdgeOne

```bash
npx edgeone login
npm run build
npm run deploy:eo
```

如果控制台还没有 `dpmaster` 项目，先在 EdgeOne Pages/Makers 控制台创建同名项目，或按 CLI 提示创建。项目创建后，保持发布目录为 `dist/edgeone/`。

如果需要绑定自定义域名：

1. 打开腾讯云 EdgeOne 控制台。
2. 进入 Pages 项目 `dpmaster`。
3. 找到自定义域名或域名管理入口。
4. 绑定 `dp.betaoi.cn`，按控制台提示完成腾讯云 DNS/CNAME 和 HTTPS 证书配置。
5. 域名生效后做深链和反馈测试。

### EdgeOne 配置反馈变量

EdgeOne 的变量要配置到生产环境的边缘函数运行时。控制台入口可能随版本变化，按这个路径找：

1. 打开 EdgeOne Pages 项目 `dpmaster`。
2. 进入 **Project Settings**、**Environment Variables**，或对应 Edge Function 的 **Environment Variables / Secret** 模块。
3. 添加下面的变量。
4. 环境选择 `production`。
5. 保存后点击 **Deploy**，或重新执行 `npm run deploy:eo`。

| 名称                      | 类型   |         必填 | 值                                           |
| ------------------------- | ------ | -----------: | -------------------------------------------- |
| `FEEDBACK_WEBHOOK_URL`    | Secret |           是 | 钉钉 webhook 完整 URL，包含 `access_token`。 |
| `FEEDBACK_WEBHOOK_KIND`   | String |           是 | 钉钉填 `dingtalk`。                          |
| `FEEDBACK_WEBHOOK_SECRET` | Secret | 加签模式必填 | 钉钉机器人加签密钥。                         |

EdgeOne 变量保存后需要部署才会生效。只保存不部署，线上函数可能仍读不到变量。

### EdgeOne 验收

深链：

```bash
curl.exe -I https://dp.betaoi.cn/part/a/01
```

已登记的 48 个路由必须返回 HTTP 200。任意未登记路径必须返回 HTTP 404，并包含 `noindex,nofollow`；若未知路径返回 200，说明平台仍在使用旧 SPA 回退规则，需要检查 `dist/edgeone/edge-functions/[[default]].js` 是否已发布并生效。

反馈：

```powershell
$body = @{
  kind = "建议"
  page = "EdgeOne 部署检查"
  path = "/"
  description = "EdgeOne 反馈端点测试"
  ts = (Get-Date).ToString("o")
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri "https://dp.betaoi.cn/api/feedback" `
  -ContentType "application/json" `
  -Body $body
```

验收标准：

- HTTP 响应的 `ok` 为 `true`、`status` 为 `logged`，并带有 `requestId`。
- EdgeOne 函数日志出现结构化的 `feedback_received` 记录。
- 配置 Webhook 时，日志还有同一 `requestId` 的 `feedback_webhook` 状态；钉钉目标群应收到消息。

## Sitemap 与搜索平台提交

构建会把区域 sitemap 写进各自发布目录，线上地址固定为：

- 国际站：`https://dp.betaoi.cc/sitemap.xml`
- 国内站：`https://dp.betaoi.cn/sitemap.xml`

两份 sitemap 都列出同一组 48 个页面，但 `<loc>` 使用当前区域域名，并为每个 URL 输出 `zh-Hans`、`zh-CN` 与 `x-default` 互指。不要把 `.cc` sitemap 文件复制覆盖 `.cn` 产物。

首次上线和 URL 集合变化后分别提交：

1. Google Search Console：验证两个域名资源，国际站提交 `.cc/sitemap.xml`，国内站提交 `.cn/sitemap.xml`。
2. Bing Webmaster Tools：验证两个站点并提交各自 sitemap；可从 Search Console 导入已验证资源。
3. 百度搜索资源平台：重点验证 `dp.betaoi.cn` 并提交 `.cn/sitemap.xml`；如也验证 `.cc`，仍提交该主机自己的 sitemap。

同时确认以下文件可匿名访问且返回 200：

- `/robots.txt`
- `/sitemap.xml`
- `/llms.txt`
- `/route-summaries.json`

## 区域统计

前端只调用统一的 `trackAnalyticsEvent`。当前允许的事件是 `page_view`、`feedback_opened`、`feedback_submitted`、`feedback_succeeded`、`feedback_failed`。

- 国际站 Provider 只在真实 `dp.betaoi.cc` 主机动态加载 Cloudflare Web Analytics beacon，使用 token `c113fb69d7e84d38a645c5160f6f1bda`；localhost、预览域名和国内站不会加载。
- 国内站 Provider 不加载 Cloudflare 或其他境外统计脚本。EdgeOne 控制台的访问日志/数据分析负责请求、地域、状态码和性能观察；React 路由与反馈漏斗事件发送到同源 `/api/analytics`。
- 两个 Provider 都把有限事件写到同源 `/api/analytics`，成功返回 204。接收器拒绝跨站请求、未知事件、未知 Provider、非 JSON 和过大请求；只记录裁剪后的路径、标题及少量原始类型元数据，不读取反馈内容、联系方式、Cookie 或账号标识。
- 统计失败由客户端静默降级，不影响课程、小游戏、导航或反馈提交。

同源冒烟测试：

```powershell
$event = @{
  provider = "cloudflare"
  event = "page_view"
  path = "/"
  title = "DP大师"
  metadata = @{ region = "international" }
  ts = (Get-Date).ToString("o")
} | ConvertTo-Json

Invoke-WebRequest `
  -Method Post `
  -Uri "https://dp.betaoi.cc/api/analytics" `
  -ContentType "application/json" `
  -Body $event
```

国内站测试时把 URL 换成 `.cn`，并把 `provider` 改成 `tencent-edgeone`。期望 HTTP 204，并在相应平台日志中看到 `analytics_event`。

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
7. 复制 webhook URL，填入 Cloudflare 和 EdgeOne 的 `FEEDBACK_WEBHOOK_URL`。
8. 两个平台都配置 `FEEDBACK_WEBHOOK_KIND=dingtalk`。

不建议使用 IP 白名单。Cloudflare Workers 和 EdgeOne Pages 的 Serverless 出口 IP 不适合手工维护白名单。

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
| `url`         | 前端附带     | 当前完整 URL，后端当前不使用                           |
| `ua`          | 前端自动生成 | User-Agent                                             |
| `viewport`    | 前端自动生成 | 视口尺寸                                               |
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
| 日志已写入                  |  200 | `{ "ok": true, "status": "logged", "forwarded": …, "requestId": … }` |

合法请求会先输出一条 `[feedback]` 结构化日志，其中 `event=feedback_received`。这条日志写入后就视为“已收到”；Webhook 是尽力转发，未配置或转发失败都不会把浏览器的成功态改成失败。配置 Webhook 时，第二条 `event=feedback_webhook` 日志会记录 `forwarded`、`http_error`、`business_error` 或 `network_error`。日志不输出 Webhook URL 和签名密钥。

### 限流边界

代码内置“同一来源滚动 30 分钟最多 10 条”限流，但状态保存在单个边缘实例内存中，只是低成本保护，不是跨实例强一致安全边界。如果需要全局严格限制，应在 Cloudflare 和 EdgeOne 的 WAF / Rate Limiting 中同时配置 `/api/feedback` 每来源 30 分钟 10 次。

## 常见问题

| 现象                                   | 优先检查                                                                                            |
| -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 已登记的 Cloudflare 深链返回 404       | 是否发布了 `dist/cloudflare/`，该路径的预渲染 `.html` 是否存在，`html_handling` 是否仍为 `drop-trailing-slash`。 |
| Cloudflare `/api/feedback` 返回 HTML   | 请求方法是否是 `POST`，URL 是否真的指向 `/api/feedback`，Worker 是否是最新版本。                    |
| 未知路径返回 200                       | 平台仍在用旧 SPA 回退；Cloudflare 应使用 `404-page`，EdgeOne 应发布新的 catch-all。                  |
| EdgeOne 已登记深链返回 404             | 是否发布了 `dist/edgeone/`，并检查对应的预渲染 `.html` 是否存在。                                  |
| EdgeOne `/api/feedback` 返回 HTML      | catch-all 函数没有接住反馈分支，检查 `postbuild` 产物和 EdgeOne 函数日志。                          |
| `/api/analytics` 返回 403              | 请求带了非本站 `Origin`；统计端点只允许同源浏览器请求。                                            |
| `.cn` 页面 canonical 指向 `.cc`        | 错把 `dist/cloudflare/` 发布到了 EdgeOne；应重新发布 `dist/edgeone/`。                              |
| 端点返回 `status: "logged"` 但钉钉没消息 | 用 `requestId` 查找 `feedback_webhook`，检查其 `http_error` / `business_error` / `network_error` 状态。              |
| 端点返回 429                         | 同一来源在 30 分钟窗口已提交 10 条；按 `Retry-After` 等待，或核对平台限流规则。                       |
| 钉钉签名错误                           | `FEEDBACK_WEBHOOK_SECRET` 是否与机器人加签密钥一致。                                                |
| 钉钉关键词错误                         | 关键词是否包含 `反馈` 或 `DP大师`。                                                                 |
| 收到企业微信格式或完全无消息           | `FEEDBACK_WEBHOOK_KIND` 是否漏配为 `dingtalk`。                                                     |

## 维护边界

- `site/wrangler.jsonc` 是 Cloudflare 部署合同，应随仓库维护。
- `site/dist/`（含两个区域子目录）、`.env`、`.dev.vars`、CLI 登录缓存和平台 token 不入仓库。
- 如果更改 Cloudflare Worker 名称，同步更新 `site/wrangler.jsonc` 的 `name`。
- 如果更改 EdgeOne Pages 项目名，同步更新 `site/package.json` 的 `deploy:eo` 命令。
- 如果修改反馈字段或响应格式，同步更新本文件的“反馈接口合同”。
- 如果迁移到钉钉应用机器人，需要把本文件的“钉钉反馈机器人”和 `site/functions/_feedback-core.js` 一起改掉。

## 官方参考

- [Cloudflare Workers Static Assets routing](https://developers.cloudflare.com/workers/static-assets/routing/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Cloudflare Workers Environment Variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)
- [Tencent EdgeOne Data Analysis](https://intl.cloud.tencent.com/document/product/1145/56978)
- [Tencent EdgeOne Custom Statistics](https://intl.cloud.tencent.com/zh/document/product/1145/67226)
- [Tencent EdgeOne Environment Variable and Secret](https://www.tencentcloud.com/document/product/1145/62764)
- [钉钉聊天机器人概述](https://open-dingtalk.github.io/developerpedia/docs/learn/bot/overview/)
- [钉钉群自定义机器人](https://open-dingtalk.github.io/developerpedia/docs/learn/bot/webhook/overview/)
- [钉钉应用机器人](https://open-dingtalk.github.io/developerpedia/docs/learn/bot/appbot/overview/)
