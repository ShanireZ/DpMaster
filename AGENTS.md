# AGENTS.md — DP大师

> 继承工作区总规则：[`../AGENTS.md`](../AGENTS.md)。本文件只记录 DP大师 的项目级约束。

## Project identity

- 产品与文档显示名是 **DP大师**。
- 为兼容现有发布链路，保留目录名 `DpMaster`、GitHub 仓库 `ShanireZ/DpMaster`、Cloudflare/EdgeOne 项目名 `dpmaster` 和域名 `dp.betaoi.cc`；不要把显示名改动机械扩散到这些标识。
- 站点是 `site/` 下的静态 React/Vite 应用，不引入账号、数据库或在线评测后端。

## Source of truth

- `site/src/data/catalog.ts` 是 DP 家族、课程顺序、正文懒加载和家族游戏懒加载的权威 Module。
- 题目语料以课程正文中的 `ExampleCard` / `Exercise` 为准。
- `site/src/data/problems.ts` 是生成文件；不要手改。课程题目变化后运行 `npm run content:generate`。
- 部署与反馈操作以根目录 `deploy.md` 为准；长期工程知识维护在 `docs/` OKF 文档包。

## Commands

所有 npm 命令从 `site/` 执行，要求 Node 24 和 npm 11。

```bash
npm ci
npm run dev
npm run test
npm run lint
npm run build
npm run verify
```

`npm run verify` 是完整本地 gate：内容与 SEO 一致性、Node 内容测试、React 组件测试、零 warning lint、TypeScript/Vite 构建、Playwright 浏览器路由检查和资产预算。

## Public README & license

- 根目录 `README.md` 是公开入口；badge 必须遵循 [`../badgestd.md`](../badgestd.md)，并从 `site/package.json`、`site/src/data/catalog.ts` 和 `deploy.md` 的当前事实取值。
- `LICENSE` 提供 GNU GPL v3 正文，但没有机器可读的 `only` / `or-later` 声明；README、badge 和新增文档统一使用通用 `GPL-3.0`，不要猜测具体 SPDX variant。
- README 的 `lessons` 数量来自 catalog；课程变更后先运行 `npm run content:generate`，再同步 README/OKF 文档中的数量与状态。

## Change rules

- 新增或调整课程时只在 `catalog.ts` 登记课程身份与 lazy import，不要重新创建平行 registry。
- 正文题目变化后提交同步生成的 `problems.ts`，并更新涉及数量的 README/OKF 文档。
- 保持课程正文按课程独立分包；家族游戏也必须 lazy-load。
- 核心路由、内容语料、部署标识变化时同步更新对应文档和测试。
