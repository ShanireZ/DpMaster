---
type: System Architecture
title: Site Architecture
description: Current React/Vite architecture, routing, package stack, and performance strategy.
tags: [engineering, react, vite, architecture]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/package.json
  - site/src/app/App.tsx
  - site/src/data/catalog.ts
  - site/src/algorithms/
  - site/src/lib/highlighter.ts
  - site/src/components/ui/Math.tsx
  - site/src/components/games/runtime/
  - site/src/lib/pageMeta.ts
  - site/src/components/seo/RouteMeta.tsx
  - site/scripts/generate-seo.mjs
---

# Stack

DP大师 is a static React app in `site/`.

Key dependencies actively used by current source:

* React 19 and React DOM 19.
* Vite 8 and TypeScript.
* React Router 7.
* KaTeX for formula rendering.
* Shiki for C++ highlighting.
* Lucide React for icons.
* `@fontsource` packages for JetBrains Mono and Space Grotesk.

The manifest intentionally keeps only dependencies imported by the current source. Do not document react-three-fiber, react-bits, anime.js, D3, React Flow, GSAP, Motion, or `react-katex` as installed unless the package manifest changes.

# Directory Roles

| Path | Role |
|---|---|
| `site/src/app/App.tsx` | Router registration and app shell. |
| `site/src/pages/` | Home, family pages, type page host, method, problems, about, not-found. |
| `site/src/data/catalog.ts` | Family/type metadata, route order, and lazy lesson/game implementations. |
| `site/src/data/problems.ts` | Generated searchable problem-index projection. |
| `site/src/content/` | Type lesson content and the problem-corpus source of truth. |
| `site/src/algorithms/` | Pure typed algorithm results, domain events, and the single transition Implementation for migrated algorithms. |
| `site/src/components/demos/` | Editable teaching Adapters that project domain events into visual traces. |
| `site/src/components/dp-engine/` | Shared visualization engine. |
| `site/src/components/games/` | One game per family; games consume public result Interfaces instead of teaching frames. |
| `site/src/components/games/runtime/` | Shared deterministic random source, round statistics, lazy audio, and viewport gate for the seven games. |
| `site/src/lib/pageMeta.ts` | Pure route metadata authority for titles, descriptions, canonical URLs, and Open Graph values. |
| `site/src/components/seo/RouteMeta.tsx` | Applies route metadata to the live document head after client navigation. |
| `site/functions/` | Shared feedback endpoint core and optional CF Pages wrapper. |
| `site/worker.js` | Current Cloudflare Workers entry. |
| `site/scripts/postbuild.mjs` | EdgeOne SPA fallback and feedback edge function generator. |

# Routing And Splitting

`App.tsx` uses `BrowserRouter` and lazy routes. `site/src/data/catalog.ts` owns literal lazy imports for every lesson and family game, so opening one lesson or family should not eagerly load unrelated lessons or games.

Family pages wrap the catalog-owned lazy game in `DeferredGame`. Its one-way `IntersectionObserver` gate starts rendering about 400 px before the game reaches the viewport; there is no manual load path, and browsers without IntersectionObserver render immediately. Creating a lazy React element does not invoke its dynamic import until the gate renders it, so the game JS/CSS chunks stay off the initial family-page request when the section is not yet near.

Problem metadata is extracted from lesson JSX by `site/scripts/generate-problems.mjs`. Run `npm run content:generate` after changing `ExampleCard` or `Exercise`; `npm run check:content` rejects drift.

For migrated algorithms, public callers import only `site/src/algorithms/<domain>/index.ts`. The adjacent internal Module owns the sole transition loop and can emit UI-neutral domain events. Teaching code may record those events and adapt them to `VizModel`; games and ordinary readouts must not import internal Modules or recover answers from the last frame.

Deep links require hosting support. See root [deploy.md](../../deploy.md) for the Cloudflare and EdgeOne contracts.

# SEO And Accessibility

`pageMeta.ts` is the shared route metadata authority. `RouteMeta` updates the document title, description, canonical URL, and Open Graph tags after every client-side navigation. `index.html` provides a complete homepage fallback for clients that do not execute JavaScript.

`site/scripts/generate-seo.mjs` derives public discovery files from the same catalog. It currently writes 48 canonical URLs to `public/sitemap.xml`: the home page, seven family pages, 37 completed lessons, and the method, problem-index, and about pages. `public/robots.txt` allows indexing and advertises that sitemap. `npm run check:seo` rejects metadata or generated-file drift.

The shell owns cross-route accessibility behavior: a keyboard-visible skip link targets the focusable `main`, navigation uses current-page semantics, the mobile drawer exposes expanded/controlled state and a real close button, and a polite status region announces route changes. Global reduced-motion styles keep content visible while shortening transitions and animations.

# Game Runtime

Game identities, titles, and dynamic imports remain exclusively in `catalog.ts`; the runtime is infrastructure, not another registry. The seven games share:

* `browserRandom` and `randomInt` for bounded generation; `createSeededRandom` makes mechanics reproducible in executable checks.
* `useRoundStats` for duplicate-safe played/matched totals. A reveal records at most once until shuffle, difficulty change, or reset starts the next round.
* `playGameTone` for best-effort Web Audio. One `AudioContext` is created only after an unmuted interaction and reused; unsupported or blocked audio never affects game correctness.

Game rules, difficulty tables, visuals, and win conditions stay local to each game.

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
