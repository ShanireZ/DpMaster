# DpMaster

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg?style=flat-square)](LICENSE)
![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react&logoColor=black)
![Vite 8](https://img.shields.io/badge/Vite-8-646CFF.svg?style=flat-square&logo=vite&logoColor=white)
![TypeScript 7](https://img.shields.io/badge/TypeScript-7-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)
[![Deploy: Cloudflare Workers](https://img.shields.io/badge/deploy-Cloudflare%20Workers-success.svg?style=flat-square)](https://dp.round1.cc)
![Lessons: 37/37 ready](https://img.shields.io/badge/lessons-37%2F37%20ready-success.svg?style=flat-square)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文(TW)](README.zh-TW.md) | [日本語](README.ja.md)

DpMaster（DP 大师）是面向 C++ 算法学习者的中文交互式动态规划课程。七个 DP 家族、37 节课程结合讲解、可编辑演示、家族游戏、代码示例和可搜索的洛谷题目索引。学习无需账号。

[打开课程](https://dp.round1.cc) · [贡献者文档](docs/index.md) · [部署说明](deploy.md)

## 本地运行

使用 [site/.node-version](site/.node-version) 指定的 Node 版本与 [site/package.json](site/package.json) 指定的 pnpm 版本。全局安装 Node 和 pnpm；本项目直接使用 pnpm，不使用 Corepack。

```bash
cd site
pnpm install --frozen-lockfile
pnpm dev
```

打开 Vite 输出的本地地址。从 `site/` 运行 `pnpm verify` 执行完整本地检查；前提与覆盖范围见[验证说明](docs/operations/verification.md)。

## 公开接口

React/Vite 静态构建为每个公开 URL 提供预渲染 HTML 及等价的 `text/markdown` 表示。交互演示与游戏在浏览器中完成水合。部署仅有一个规范来源 [dp.round1.cc](https://dp.round1.cc) 和一个 Cloudflare Worker。

[课程目录](site/src/data/catalog.ts) 管理课程标识与顺序。课程中的 `ExampleCard` / `Exercise` 条目拥有题目语料；[problems.ts](site/src/data/problems.ts) 为生成文件。教学内容、界面标签和引用的产品标题保留中文。每份文档统一使用其预期语言；各翻译版本保留自己的语言与导航。

## 许可证

按 [GNU 通用公共许可证 v3.0](LICENSE) 分发，本文以 `GPL-3.0` 表述。随附字体保留 [assets/brand/fonts](assets/brand/fonts) 中各自的许可证文件。
