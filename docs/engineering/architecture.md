---
type: System Architecture
title: Site Architecture
description: Current React/Vite architecture, routing, package stack, and performance strategy.
tags: [engineering, react, vite, architecture]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
sources:
  - resource: ../../site/package.json
  - resource: ../../site/src/app/App.tsx
  - resource: ../../site/src/data/catalog.ts
  - resource: ../../site/src/algorithms/
  - resource: ../../site/src/components/dp-engine/playback/
  - resource: ../../site/src/components/dp-engine/SafeCaption.tsx
  - resource: ../../site/src/components/art/familyArtRegistry.ts
  - resource: ../../site/src/components/art/FamilyArtSlots.tsx
  - resource: ../../site/src/lib/highlighter.ts
  - resource: ../../site/src/components/ui/Math.tsx
  - resource: ../../site/src/components/games/runtime/
  - resource: ../../site/src/lib/pageMeta.ts
  - resource: ../../site/src/lib/publicRoutes.ts
  - resource: ../../site/src/lib/discovery.ts
  - resource: ../../site/src/lib/seoHead.ts
  - resource: ../../site/src/config/site.ts
  - resource: ../../site/src/analytics/
  - resource: ../../site/src/components/seo/RouteMeta.tsx
  - resource: ../../site/src/entry-server.tsx
  - resource: ../../site/scripts/build-regions.mjs
  - resource: ../../site/scripts/prerender.mjs
  - resource: ../../site/scripts/generate-seo.mjs
  - resource: ../../site/tests/browser/
---

# Stack

DP大师 is a prerendered static React app in `site/`. Build-time React rendering supplies complete HTML for every public route; the browser hydrates that HTML so interactive visualizations, games, feedback, and client navigation work normally.

Key dependencies actively used by current source:

* React 19 and React DOM 19.
* Vite 8 and TypeScript 7.
* React Router 7.
* KaTeX for formula rendering.
* Shiki for C++ highlighting.
* Lucide React for icons.
* Motion for shell and component interaction, plus lazily loaded GSAP for the home-page sequence.
* Web Vitals for the bounded runtime performance events.
* `@fontsource` packages for JetBrains Mono and Space Grotesk.

The manifest intentionally keeps only dependencies imported by current source. Do not document react-three-fiber, react-bits, anime.js, D3, React Flow, or `react-katex` as installed unless the package manifest changes.

# Directory Roles

| Path | Role |
|---|---|
| `site/src/app/App.tsx` | Router registration and app shell. |
| `site/src/pages/` | Home, family pages, type page host, method, problems, and not-found. |
| `site/src/data/catalog.ts` | Family/type metadata, route order, and lazy lesson/game implementations. |
| `site/src/data/problems.ts` | Generated searchable problem-index projection. |
| `site/src/content/` | Type lesson content and the problem-corpus source of truth. |
| `site/src/algorithms/` | Pure typed public results, UI-neutral domain events, and the single transition Implementation behind all 29 teaching solver surfaces. |
| `site/src/components/demos/` | Editable teaching Adapters that project domain events into visual traces. |
| `site/src/components/art/familyArtRegistry.ts` | Per-family lazy A–G art modules for category heroes, journey maps, and lesson semantic plates. |
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

Family art is a second, deliberately smaller registry: `familyArtRegistry.ts` maps each A–G `partId` to a lazy module implementing `HeroArt`, `JourneyArt`, and `LessonPlate`. It never owns course titles, slugs, order, or copy. Every ready lesson has a unique semantic plate; `PartGlyph` remains a defensive unknown-family fallback rather than a production course path.

