# DP大師

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg?style=flat-square)](LICENSE)
![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react&logoColor=black)
![Vite 8](https://img.shields.io/badge/Vite-8-646CFF.svg?style=flat-square&logo=vite&logoColor=white)
![TypeScript 7](https://img.shields.io/badge/TypeScript-7-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)
[![Deploy: Cloudflare Workers](https://img.shields.io/badge/deploy-Cloudflare%20Workers-success.svg?style=flat-square)](https://dp.round1.cc)
![Lessons: 37/37 ready](https://img.shields.io/badge/lessons-37%2F37%20ready-success.svg?style=flat-square)

DP大師是面向 C++ 演算法學習者的動態規劃交互式學習網站，將課程講解、可編輯演示、小遊戲、程式碼範例和練習題整合在同一套學習體驗中。

[dp.round1.cc](https://dp.round1.cc)

## 主要特點

- 課程按 DP 模型組織，配有推導、圖解、程式碼和練習。
- 演示支援修改輸入並逐步觀察狀態轉移。
- 家族小遊戲將抽象模型轉化為可操作的訓練。
- 題目索引支援搜尋、篩選和可分享的 URL 狀態。
- 無需帳號，打開網頁即可學習。
- 每個公開頁面可在同一 URL 按 `Accept: text/markdown` 獲取去除交互噪音的 Markdown 表示，便於檢索、引用與代理讀取。
- Web Platform Baseline 以 Newly 作為開發能力上限，生產建置顯式面向 Widely，並由 Chromium、Firefox、WebKit 與發佈前實機抽檢驗證。

## 本機執行

需要 Node.js 26.10.0 與 pnpm 12.6.0，版本權威分別是 `site/.node-version` 和 `site/package.json`。

```bash
cd site
# pnpm 由全域獨立安裝，見 ../Init_essential.md（本機不裝 corepack）
pnpm install --frozen-lockfile
pnpm dev
```

啟動後訪問終端機顯示的本機位址。

## License

本專案採用 [GNU General Public License v3.0](LICENSE) 發佈。
