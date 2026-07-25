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
  - site/src/components/dp-engine/playback/
  - site/src/components/dp-engine/SafeCaption.tsx
  - site/src/lib/highlighter.ts
  - site/src/components/ui/Math.tsx
  - site/src/components/games/runtime/
  - site/src/lib/pageMeta.ts
  - site/src/lib/publicRoutes.ts
  - site/src/lib/discovery.ts
  - site/src/lib/seoHead.ts
  - site/src/config/site.ts
  - site/src/analytics/
  - site/src/components/seo/RouteMeta.tsx
  - site/src/entry-server.tsx
  - site/scripts/build-regions.mjs
  - site/scripts/prerender.mjs
  - site/scripts/generate-seo.mjs
  - site/tests/browser/
---

# Stack

DP大师 is a prerendered static React app in `site/`. Build-time React rendering supplies complete HTML for every public route; the browser hydrates that HTML so interactive visualizations, games, feedback, and client navigation work normally.

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
| `site/src/algorithms/` | Pure typed public results, UI-neutral domain events, and the single transition Implementation behind all 29 teaching solver surfaces. |
| `site/src/components/demos/` | Editable teaching Adapters that project domain events into visual traces. |
| `site/src/components/dp-engine/` | Shared visualization, playback, controls, and safe-caption rendering. |
| `site/src/components/games/` | One game per family; games consume public result Interfaces instead of teaching frames. |
| `site/src/components/games/runtime/` | Shared deterministic random source, round statistics, lazy audio, and viewport gate for the seven games. |
| `site/src/config/site.ts` | DP大师 brand, the two production hosts, regional build identity, and analytics-provider configuration. |
| `site/src/lib/publicRoutes.ts` | Catalog-derived authority for the 48 prerendered and indexable routes. |
| `site/src/lib/pageMeta.ts` | Pure host-aware route metadata authority for titles, summaries, canonicals, alternates, breadcrumbs, and indexing policy. |
| `site/src/lib/seoHead.ts` | Server/client shared head and JSON-LD generation. |
| `site/src/lib/discovery.ts` | Region-aware sitemap, robots, llms.txt, and route-summary generation. |
| `site/src/components/seo/RouteMeta.tsx` | Applies route metadata to the live document head after client navigation. |
| `site/src/analytics/` | Provider-neutral event interface; selects Cloudflare or Tencent EdgeOne from the runtime host. |
| `site/src/entry-server.tsx` | React 19 static rendering entry used by the prerender build. |
| `site/scripts/build-regions.mjs` | Builds the Cloudflare and EdgeOne clients plus isolated production SSR bundles. |
| `site/scripts/prerender.mjs` | Writes route HTML, 404.html, and per-region discovery files. |
| `site/functions/` | Shared feedback and privacy-bounded first-party analytics endpoint cores. |
| `site/worker.js` | Current Cloudflare Workers entry. |
| `site/scripts/postbuild.mjs` | EdgeOne feedback/analytics API and real-404 catch-all generator. |

# Routing And Splitting

`App.tsx` uses `BrowserRouter` in the browser and `MemoryRouter` through `StaticApp` at build time. `site/src/data/catalog.ts` owns literal lazy imports for every lesson and family game, so opening one lesson or family should not eagerly load unrelated lessons or games.

`npm run build` produces `site/dist/cloudflare/` for `dp.betaoi.cc` and `site/dist/edgeone/` for `dp.betaoi.cn`. For each region, Vite first emits the client and an isolated production SSR entry; a fresh Node production process calls React 19 `prerender()` for all 48 paths and writes both clean-URL variants. The client checks whether `#root` already has content and uses `hydrateRoot`; development-only empty roots still use `createRoot`.

Family pages wrap the catalog-owned lazy game in `DeferredGame`. Its one-way `IntersectionObserver` gate starts rendering about 400 px before the game reaches the viewport; there is no manual load path, and browsers without IntersectionObserver render immediately. Creating a lazy React element does not invoke its dynamic import until the gate renders it, so the game JS/CSS chunks stay off the initial family-page request when the section is not yet near.

Problem metadata is extracted from lesson JSX by `site/scripts/generate-problems.mjs`. Run `npm run content:generate` after changing `ExampleCard` or `Exercise`; `npm run check:content` rejects drift.

All 29 teaching solver surfaces are Adapters over the algorithm boundary: public callers import `site/src/algorithms/<domain>/index.ts`, while the adjacent internal Module owns the sole transition loop and emits UI-neutral domain events. Teaching code records those events and adapts them to `VizModel`; games and ordinary readouts use public typed results and must not import internal Modules or recover answers from teaching frames. Executable architecture tests enumerate the 29 Adapters. The 39 public solver entry points that return one of the 38 named `*Result` Interfaces each have an independent small-case oracle or property for their primary outcome. Key witness and auxiliary fields also have explicit legality or consistency invariants, including `chosen`, `guards`, and `layout`, plus representative path, index, argument, and ordering fields; this coverage claim does not extend to every incidental field. The UI-only `solveRerootDistanceBrute` helper returns an anonymous object and is outside this 39-entry named-Result count.

