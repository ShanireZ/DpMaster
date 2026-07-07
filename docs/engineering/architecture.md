---
type: System Architecture
title: Site Architecture
description: Current React/Vite architecture, routing, package stack, and performance strategy.
tags: [engineering, react, vite, architecture]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/package.json
  - site/src/app/App.tsx
  - site/src/content/registry.tsx
  - site/src/lib/highlighter.ts
  - site/src/components/ui/Math.tsx
---

# Stack

DpMaster is a static React app in `site/`.

Key dependencies actively used by current source:

* React 19 and React DOM 19.
* Vite 8 and TypeScript.
* React Router 7.
* KaTeX for formula rendering.
* Shiki for C++ highlighting.
* Lucide React for icons.
* `@fontsource` packages for JetBrains Mono and Space Grotesk.

The manifest also includes GSAP, `@gsap/react`, Motion, `react-katex`, and `@types/react-katex`, but current `src/` code does not import them. Do not document react-three-fiber, react-bits, anime.js, D3, or React Flow as installed unless the package manifest changes. Older planning docs mentioned them as options, not current dependencies.

# Directory Roles

| Path | Role |
|---|---|
| `site/src/app/App.tsx` | Router registration and app shell. |
| `site/src/pages/` | Home, family pages, type page host, method, problems, about, not-found. |
| `site/src/data/parts.ts` | Family/type metadata and readiness. |
| `site/src/data/problems.ts` | Searchable problem index. |
| `site/src/content/` | Type lesson content, lazy-loaded by route. |
| `site/src/components/demos/` | Editable DP demos and solvers. |
| `site/src/components/dp-engine/` | Shared visualization engine. |
| `site/src/components/games/` | One game per family. |
| `site/functions/` | Shared feedback endpoint core and optional CF Pages wrapper. |
| `site/worker.js` | Current Cloudflare Workers entry. |
| `site/scripts/postbuild.mjs` | EdgeOne SPA fallback and feedback edge function generator. |

# Routing And Splitting

`App.tsx` uses `BrowserRouter` and lazy routes. Type content is lazy-loaded per `site/src/content/registry.tsx` key (`${pid}/${slug}`), so opening one lesson should not eagerly load every lesson.

Deep links require hosting support. See root [deploy.md](../../deploy.md) for the Cloudflare and EdgeOne contracts.

# Formula And Code Rendering

Formula rendering goes through `site/src/components/ui/Math.tsx`, which calls `katex.renderToString` directly. Do not reintroduce `react-katex`; older testing found incompatibility with the installed KaTeX version.

Formula content must not include Chinese inside TeX strings. Put Chinese labels in adjacent HTML.

Shiki is lazy-loaded via `site/src/lib/highlighter.ts` with only C++ and two GitHub themes. Do not replace it with a broad eager highlighter import.

# Commands

Run commands from `site/`:

```bash
npm install
npm run dev
npm run lint
npm run build
```

The root workspace is not the package root.
