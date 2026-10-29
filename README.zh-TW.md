# DpMaster

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg?style=flat-square)](LICENSE)
![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react&logoColor=black)
![Vite 8](https://img.shields.io/badge/Vite-8-646CFF.svg?style=flat-square&logo=vite&logoColor=white)
![TypeScript 7](https://img.shields.io/badge/TypeScript-7-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)
[![Deploy: Cloudflare Workers](https://img.shields.io/badge/deploy-Cloudflare%20Workers-success.svg?style=flat-square)](https://dp.round1.cc)
![Lessons: 37/37 ready](https://img.shields.io/badge/lessons-37%2F37%20ready-success.svg?style=flat-square)

[English](README.md) | [简体中文](README.zh-CN.md) | [繁體中文(TW)](README.zh-TW.md) | [日本語](README.ja.md)

DpMaster（DP 大師）是面向 C++ 演算法學習者的中文互動式動態規劃課程。七個 DP 家族、37 堂課結合解說、可編輯示範、家族遊戲、程式碼範例與可搜尋的洛谷題目索引。學習無需帳號。

[開啟課程](https://dp.round1.cc) · [貢獻者文件](docs/index.md) · [部署說明](deploy.md)

## 本機執行

使用 [site/.node-version](site/.node-version) 指定的 Node 版本與 [site/package.json](site/package.json) 指定的 pnpm 版本。全域安裝 Node 和 pnpm；本專案直接使用 pnpm，不使用 Corepack。

```bash
cd site
pnpm install --frozen-lockfile
pnpm dev
```

開啟 Vite 輸出的本機網址。從 `site/` 執行 `pnpm verify` 進行完整本機檢查；前置條件與涵蓋範圍見[驗證說明](docs/operations/verification.md)。

## 公開介面

React/Vite 靜態建置為每個公開 URL 提供預先轉譯的 HTML 及等價的 `text/markdown` 表示。互動示範與遊戲在瀏覽器中完成水合。部署僅有一個標準來源 [dp.round1.cc](https://dp.round1.cc) 和一個 Cloudflare Worker。

[課程目錄](site/src/data/catalog.ts) 管理課程識別與順序。課程中的 `ExampleCard` / `Exercise` 項目擁有題目語料；[problems.ts](site/src/data/problems.ts) 為產生的檔案。教學內容、介面標籤與引用的產品標題保留中文。每份文件統一使用其預期語言；各翻譯版本保留自己的語言與導覽。

## 授權

依 [GNU 通用公共授權條款 v3.0](LICENSE) 散布，本文以 `GPL-3.0` 表述。隨附字型保留 [assets/brand/fonts](assets/brand/fonts) 中各自的授權檔案。