Known deep links are physical prerendered HTML assets. Cloudflare uses Static Assets `404-page`; EdgeOne uses the generated catch-all for API paths and unmatched navigation. Both platforms return the themed `404.html` with a real HTTP 404 for unknown paths. See root [deploy.md](../../deploy.md) for the platform contracts.

# SEO And Accessibility

`pageMeta.ts` is the shared route metadata authority. It receives the active `SiteConfig`, so each regional build self-canonicalizes while both builds publish reciprocal `zh-Hans`, `zh-CN`, and `x-default` alternates. Unknown routes are non-indexable and deliberately have no canonical or hreflang links.

`seoHead.ts` renders the same head contract at build time that `RouteMeta` maintains after client navigation: title, description, citable abstract, robots, canonical, hreflang, Open Graph, Twitter, and a Schema.org graph. Every indexable page includes Organization and WebSite nodes; lessons add Course, family pages add CollectionPage, other pages add WebPage, and routes with hierarchy add BreadcrumbList.

`site/scripts/generate-seo.mjs` writes the international checked-in baseline. The regional prerender step regenerates `sitemap.xml`, `robots.txt`, `llms.txt`, and `route-summaries.json` inside each deployment target. All four artifacts derive from the same 48-path catalog contract: home, seven families, 37 completed lessons, method, problem index, and about. `npm run check:seo` rejects drift.

# Regional Analytics

The client exposes one small event vocabulary: page views plus feedback opened, submitted, succeeded, and failed. The international provider injects the configured Cloudflare Web Analytics beacon only on the exact `.cc` production hostname and also posts the bounded events to the same-origin analytics endpoint. The China provider loads no overseas analytics script; EdgeOne access logs supply request-level traffic analysis, while the same-origin endpoint records the limited client-route events.

The receiver rejects cross-origin requests, unknown providers/events, non-JSON or oversized payloads, clips strings and primitive metadata, and logs no cookies, account identifiers, contact fields, or payment data. Analytics failures are swallowed by the client and cannot block lessons, games, or feedback.

The shell owns cross-route accessibility behavior: a keyboard-visible skip link targets the focusable `main`, navigation uses current-page semantics, the mobile drawer exposes expanded/controlled state and a real close button, and a polite status region announces route changes. After a client pathname change, the shell focuses `#main-content` with `preventScroll`; a previous-path guard leaves focus unchanged on initial load. Global reduced-motion styles keep content visible while shortening transitions and animations.

The production-preview browser gate runs against the international `dist/cloudflare` build through the custom strict preview server. It covers direct prerendered deep links, hydration, live client navigation, metadata/current-page state, real 404 behavior, focus, deferred game loading, seeded replay and round-stat lifecycles, and rejects browser console or page errors. Node contracts separately inspect both regional origins and build outputs.

# Playback And Captions

Every playback transport uses the typed `useStepPlayer` contract and the shared `PlaybackControls` Adapter. Reset, previous, play/pause, next, progress, speed, keyboard shortcuts, and polite status semantics are common; carriers select only the full or compact visual variant.

Playback caption carriers render through `SafeCaption`. It converts only `b`, `strong`, `code`, `br`, and approved single-class `span` elements into React nodes; unsupported, attributed, scripted, or malformed markup remains inert text. A recursive architecture guard scans all JavaScript and TypeScript under `site/src` and permits raw HTML sinks only at the exact existing KaTeX and Shiki Adapter counts in `Math.tsx` and `CodeBlock.tsx`; playback carriers have no raw sink.

# Game Runtime

Game identities, titles, and dynamic imports remain exclusively in `catalog.ts`; the runtime is infrastructure, not another registry. The seven games share:

* `useRoundSeed` for a browser-generated unsigned seed, with `createSeededRandom(seed)` and `randomInt` driving each round builder through an injected `RandomSource`. The six random games display the numeric seed and can replay that currently displayed seed at the current difficulty; there is no arbitrary-seed input contract. Executable checks prove equal seeds produce equal pack, sequence, stone, exponent, reroot-tree, and party rounds.
* `useRoundStats` for duplicate-safe played/matched totals across all seven games. `record(matched)` increments totals at most once until `start()` rearms the guard while preserving aggregate totals. Random-game lifecycle actions and displayed-seed replay start a fresh countable round; BitBoard records one legal completed layout and only clear, difficulty change, or reset rearms completion counting.
* `playGameTone` for best-effort Web Audio. One `AudioContext` is created only after an unmuted interaction and reused; unsupported or blocked audio never affects game correctness.

Game rules, difficulty tables, visuals, and win conditions stay local to each game.

# Formula And Code Rendering

Formula rendering goes through `site/src/components/ui/Math.tsx`, which calls `katex.renderToString` directly. Do not reintroduce `react-katex`; older testing found incompatibility with the installed KaTeX version.

Formula content must not include Chinese inside TeX strings. Put Chinese labels in adjacent HTML.

Shiki is lazy-loaded via `site/src/lib/highlighter.ts` with only C++ and two GitHub themes. Do not replace it with a broad eager highlighter import.

# Commands

Run commands from `site/`:

```bash
npm ci
npm run dev
npm run lint
npm run build
```

The root workspace is not the package root.
