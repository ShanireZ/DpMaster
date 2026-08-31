<!-- baseline-copy: authority=Docs/web-contracts.md sha256=9f63b5a7850c358def642253b4c1a813ce5e99eb378ed873b05d049562a43742 -->

---
type: contract
title: Sitemap / 同 URL Markdown 协商 / Accept 判据（工作区唯一权威）
description: 三块跨项目通用的公共 HTTP 契约，dp.round1.cc 线上正按它们运行。
tags: [sitemap, markdown, content-negotiation, accept, contract]
---

# Sitemap · 同 URL Markdown 协商 · Accept 判据

> ★★★ **本文件是唯一权威**，与 [`web-baseline.md`](web-baseline.md) 同一套 hash 门：
> 启用这三块的项目在自己的 `docs/` 下持完整副本并钉住本文件的 sha256，不一致即红。
>
> 来源：原 `NxtAgents/modern-web-guidance-sitemap-markdown-negotiation-plan.md` 的 §3.3 / §3.4 / §6.1–6.3。
> 该仓已按 `nxtplan.md` N05 移除，**这三块因为 `dp.round1.cc` 线上正按它们运行而必须留下**（N10）。
> 原计划 §4 的八波实施包与 §5 的 PubEnv 搜索闭环**已作废**（N10）；§5.3 的上线预检 10 步
> 因为是 DpMaster 退出门的验收依据，已内联进 [`ShanireZ/DpMaster#6`](https://github.com/ShanireZ/DpMaster/issues/6)。

## 1. Sitemap 契约

启用项目必须满足：

- 根路径固定为 `/sitemap.xml`。
- UTF-8 XML，使用 sitemap 协议命名空间。
- 只包含同一 canonical host 下的 HTTPS URL。
- 每个 URL 必须直接返回 200、允许索引、无重定向、无 query、无 fragment。
- 不包含登录、会话、管理、token、验证、错误、搜索结果或个性化 URL。
- URL 来自一个项目内唯一路线/内容权威，不维护第二份手写列表。
- 按 canonical URL 稳定排序。
- 只有真实、可证明的正文更新时间才能生成 `lastmod`。
- 不使用构建时间伪造 `lastmod`。
- 不生成无依据的 `changefreq` 或 `priority`。
- URL 集为空时 `/sitemap.xml` 返回 404 或不存在，`robots.txt` 不声明它；禁止发布空 `<urlset>`。
- `robots.txt` 的最终线上版本由 Cloudflare 管理，项目仓保存期望契约和可验证源数据，PubEnv 负责保证边缘结果一致。
- Sitemap 协议与 Google 的提交规范以 [sitemaps.org](https://www.sitemaps.org/protocol.html) 和 [Google Search Central](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) 为准。

## 2. 同 URL Markdown 内容协商

只对登记的公开内容页面启用，不新增 `.md` URL。

#### 请求选择规则

对每个可协商页面分别计算 `text/html` 与 `text/markdown` 的有效匹配：

1. 先按 media range 的有效 q 值。
2. q 值相同时，更具体的 media range 优先。
3. 仍相同时 HTML 优先，保持现有浏览器兼容。
4. 缺失 `Accept`、仅有 `text/*` 或 `*/*` 时默认 HTML。
5. `q=0` 明确排除该表示。
6. 无效成员忽略；没有任何有效且可接受的表示时返回 406。
7. 只在已登记页面上执行该逻辑；API、静态资源、未知路由和 N/A 项目保持原行为。

该行为遵循 [RFC 9110 内容协商语义](https://www.rfc-editor.org/info/rfc9110)。Markdown media type 采用 [RFC 7763](https://www.rfc-editor.org/info/rfc7763/) 注册的 `text/markdown`。

#### 响应契约

Markdown 响应：

```http
Content-Type: text/markdown; charset=utf-8
Content-Language: zh-CN
Content-Signal: ai-train=yes, search=yes, ai-input=yes
Vary: Accept
X-Content-Type-Options: nosniff
```

HTML 与 Markdown 均须：

- 合并而不是覆盖已有 `Vary`，大小写不敏感去重 `Accept`。
- 使用表示专属 ETag，避免 HTML 和 Markdown 共享验证器。
- 使用隔离的 CDN/Worker 缓存键。
- Markdown 的缓存范围和寿命不得比对应 HTML 更宽。
- HTML 响应声明同 URL、`type="text/markdown"` 的 alternate。
- Markdown 响应声明 canonical 以及同 URL、`type="text/html"` 的 alternate。
- `HEAD` 与相应 `GET` 状态码、协商选择及响应头一致，但不返回正文。
- 条件请求只命中相同表示的 ETag。
- Content-Signal 的三项允许值只适用于已批准公开内容，不替代认证、授权或 noindex。

项目主动生成的 Markdown 是权威实现。Cloudflare Markdown for Agents 只允许作为经批准的可关闭加速器，不能成为唯一内容源；其能力和 Content-Signal 语义参考 [Cloudflare 官方说明](https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/)。

#### Markdown 内容规则

- 与 HTML 使用同一内容模型或同一次本地语义构建输出。
- 禁止远程抓取线上 HTML 再转换。
- 禁止维护第二份手写正文。
- 保留标题层级、段落、列表、表格、代码、公式、图片替代文本及公共链接。
- 去掉脚本、样式、导航噪音、纯装饰、隐藏节点、表单控件、验证码和个性化状态。
- 互动演示转换为静态说明、关键结论和原页面 canonical 链接。
- 不包含认证页面、用户数据、课程私有内容、管理功能、token URL、错误页或调试信息。
- 不强制新增 `llms.txt`；DpMaster 现有 `llms.txt` 保留并消除与新训练政策冲突的说明。

## 3. Accept 判据与测试向量

至少覆盖：

| Accept | 预期 |
|---|---|
| 缺失 | HTML 200 |
| `text/html` | HTML 200 |
| `text/markdown` | Markdown 200 |
| `text/markdown, */*;q=0.5` | Markdown 200 |
| `text/html;q=1, text/markdown;q=0.8` | HTML 200 |
| `text/html;q=0, text/markdown;q=1` | Markdown 200 |
| `text/*` | HTML 200 |
| `*/*` | HTML 200 |
| `text/html;q=0, text/markdown;q=0` | 406 |
| `application/json` | 406 |
| `text/markdown;q=0, */*;q=1` | HTML 200 |
| 非法成员 + 有效 HTML | 忽略非法成员，返回 HTML |
| 仅非法且无有效范围 | 406 |

每个向量同时测试 GET、HEAD 和条件请求。

## 4. Sitemap 测试

- XML schema/namespace。
- UTF-8 与转义。
- URL 去重和稳定排序。
- canonical host、HTTPS、无 query/fragment。
- 路线注册表、prerender、Markdown 和 sitemap 集合一致。
- 每个 URL 线上 200 且无重定向。
- noindex 与 sitemap 互斥。
- 空集合时 404 且 robots 无声明。
- 正文摘要变化与真实 `lastmod` 联动。
- `.cc`、token 和内部表示路径永不出现。

## 5. Markdown 内容测试

- 标题、摘要、主要正文与 HTML 同源。
- 标题层级合法。
- 代码围栏、表格、数学公式和链接可读。
- 互动组件有静态说明和 canonical 链接。
- 不含 `<script>`、样式、事件处理器、表单值、验证码、用户数据或内部路径。
- 所有公共链接可解析。
- 输出确定性：相同源数据连续构建字节一致。
- HTML 正文改变但 Markdown 未变时 CI 失败，反之亦然。