`pnpm build` produces `site/dist/cloudflare/` for `dp.betaoi.cc` and `site/dist/edgeone/` for `dp.betaoi.cn`. For each region, Vite first emits the client and an isolated production SSR entry; a fresh Node production process calls React 19 `prerender()` for all 47 paths and writes both clean-URL variants. The prerender pass resolves the current lesson and family-art module synchronously, injects that route's exact CSS and module-preload graph, and rejects unresolved streamed Suspense segments. Before `hydrateRoot`, the browser explicitly prepares the current route view, current lesson module, and current family-art module while leaving the prerendered DOM visible; hydration therefore attaches to identical content instead of replacing the page with a lazy fallback. The client does not eagerly import unrelated route views or family art after hydration. If a deployment changes a hashed dynamic asset while an older document is still open, `preloadRecovery.ts` handles Vite's `vite:preloadError` before route imports run and performs at most one recovery reload per build and path. Development-only empty roots still use `createRoot`.

Family pages wrap the catalog-owned lazy game in `DeferredGame`. Its one-way `IntersectionObserver` gate starts rendering about 400 px before the game reaches the viewport; there is no manual load path, and browsers without IntersectionObserver render immediately. Creating a lazy React element does not invoke its dynamic import until the gate renders it, so the game JS/CSS chunks stay off the initial family-page request when the section is not yet near.

Problem metadata is extracted from lesson JSX by `site/scripts/generate-problems.mjs`. Run `pnpm content:generate` after changing `ExampleCard` or `Exercise`; `pnpm check:content` rejects drift.

All 29 teaching solver surfaces are Adapters over the algorithm boundary: public callers import `site/src/algorithms/<domain>/index.ts`, while the adjacent internal Module owns the sole transition loop and emits UI-neutral domain events. Teaching code records those events and adapts them to `VizModel`; games and ordinary readouts use public typed results and must not import internal Modules or recover answers from teaching frames. Executable architecture tests enumerate the 29 Adapters. The 39 public solver entry points that return one of the 38 named `*Result` Interfaces each have an independent small-case oracle or property for their primary outcome. Key witness and auxiliary fields also have explicit legality or consistency invariants, including `chosen`, `guards`, and `layout`, plus representative path, index, argument, and ordering fields; this coverage claim does not extend to every incidental field. The UI-only `solveRerootDistanceBrute` helper returns an anonymous object and is outside this 39-entry named-Result count.

Known deep links are physical prerendered HTML assets. Cloudflare uses Static Assets `404-page`; EdgeOne uses the generated catch-all for API paths and unmatched navigation. Both platforms return the themed `404.html` with a real HTTP 404 for unknown paths. See root [deploy.md](../../deploy.md) for the platform contracts.

# SEO And Accessibility

`pageMeta.ts` is the shared route metadata authority. It receives the active `SiteConfig`, so each regional build self-canonicalizes while both builds publish reciprocal `zh-Hans`, `zh-CN`, and `x-default` alternates. Unknown routes are non-indexable and deliberately have no canonical or hreflang links.

`seoHead.ts` renders the same head contract at build time that `RouteMeta` maintains after client navigation: title, description, citable abstract, robots, canonical, hreflang, Open Graph, Twitter, and a Schema.org graph. Every indexable page includes Organization and WebSite nodes; lessons add Course, family pages add CollectionPage, other pages add WebPage, and routes with hierarchy add BreadcrumbList.

`site/scripts/generate-seo.mjs` writes the international checked-in baseline. The regional prerender step regenerates `sitemap.xml`, `robots.txt`, `llms.txt`, and `route-summaries.json` inside each deployment target. All four artifacts derive from the same 47-path catalog contract: home, seven families, 37 completed lessons, method, and problem index. `pnpm check:seo` rejects drift.

# Regional Analytics

The client exposes a bounded event vocabulary for page views/404s, Web Vitals, lesson starts/completions, problem search/outbound actions, feedback lifecycle, and safe client-error reports. The international provider injects the configured Cloudflare Web Analytics beacon only on the exact `.cc` production hostname and writes accepted first-party events to Analytics Engine. The China prerender build statically injects the same Web Analytics beacon exactly once into every EdgeOne HTML document, including the real 404; EdgeOne access logs still supply platform request analysis, while the same-origin endpoint writes limited client-route events to structured function logs. A postbuild contract rejects missing, duplicate, or cross-region static snippets. See [Analytics and Alerting](/operations/analytics.md).

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
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm build
```

The root workspace is not the package root.
