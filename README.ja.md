# DpMaster

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg?style=flat-square)](LICENSE)
![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react&logoColor=black)
![Vite 8](https://img.shields.io/badge/Vite-8-646CFF.svg?style=flat-square&logo=vite&logoColor=white)
![TypeScript 7](https://img.shields.io/badge/TypeScript-7-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)
[![Deploy: Cloudflare Workers](https://img.shields.io/badge/deploy-Cloudflare%20Workers-success.svg?style=flat-square)](https://dp.round1.cc)
![Lessons: 37/37 ready](https://img.shields.io/badge/lessons-37%2F37%20ready-success.svg?style=flat-square)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文(TW)](README.zh-TW.md) | [日本語](README.ja.md)

DpMaster は C++ でアルゴリズムを学ぶ人のための、中国語の対話型動的計画法コースです。七つの DP 分野にわたる 37 レッスンで、解説、編集可能なデモ、分野別ゲーム、コード例、検索可能な Luogu の問題索引を提供します。学習にアカウントは不要です。

[コースを開く](https://dp.round1.cc) · [貢献者向けドキュメント](docs/index.md) · [デプロイ](deploy.md)

## ローカルで実行

Node は [site/.node-version](site/.node-version)、pnpm は [site/package.json](site/package.json) に指定されたバージョンを使用します。Node と pnpm をグローバルにインストールしてください。Corepack は使わず、pnpm を直接実行します。

```bash
cd site
pnpm install --frozen-lockfile
pnpm dev
```

Vite が表示するローカル URL を開きます。完全なローカル検証は `site/` で `pnpm verify` を実行してください。前提条件と検証範囲は[検証手順](docs/operations/verification.md)を参照してください。

## 公開インターフェース

React/Vite の静的ビルドは各公開 URL に事前レンダリングした HTML と等価な `text/markdown` 表現を提供します。対話型デモとゲームはブラウザーでハイドレーションされます。デプロイ先は単一の正規オリジン [dp.round1.cc](https://dp.round1.cc) と一つの Cloudflare Worker です。

[カタログ](site/src/data/catalog.ts)がレッスンの識別子と順序を管理します。各レッスンの `ExampleCard` / `Exercise` が問題データの正本で、[problems.ts](site/src/data/problems.ts) は生成ファイルです。教材、UI ラベル、引用する製品名は中国語のままです。各文書はその言語で統一し、翻訳版もそれぞれの言語とナビゲーションを維持します。

## ライセンス

[GNU General Public License v3.0](LICENSE) に基づいて配布し、本書では `GPL-3.0` と表記します。同梱フォントは [assets/brand/fonts](assets/brand/fonts) 内の各ライセンスに従います。
