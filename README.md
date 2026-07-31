# DP大师

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg?style=flat-square)](LICENSE)

DP大师是面向 C++ 算法学习者的动态规划交互式学习网站，将课程讲解、可编辑演示、小游戏、代码示例和练习题整合在同一套学习体验中。

[国际站](https://dp.betaoi.cc) · [国内站](https://dp.betaoi.cn)

## 主要特点

- 课程按 DP 模型组织，配有推导、图解、代码和练习。
- 演示支持修改输入并逐步观察状态转移。
- 家族小游戏将抽象模型转化为可操作的训练。
- 题目索引支持搜索、筛选和可分享的 URL 状态。
- 无需账号，打开网页即可学习。

## 项目结构

```text
DpMaster/
├─ site/                       # 网站应用
│  ├─ src/
│  │  ├─ algorithms/          # DP 算法与可视化计算模型
│  │  ├─ analytics/           # 站点事件与性能采集
│  │  ├─ app/                 # 应用入口、路由与静态渲染
│  │  ├─ components/          # 布局、交互演示、小游戏与通用组件
│  │  ├─ content/             # 课程正文
│  │  ├─ data/                # 课程目录、题目索引与页面元数据
│  │  ├─ learning/            # 本地学习状态
│  │  ├─ pages/               # 页面级组件
│  │  └─ styles/              # 全局样式与设计变量
│  ├─ functions/              # 反馈与统计接口
│  ├─ public/                 # 静态资源
│  ├─ scripts/                # 内容生成、预渲染与区域构建
│  ├─ tests/                  # 浏览器端到端测试
│  ├─ worker.js               # Cloudflare Worker 入口
│  └─ wrangler.jsonc          # Cloudflare 部署配置
├─ docs/                      # 项目维护文档
├─ deploy.md                  # 部署说明
├─ LICENSE
└─ README.md
```

## 本地运行

需要 Node.js 24.18.1 与 pnpm 11.18.0；版本权威分别是
`site/.node-version` 和 `site/package.json`。

```bash
cd site
corepack install --global pnpm@11.18.0
pnpm install --frozen-lockfile
pnpm dev
```

启动后访问终端显示的本地地址。

## License

本项目采用 [GNU General Public License v3.0](LICENSE) 发布。
