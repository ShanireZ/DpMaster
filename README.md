# DpMaster

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg?style=flat-square)](LICENSE)
![React 19](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react&logoColor=black)
![Vite 8](https://img.shields.io/badge/Vite-8-646CFF.svg?style=flat-square&logo=vite&logoColor=white)
![TypeScript 7](https://img.shields.io/badge/TypeScript-7-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)
[![Deploy: Cloudflare Workers](https://img.shields.io/badge/deploy-Cloudflare%20Workers-success.svg?style=flat-square)](https://dp.round1.cc)
![Lessons: 37/37 ready](https://img.shields.io/badge/lessons-37%2F37%20ready-success.svg?style=flat-square)

DpMaster is a Chinese interactive dynamic-programming course for C++ algorithm learners. Its 37 lessons across seven DP families combine explanations, editable demos, family games, code examples, and a searchable Luogu problem index. Learning requires no account.

[Open the course](https://dp.round1.cc) · [Contributor documentation](docs/index.md) · [Deployment](deploy.md)

## Run locally

Use the Node version in [site/.node-version](site/.node-version) and pnpm version in [site/package.json](site/package.json). Install Node and pnpm globally; the project uses pnpm directly without Corepack.

```bash
cd site
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. Run `pnpm verify` from `site/` for the complete local gate; see [verification](docs/operations/verification.md) for prerequisites and scope.

## Public interface

The static React/Vite build serves prerendered HTML and an equivalent `text/markdown` representation at each public URL. Interactive demos and games hydrate in the browser. The deployment has one canonical origin, [dp.round1.cc](https://dp.round1.cc), and one Cloudflare Worker.

The [catalog](site/src/data/catalog.ts) owns lesson identity and order. Lesson `ExampleCard` / `Exercise` entries own the problem corpus; [problems.ts](site/src/data/problems.ts) is generated. Teaching content, UI labels, and quoted product titles remain Chinese. Each document uses its intended language consistently; translated editions retain their own languages and navigation.

## License

Distributed under the [GNU General Public License v3.0](LICENSE), described here as `GPL-3.0`. Bundled fonts retain their own license files in [assets/brand/fonts](assets/brand/fonts).
