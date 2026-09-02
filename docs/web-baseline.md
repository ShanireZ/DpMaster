---
type: contract
title: Web Platform Baseline 治理（工作区唯一权威）
description: 各 Web 项目可以使用哪些 Web 平台能力、面向哪些浏览器构建、兼容性目标如何验证。
tags: [baseline, browsers, compatibility, contract]
status: stable
---

# Web Platform Baseline 治理（工作区唯一权威）

> ★★★ **本文件是唯一权威。** 各正式接入项目在自己的 `docs/` 下持一份**完整副本**并钉住本文件的 sha256；
> 副本与权威不一致时，那个项目的质量门**会红**。⇒ **改本文件就要重跑各项目的门并同步副本**，
> 不要只改一边。
>
> ⛔ **本文件正文不得出现相对链接**（外部 URL 可以）：它会被逐字节复制到各项目 `docs/` 的
> 不同深度，在那里相对路径必然解不开，而只有个别项目的 bundle 测试会发现。文件名写成代码跨度即可。
>
> 该 hash 门挡的是这样一条陷阱：**自洽的陈旧抄件会通过每一道门** —— 副本与权威脱钩后仍然自洽，没有任何东西会因此变红。
>
> 参考：[Baseline](https://web.dev/baseline) · [How to use Baseline](https://web.dev/how-to-use-baseline)

## 1. 权威、目标与原则

本文件是工作区统一的 Web Platform Baseline 治理权威。它用于回答各项目可以使用哪些 Web 平台能力、应面向哪些浏览器构建，以及兼容性目标如何验证；它不替代各项目自己的 `AGENTS.md`、产品约束或浏览器支持合同。

权威顺序如下：

1. 目标项目自己的产品、安全、隐私、许可和浏览器合同优先。
2. 本文件统一 Baseline 分类、六字段声明、工具链接线和复核门。
3. `web-contracts.md` 在本文件之上登记 sitemap、同 URL Markdown 内容协商与 Accept 判据，**不得复制或降低本文件的浏览器合同**。

工作区采用以下默认策略：

- `Baseline Newly Available` 是新 Web 能力的默认开发上限。
- 面向公网或跨浏览器用户的生产构建默认采用 `Baseline Widely Available with downstream`。
- 受控浏览器环境只有在兼容性守卫通过后，才可以把 Newly 作为构建目标。
- 需要长期维护或可复现构建的发布物使用固定 Baseline 年份或显式浏览器版本。
- 项目已有的、更严格的浏览器支持合同优先；中央策略不得降低项目当前最低兼容范围。
- Baseline 只描述 Web 平台能力的浏览器可用性，不自动提供 polyfill、功能降级、构建转换或浏览器测试。

## 2. 项目声明模型

每个正式使用 Baseline 的项目都应明确以下字段：

| 字段 | 可选值 | 含义 |
|---|---|---|
| `runtime` | `public-web`、`controlled-web`、`browser-tool`、`render-tool`、`non-web` | 项目的实际运行环境 |
| `featureTarget` | `newly`、`widely`、固定年份、`not-applicable` | 开发时允许采用的 Web 能力上限 |
| `buildTarget` | `newly`、`widely`、固定年份、显式浏览器列表、`not-applicable` | 构建产物实际承诺的兼容目标 |
| `downstream` | `true` / `false`，并附理由 | 是否纳入下游浏览器 |
| `criticalFallback` | 项目自定义 | 关键能力不可用时的特性检测、降级或阻断策略 |
| `verification` | 项目自定义 | 构建、静态检查、浏览器自动化、实机验证和 RUM 要求 |

推荐的项目内声明示例：

```yaml
runtime: public-web
featureTarget: newly
buildTarget: widely
downstream:
  enabled: true
  requiredBrowsers: [android, and_chr, and_ff, samsung]
  reason: 公网产品覆盖移动端下游浏览器
criticalFallback: 关键流程必须提供特性检测和可用降级
verification: 构建检查 + Chromium/Firefox/WebKit 自动化 + RUM 复核
```

该结构是治理接口，不强制所有项目采用同一种配置文件格式。每个项目应在其已有的权威配置或文档中表达这些字段；已有 `baseline.config.json` 的项目继续扩展同一份配置，不创建平行契约。

## 3. 工具链适配

### Next.js

- 通过项目的 Browserslist 配置表达目标。
- 同时解析项目声明与 Next.js 内置 Browserslist 消费器的实际结果；不得以项目直接依赖的 Browserslist 结果代替 Next.js 内置数据。
- 确认 Next.js 的客户端 JavaScript 与 CSS 编译实际消费该配置，并在守卫中对实际消费结果执行引擎完整性与最低版本检查。
- 将语法转换与运行时 Web API 支持分开处理；运行时 API 缺失仍需特性检测、polyfill 或降级。

### Vite

- 在 Vite 配置中显式设置 `build.target`，并单独核实 CSS 目标。
- 不假设根目录或项目内的 Browserslist 会自动控制 Vite 构建目标。
- 若同时保留 Browserslist，必须说明它由哪些检查器、CSS 工具或其他构建环节消费。

### esbuild

- 显式设置 `target`，避免依赖工具默认输出级别。
- 对需要长期复现的用户脚本或发布物固定具体目标，并记录 esbuild 与浏览器数据版本。

### 原生 HTML、CSS、JavaScript

- 不虚构不存在的转译或打包阶段。
- 通过静态语法检查、已声明能力的特性检测、关键路径降级和真实浏览器验证执行策略。
- 当项目权威文档明确禁止引入无消费者的 Browserslist 时，可以使用带日期和数据来源的固定浏览器族合同；守卫必须检查所有原样下发资产，并在剔除注释后确认关键回退真正存在于可执行代码中。
- 固定浏览器族合同和 Node 语法检查不能机械证明所有原样 CSS/Web API 已兼容目标版本；这类项目必须把真实目标浏览器矩阵作为发布验收，缺证时只能标记“未验收”，不得由静态守卫代替。
- 如果项目未来引入构建工具，再按对应适配规则迁移。

## 4. 兼容性守卫

任何移动的 Baseline/Browserslist 查询进入生产构建前，必须执行守卫：

1. 将查询展开为具体浏览器及版本列表。
2. 校验项目声明要求的核心引擎全部存在；公网项目至少检查 Chrome、Edge、Firefox、Safari，涉及移动端时同时检查 iOS Safari 和声明的下游浏览器。
3. 将解析结果与项目当前最低支持合同比较，禁止兼容范围倒退。
4. 确认声明配置确实被实际构建或检查环节消费。
5. 记录检查日期、Browserslist 版本、浏览器数据版本和构建工具版本。
6. 任一核心引擎缺失、目标倒退或配置未接线时直接失败，不允许进入生产构建。

快照日期必须是真实存在的 ISO 日期，且不得早于当前时间 92 天；这使最长日历季度也不会逾期。

2026-08-24 使用当时工作区的 Browserslist 4.28.7/4.28.8 数据检查时，`baseline newly available` 没有解析出 Firefox 和 Safari。因此在工具链或数据更新并重新通过守卫之前，Newly 只能作为特性上限，不能直接作为跨浏览器公网项目的生产构建目标。该事实是带日期的观测，不得被当成永久结论。

## 5. 推进与复核

### 阶段 0：声明与基线记录

- 为正式接入项目记录六个治理字段、当前工具链版本和现有浏览器支持合同。
- 记录接入前的输出语法、包体积、关键路径浏览器结果和已有 RUM 分布。
- 如果接入前数据在当时未采集，必须明确标记为“不可追溯”或“暂无数据”，不得事后伪造；本次实测结果作为下次复核的比较锚点。

### 阶段 1：守卫与适配器

- 每个正式接入项目都要实现查询展开、核心引擎完整性、最低版本回退与工具链接线检查。
- 先用缺失 Firefox/Safari 的 Newly 查询证明守卫能够失败，再验证可接受目标能够通过。

### 阶段 4：复核与升级

- 至少每季度重新解析移动查询并复核用户浏览器分布。
- 只有 RUM、现有支持合同和兼容性守卫同时允许时，公网项目才可从 Widely 提升到 Newly。
- 固定年份或显式版本的可复现发布物不随季度复核自动漂移，升级必须形成单独变更。
- 项目数量、运行形态或公开内容面发生变化时，先重定基中央矩阵，再决定是否进入项目波次。

## 6. 验收标准与边界

- 每个工作区项目都要在矩阵里有一行。★ **矩阵不再手抄**：由 `node Docs/baseline-matrix.mjs` 从各项目的 `baseline.config.json` 现算，项目数与分类计数一个都不写死。
- 不为非 Web 项目添加 Browserslist、构建目标或无意义的兼容性任务。
- 守卫必须拒绝缺失必需引擎、目标范围倒退或声明未被工具链消费的配置。
- 每个正式接入项目在变更后运行自身构建、静态检查和既有测试。
- 公网项目至少覆盖 Chromium、Firefox 和 WebKit/Safari 等价环境的关键路径验证。
- 用户脚本在实际目标页面中验证；受控环境项目在实际部署浏览器中验证。
- Baseline 不负责业务功能降级、运行时 Web API polyfill 或测试覆盖；这些必须由项目分别落实。
- ★ **不要在本文件登记任何技能版本号**：那类值必然过期且不会红。Modern Web Guidance 的加载时机写在工作区的 `Docs/dev_guide.md` 环节 4，版本从当时安装的技能现读。
- 后续实施必须先读取对应项目的 `AGENTS.md` 和权威文档，并尊重项目当前脏工作树及发布约束。
