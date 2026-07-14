# DP大师

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg?style=flat-square)](LICENSE)
![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react&logoColor=black)
![Vite 8](https://img.shields.io/badge/Vite-8-646CFF.svg?style=flat-square&logo=vite&logoColor=white)
![TypeScript 6](https://img.shields.io/badge/TypeScript-6-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)
[![Deploy: Cloudflare + EdgeOne](https://img.shields.io/badge/deploy-Cloudflare%20%2B%20EdgeOne-success.svg?style=flat-square)](https://dp.betaoi.cc)
![Lessons](https://img.shields.io/badge/lessons-37%2F37%20ready-success.svg?style=flat-square)

DP大师是一个面向 C++ 算法学习者的动态规划交互式学习网站。把常见 DP 模型整理成可浏览的学习体系：知识点精讲、可改值演示、小游戏、手算过程、C++ 代码和洛谷练习路径放在同一套静态站里。

适合正在准备 NOIP、CSP、省选基础阶段，或想系统补齐动态规划模型的学习者。

> 站点源码目录：`site/`  
> GitHub 仓库：<https://github.com/ShanireZ/DpMaster>

## 项目状态

- 7 个 DP 家族已注册。
- 37 个类型页已注册并标记为 `ready`。
- 7 个家族小游戏已接入。
- 题目索引包含 177 个题目槽位，其中 116 个唯一洛谷题号。
- 站点是静态 React 应用，不依赖数据库、登录系统或在线评测后端。
- 生产部署支持 Cloudflare Workers Static Assets 与 Tencent EdgeOne Pages 双线路。

## 覆盖内容

| 编号 | 家族    | 类型数 | 学习重点                           |
| ---- | ------- | -----: | ---------------------------------- |
| A    | 背包 DP |      9 | 容量、选择、物品转移和滚动数组     |
| B    | 线性 DP |      7 | 沿序列推进的状态、递推和最优子结构 |
| C    | 区间 DP |      5 | 区间长度枚举、断点枚举和合并顺序   |
| D    | 矩阵 DP |      2 | 网格状态与矩阵快速幂加速           |
| E    | 换根 DP |      4 | 子树内外信息合并与根的转移         |
| F    | 树形 DP |      5 | 树上选择、树上背包、覆盖与统计     |
| G    | 状压 DP |      5 | 位集合、子集枚举、棋盘状态与轮廓   |

## 功能亮点

- **可改值的 DP 演示**：改输入后重新求解，逐步播放表格、树、网格或 bitmask 状态。
- **家族小游戏**：装包大师、LIS 接龙、合并石子、幂次加速器、换根巡礼、舞会邀请、棋盘布阵。
- **题目索引**：按家族、类型、难度和例题/练习关系组织洛谷题目。
- **静态优先**：不需要后端数据库，构建产物可以直接发布到边缘静态托管。
- **反馈入口**：站内 `POST /api/feedback` 可转发到钉钉等 webhook 机器人。

## 技术栈

| 层级     | 技术                                                                |
| -------- | ------------------------------------------------------------------- |
| 前端     | React 19, React Router 7, Vite 8, TypeScript                        |
| 内容渲染 | KaTeX 公式渲染, Shiki C++ 高亮                                      |
| UI       | CSS 分层样式, Lucide React 图标, 自托管字体包                       |
| 部署     | Cloudflare Workers Static Assets, Tencent EdgeOne Pages             |
| 反馈     | Cloudflare Worker / EdgeOne Edge Function 共用的 Fetch API 处理核心 |

## 本地运行

请先确保 **Node.js ≥ 24** 且 **npm ≥ 11**（仓库用 `package-lock.json` 锁版，`packageManager` 固定为 npm 11，见 `site/package.json` 的 `engines`），再进入 `site/` 运行命令。

```bash
npm ci        # 按 lockfile 精确安装依赖（Requires Node ≥ 24）
npm run dev
```

常用命令：

| 命令               | 作用                                                      |
| ------------------ | --------------------------------------------------------- |
| `npm run dev`      | 启动 Vite 开发服务器。                                  |
| `npm run test`     | 运行课程目录、题目语料与资产预算合同测试（node --test）。 |
| `npm run test:unit`| 运行 React 组件级单测（Vitest + Testing Library）。    |
| `npm run lint`     | 运行零 warning 的 Oxlint。                              |
| `npm run build`    | TypeScript 检查并构建到 `site/dist/`。                  |
| `npm run verify`   | 内容/SEO 检查、测试、组件单测、lint、构建与资产预算。   |
| `npm run preview`  | 本地预览构建产物。                                      |
| `npm run deploy`   | 构建一次，然后依次发布 Cloudflare 和 EdgeOne。          |

## 项目结构

```text
DpMaster/
├─ docs/                    # OKF 项目文档包
├─ deploy.md                # 部署与反馈机器人用户指南
├─ README.md                # GitHub 项目介绍页
└─ site/
   ├─ src/
   │  ├─ app/               # 路由与应用壳
   │  ├─ components/        # 布局、演示、小游戏、反馈组件
   │  ├─ content/           # 课程正文，也是题目语料来源
   │  ├─ data/catalog.ts    # 家族、课程、正文与游戏的统一目录
   │  ├─ data/problems.ts   # 由正文自动生成的题目索引
   │  ├─ pages/             # 首页、家族页、类型页、方法页、题单页、关于页
   │  └─ styles/            # 全局样式与设计 token
   ├─ functions/            # 反馈端点核心与可选 Pages Functions 包装
   ├─ scripts/postbuild.mjs # EdgeOne 回退产物生成
   ├─ worker.js             # Cloudflare Workers 入口
   └─ wrangler.jsonc        # Cloudflare Workers Static Assets 配置
```

## 文档入口

项目知识已整理到 `docs/` 的 OKF 文档包中：

- [文档索引](docs/index.md)
- [项目概览](docs/project/overview.md)
- [产品范围](docs/product/scope.md)
- [内容分类](docs/product/content-taxonomy.md)
- [洛谷题目策略](docs/product/problem-policy.md)
- [工程架构](docs/engineering/architecture.md)
- [验证流程](docs/operations/verification.md)

部署、平台环境变量、钉钉反馈机器人和上线验收见 [deploy.md](deploy.md)。

## 部署

当前维护的生产目标：

- Cloudflare Workers Static Assets
- Tencent EdgeOne Pages

第一次部署请从 [deploy.md](deploy.md) 开始。里面包含 Cloudflare 端操作、EdgeOne 端操作、钉钉群机器人配置、单聊机器人限制说明、验收命令和常见排障。

## License

本项目采用 [GNU General Public License v3.0](LICENSE) 发布。
