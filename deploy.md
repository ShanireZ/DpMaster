# DpMaster 部署与反馈契约

本文是 DpMaster 部署、SPA 深链回退、站内反馈和钉钉机器人配置的维护来源。所有命令默认在 `D:\WorkSpace\DpMaster\site` 下执行。

## 一页命令

```bash
cd D:\WorkSpace\DpMaster\site
npm install

# 首次本机授权
npx wrangler login
npx edgeone login

# 日常发布
npm run deploy
```

`npm run deploy` 等价于：

```bash
npm run build
npm run deploy:cf
npm run deploy:eo
```

## 构建合同

| 命令 | 作用 |
|---|---|
| `npm run build` | `tsc -b && vite build`，随后 npm lifecycle 执行 `postbuild` |
| `npm run postbuild` | 复制 `dist/index.html` 为 `dist/404.html`，并生成 `dist/edge-functions/[[default]].js` |
| `npm run deploy:cf` | `wrangler deploy` |
| `npm run deploy:eo` | `edgeone pages deploy ./dist -n dpmaster -e production` |

构建输出目录是 `site/dist/`。`dist/` 不入仓库。

## Cloudflare 合同

当前 Cloudflare 线路使用 Workers Static Assets + 极薄 Worker。

必须保留并维护 `site/wrangler.jsonc`。它不是本机授权缓存，应随仓库维护；认证态仍由 `.wrangler/`、`wrangler-account.json`、`node_modules/.cache/wrangler/` 忽略。

关键配置：

- `name = "dpmaster"`
- `main = "worker.js"`
- `assets.directory = "./dist/"`
- `assets.binding = "ASSETS"`
- `assets.not_found_handling = "single-page-application"`

运行时行为：

- `POST /api/feedback` 由 `site/worker.js` 转到 `handleFeedback(request, env)`。
- `OPTIONS /api/feedback` 返回 204。
- 其他 `/api/feedback` 方法返回 405，并带 `Allow: POST`。
- 其余请求交给 `env.ASSETS.fetch(request)`；未命中静态文件时按 SPA 回退到 `index.html`。

## EdgeOne 合同

当前 EdgeOne 线路发布 `site/dist/` 到项目 `dpmaster` 的 production 环境。

`site/scripts/postbuild.mjs` 每次构建后生成：

- `dist/404.html`：EdgeOne 深链安全网，可能返回 404 但页面可进入 SPA。
- `dist/edge-functions/[[default]].js`：catch-all edge function。`POST /api/feedback` 走同一份反馈核心，其余未命中路径返回内联 SPA HTML + HTTP 200。

EdgeOne 的 catch-all 函数行为需要每次上线后抽测，因为旧平台说明里没有把这条行为写成稳定接口。

## 反馈接口合同

前端 `FeedbackWidget` 向同源 `POST /api/feedback` 发送 JSON。

请求字段：

| 字段 | 来源 | 说明 |
|---|---|---|
| `kind` | 前端表单 | `内容有误` / `显示异常` / `功能问题` / `建议` / `其他` |
| `page` | 前端自动生成 | 人类可读页面名 |
| `path` | 当前路由 | 例如 `/part/a/01` |
| `description` | 必填 | trim 后至少 4 个字符 |
| `steps` | 选填 | 复现步骤或期望 |
| `contact` | 选填 | 用户自愿留下的联系方式 |
| `url` | 前端附带 | 当前完整 URL；后端当前不使用 |
| `ua` | 前端自动生成 | user agent |
| `viewport` | 前端自动生成 | 视口尺寸 |
| `ts` | 前端自动生成 | ISO 时间 |

响应：

| 条件 | 状态 | Body |
|---|---:|---|
| 非法 JSON | 400 | `{ "ok": false, "error": "bad_json" }` |
| `description` 少于 4 字符 | 422 | `{ "ok": false, "error": "empty" }` |
| JSON 过大 | 413 | `{ "ok": false, "error": "too_large" }` |
| 合法请求 | 200 | `{ "ok": true }` |

合法请求会先输出一条 `[feedback]` 日志。即使 webhook 未配置或转发失败，前端仍收到 `{ "ok": true }`，因此上线验收必须同时检查函数日志和钉钉群是否收到消息。

## 钉钉环境变量

Cloudflare 和 EdgeOne 生产环境都要配置同一套变量：

| 变量 | 必填 | 敏感 | 说明 |
|---|---|---|---|
| `FEEDBACK_WEBHOOK_URL` | 是 | 是 | 钉钉机器人 webhook，含 `access_token` |
| `FEEDBACK_WEBHOOK_KIND` | 是 | 否 | 固定为 `dingtalk`；不设会按默认企业微信格式发送 |
| `FEEDBACK_WEBHOOK_SECRET` | 加签模式必填 | 是 | 钉钉机器人加签密钥，`SEC...` 开头；关键词模式留空 |

钉钉机器人安全设置二选一：

- 加签：更安全，配置 `FEEDBACK_WEBHOOK_SECRET`。
- 自定义关键词：关键词用 `反馈` 或 `DP 图谱`，因为消息开头包含 `DP 图谱 · 新反馈`。

不要把 webhook URL、secret、Cloudflare token 或 EdgeOne token 写进仓库。

## 上线检查

Cloudflare：

```bash
npm run deploy:cf
```

EdgeOne：

```bash
npm run deploy:eo
curl.exe -I https://dpmaster.edgeone.app/state-not-reachable
```

EdgeOne 深链理想结果是 HTTP 200；如果返回 404 但页面内容仍可进入 SPA，说明落到了 `404.html` 安全网，功能可用但状态码需要后续处理。

反馈：

```powershell
$body = @{
  kind = "建议"
  page = "部署检查"
  path = "/"
  description = "部署后反馈测试"
  ts = "2026-07-07T00:00:00+08:00"
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "https://<线上域名>/api/feedback" -ContentType "application/json" -Body $body
```

检查项：

- 响应是 `{ "ok": true }`。
- Cloudflare / EdgeOne 日志出现 `[feedback]`。
- 钉钉群收到消息。

## 风险与维护备注

- EdgeOne feedback 分支被包在 `try` 中，异常时可能回落 SPA HTML；线上必须用真实 `POST /api/feedback` 抽测。
- 当前接口没有验证码、鉴权、应用侧限流或来源校验，主要依赖同源入口和钉钉机器人自身频率限制。
- `site/functions/api/feedback.js` 只在未来切到 Cloudflare Pages Functions 时生效；当前 Cloudflare 部署不加载它。
- 如切换项目名，必须同步 `site/wrangler.jsonc` 的 `name` 与 `site/package.json` 中 `deploy:eo` 的 `-n dpmaster`。
