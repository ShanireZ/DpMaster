# DpMaster

DpMaster（DP 图谱）是一个独立的动态规划交互式教学网站：中文讲解、React + Vite 静态站、Warm Ink 视觉、可改值 DP 演示、每个 DP 家族一个小游戏，例题与练习全部使用洛谷原生 P/B 题。

当前项目根目录是 `D:\WorkSpace\DpMaster`，站点代码在 `site/`。旧文档里出现的 `D:\WorkSpace\dp` 是历史路径，已废弃。

## 当前状态

- 7 个 DP 家族，37 个类型页全部注册为 `ready`。
- `/method`、`/problems`、`/about` 已上线。
- 题目索引含 158 个题目槽位，其中 112 个唯一洛谷题号。
- 部署目标是 Cloudflare Workers Static Assets + Tencent EdgeOne Pages 双发。
- 站内反馈通过同源 `POST /api/feedback` 转发到群机器人，钉钉配置见 [deploy.md](deploy.md)。

## 本地运行

```bash
cd D:\WorkSpace\DpMaster\site
npm install
npm run dev
npm run lint
npm run build
```

常用脚本在 `site/package.json`：

| 命令 | 作用 |
|---|---|
| `npm run dev` | Vite dev server，端口 5173 |
| `npm run lint` | Oxlint |
| `npm run build` | TypeScript + Vite build，并生成 EdgeOne 回退产物 |
| `npm run deploy` | 构建一次后依次发布 Cloudflare 和 EdgeOne |

## 文档

项目知识已经整理为 OKF bundle：

- [docs/index.md](docs/index.md) - 文档入口
- [docs/project/overview.md](docs/project/overview.md) - 项目身份与状态
- [docs/product/content-taxonomy.md](docs/product/content-taxonomy.md) - 当前 A-G 家族与类型表
- [docs/product/problem-policy.md](docs/product/problem-policy.md) - 洛谷题目策略
- [docs/engineering/architecture.md](docs/engineering/architecture.md) - 工程结构
- [deploy.md](deploy.md) - 部署与反馈契约

旧的根目录编号方案文档、`handoff/` 文档和 `site/` 下 Markdown 已退休；不要再把它们作为维护来源。

