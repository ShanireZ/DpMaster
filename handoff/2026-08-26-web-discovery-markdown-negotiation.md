# DP大师 · MWG / Sitemap / Markdown 内容协商推进

> 状态：本地实现与验证完成；等待独立的 Cloudflare / PubEnv 移交
> 中央权威：`../NxtAgents/modern-web-guidance-sitemap-markdown-negotiation-plan.md` 第 1 波
> 项目权威：`AGENTS.md`、`deploy.md`、`docs/` 当前事实与源码/测试

## 1. 已核事实

- Git：`main` 与 `origin/main` / `cnb/main` 同步，工作树在任务开始时干净。
- 运行时：Node 26.7.0、pnpm 12.0.0-rc.6；所有包管理命令从 `site/` 运行。
- 路线：`PUBLIC_PATHS` 47 条，`INTERNAL_PATHS` 1 条，`PRERENDER_PATHS` 48 条；`public/sitemap.xml`、`route-summaries.json` 与公开集合均为 47。
- 发布：单一 Cloudflare Worker + Static Assets，`worker.js` 是唯一数据面入口。
- 当前仓内策略：robots、llms、HTML 与 Markdown 均声明 `ai-train=yes, search=yes, ai-input=yes`；Cloudflare 线上托管段仍可能注入相反规则，尚未改动或复验。
- 中央批准状态：公开内容使用 `ai-train=yes, search=yes, ai-input=yes`；仓内实现已完成，Cloudflare Dashboard 调整仍是独立的外部控制面动作。
- GitHub issue tracker 当前无法读取：本机 `gh` 未登录。此次不创建外部 issue，也不以 `.scratch/` 取代项目的 GitHub Issues 权威。

## 2. 本地实现范围

1. 扩展现有 `site/baseline.config.json`，登记 MWG、sitemap 与 Markdown 内容协商当前合同。
2. 从现有 React SSR/预渲染 DOM 的 `<main>` 生成 47 份确定性 Markdown；不抓线上 HTML、不维护第二份正文。
3. Markdown 制品进入内部前缀；公开直访该前缀固定 404。
4. Worker 只对 `PUBLIC_PATHS` 的 GET/HEAD 执行 `Accept` 协商；API、静态资源、未知路由、内部路由和其他方法保持原行为。
5. HTML 与 Markdown 分离静态资产路径、ETag 与缓存对象，并合并 `Vary: Accept`。
6. 更新 robots/llms/deploy 当前事实；本轮不改 Cloudflare、PubEnv 或搜索平台状态。

## 3. HTTP 合同

- 缺失 `Accept`、`text/*`、`*/*` 默认 HTML。
- `text/html` 与 `text/markdown` 按有效 q 值、media range specificity、HTML tie-break 选择；`q=0` 排除。
- 只剩不可接受或非法范围时返回 406。
- Markdown：`Content-Type: text/markdown; charset=utf-8`、`Content-Language: zh-CN`、`Content-Signal: ai-train=yes, search=yes, ai-input=yes`、`Vary: Accept`、`X-Content-Type-Options: nosniff`、canonical/alternate Link。
- GET/HEAD 选择与状态/响应头一致；HEAD 无正文；条件请求只命中同一表示的 ETag。

## 4. TDD 顺序

- [x] RED→GREEN：公开路线请求 Markdown，Worker 内部读取 Markdown 资产并返回合同头。
- [x] RED→GREEN：HTML 默认、Vary 合并、HEAD 与表示专属条件请求。
- [x] RED→GREEN：完整 Accept 向量与 406。
- [x] RED→GREEN：未知/API/静态/内部路径不协商，内部制品直访 404。
- [x] RED→GREEN：预渲染 DOM 生成 Markdown，保留正文/代码/表格/公式/链接并剥离控件、脚本和装饰。
- [x] RED→GREEN：47 路线、sitemap、prerender、route summaries、Markdown manifest 集合一致且输出确定。
- [x] 更新配置、robots/llms/deploy/docs，并运行完整验证门；Firefox/WebKit 因沙箱阻断浏览器子进程，按权限规则在沙箱外单独复验 2/2 通过。

## 5. 非目标与外部移交

- 不部署、不运行 `pnpm release` 或 `wrangler deploy`。
- 不更改 Cloudflare AI Crawl Control、托管 robots、缓存规则或搜索平台。
- 不创建公开 `.md` URL，不启用 Cloudflare 自动 HTML→Markdown 作为权威实现。
- 外部移交必须明确：关闭/调整 AI Crawl Control 后再验 `Content-Signal` 与 robots；线上 HTML/Markdown/HTML 交错请求无串表示后，才允许搜索提交。
