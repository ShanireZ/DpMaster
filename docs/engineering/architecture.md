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
  - resource: ../../site/src/lib/hashNavigation.ts
  - resource: ../../site/src/lib/publicRoutes.ts
  - resource: ../../site/src/lib/discovery.ts
  - resource: ../../site/src/lib/seoHead.ts
  - resource: ../../site/src/config/site.ts
  - resource: ../../site/src/analytics/
  - resource: ../../site/src/components/seo/RouteMeta.tsx
  - resource: ../../site/src/entry-server.tsx
  - resource: ../../site/worker.js
  - resource: ../../site/worker/
  - resource: ../../site/scripts/build.mjs
  - resource: ../../site/scripts/prerender.mjs
  - resource: ../../site/scripts/markdown-representation.mjs
  - resource: ../../site/worker/content-negotiation.js
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
| `site/src/config/site.ts` | DP大师 brand, copyright holders, and the single production host with its same-origin API endpoints. |
| `site/src/lib/publicRoutes.ts` | Catalog-derived authority for 47 public routes plus one separately declared internal prerender specimen. |
| `site/src/lib/publicWebContract.ts` | Shared internal representation paths and public `Content-Signal` contract consumed by generation, discovery, and the Worker. |
| `site/src/lib/pageMeta.ts` | Pure route metadata authority for titles, summaries, canonicals, breadcrumbs, and indexing policy. |
| `site/src/lib/seoHead.ts` | Server/client shared head and JSON-LD generation. |
| `site/src/lib/discovery.ts` | Sitemap, robots (including the AI-crawler group), llms.txt, and route-summary generation. |
| `site/src/components/seo/RouteMeta.tsx` | Applies route metadata to the live document head after client navigation. |
| `site/src/analytics/` | First-party event interface; posts to the same-origin endpoint on the production host only. |
| `site/src/entry-server.tsx` | React 19 static rendering entry used by the prerender build. |
| `site/scripts/build.mjs` | Builds the client plus an isolated production SSR bundle, then prerenders. |
| `site/scripts/prerender.mjs` | Writes route HTML, one Markdown representation per public route, 404.html, and discovery files. |
| `site/scripts/markdown-representation.mjs` | Deterministic DOM-based projection from locally prerendered semantic HTML to compact Markdown with a normalized legal heading outline; it is not a second hand-written content source. |
| `site/worker/` | Shared feedback, privacy-bounded first-party analytics, and egress-probe cores. |
| `site/worker.js` + `site/worker/` | The single deployment adapter: public-page content negotiation plus same-origin feedback, analytics, and egress diagnostics. |

# Routing And Splitting

`App.tsx` uses `BrowserRouter` in the browser and `MemoryRouter` through `StaticApp` at build time. `site/src/data/catalog.ts` owns literal lazy imports for every lesson and family game, so opening one lesson or family should not eagerly load unrelated lessons or games.

Family art is a second, deliberately smaller registry: `familyArtRegistry.ts` maps each A–G `partId` to a lazy module implementing `HeroArt`, `JourneyArt`, and `LessonPlate`. It never owns course titles, slugs, order, or copy. Every ready lesson has a unique semantic plate; `PartGlyph` remains a defensive unknown-family fallback rather than a production course path.

`pnpm build` produces a single `site/dist/` for `dp.round1.cc`. Vite first emits the client and an isolated production SSR entry; a fresh Node production process calls React 19 `prerender()` for 47 public paths plus one internal specimen and writes both clean-URL variants. In the same pass, each public document's semantic `<main>` is traversed with JSDOM and projected into an internal `/_representations/markdown/**` asset. This preserves content structure and static visual descriptions while excluding scripts, controls, navigation noise, hidden state, and the internal specimen. The prerender pass resolves the current lesson and family-art module synchronously, injects that route's exact CSS and module-preload graph, and rejects unresolved streamed Suspense segments. Before `hydrateRoot`, the browser explicitly prepares the current route view, current lesson module, and current family-art module while leaving the prerendered DOM visible; hydration therefore attaches to identical content instead of replacing the page with a lazy fallback. The client does not eagerly import unrelated route views or family art after hydration. If a deployment changes a hashed dynamic asset while an older document is still open, `preloadRecovery.ts` handles Vite's `vite:preloadError` before route imports run and performs at most one recovery reload per build and path. Development-only empty roots still use `createRoot`.

Family pages wrap the catalog-owned lazy game in `DeferredGame`. Its one-way `IntersectionObserver` gate starts rendering about 400 px before the game reaches the viewport; there is no manual load path, and browsers without IntersectionObserver render immediately. Creating a lazy React element does not invoke its dynamic import until the gate renders it, so the game JS/CSS chunks stay off the initial family-page request when the section is not yet near.

Problem metadata is extracted from lesson JSX by `site/scripts/generate-problems.mjs`. Run `pnpm content:generate` after changing `ExampleCard` or `Exercise`; `pnpm check:content` rejects drift.

All 29 teaching solver surfaces are Adapters over the algorithm boundary: public callers import `site/src/algorithms/<domain>/index.ts`, while the adjacent internal Module owns the sole transition loop and emits UI-neutral domain events. Teaching code records those events and adapts them to `VizModel`; games and ordinary readouts use public typed results and must not import internal Modules or recover answers from teaching frames. Executable architecture tests enumerate the 29 Adapters. The 39 public solver entry points that return one of the 38 named `*Result` Interfaces each have an independent small-case oracle or property for their primary outcome. Key witness and auxiliary fields also have explicit legality or consistency invariants, including `chosen`, `guards`, and `layout`, plus representative path, index, argument, and ordering fields; this coverage claim does not extend to every incidental field. The UI-only `solveRerootDistanceBrute` helper returns an anonymous object and is outside this 39-entry named-Result count.

Known deep links are physical prerendered HTML assets. Cloudflare Workers Static Assets serves them and uses `404-page` for anything unmatched, returning the themed `404.html` with a real HTTP 404. See root [deploy.md](../../deploy.md) for the platform contract.

For a registered public `GET` or `HEAD`, `worker/content-negotiation.js` selects HTML or Markdown from `Accept`; HTML wins equal preferences and the Worker returns 406 when both supported media types are explicitly unacceptable. Markdown is fetched only through a distinct internal asset URL, so its ETag and static-asset cache key cannot collide with HTML. Both representations add `Vary: Accept`, alternate links, `nosniff`, and the approved public `Content-Signal`; direct requests to the internal prefix return 404. `HEAD` executes the same matrix and headers but never returns a body. APIs, ordinary assets, the internal specimen, and unknown routes bypass negotiation. The internal path mapper and public signal live in `publicWebContract.ts`, preventing the generator, discovery files, and Worker from silently diverging.

# SEO And Accessibility

`pageMeta.ts` is the shared route metadata authority. The site has a single origin, so every public page canonicalizes to itself and publishes no language alternates at all. Unknown routes are non-indexable and deliberately have no canonical link.

`seoHead.ts` renders the same head contract at build time that `RouteMeta` maintains after client navigation: title, description, citable abstract, robots, canonical, Open Graph, Twitter, and a Schema.org graph. Every indexable page includes Organization and WebSite nodes and states `isAccessibleForFree`; the WebSite node declares a `SearchAction` pointing at the real `?q=` problem search. Lessons add Course/LearningResource/TechArticle with `educationalUse` and an `EducationalAudience`, family pages add CollectionPage plus an ItemList of their ready lessons, other pages add WebPage, and routes with hierarchy add BreadcrumbList. Course duration is deliberately not declared: there is no trustworthy source for it, so `hasCourseInstance` is omitted rather than fabricated.

`site/scripts/generate-seo.mjs` writes the checked-in baseline for `sitemap.xml`, `robots.txt`, `llms.txt`, `route-summaries.json`, and the home-route head inside `index.html`; the prerender step regenerates the four discovery files into the build output. All of them derive from the same 47-path catalog contract: home, seven families, 37 completed lessons, method, and problem index. Sitemap entries are sorted by canonical URL. `semantic-source-graph.mjs` follows the real SSR injection chain from `entry-server.tsx` through the static application/providers and route tree, together with metadata roots and the exact route page, lesson, and family-art modules. Mixed shell modules contribute only their semantic route-rendering JSX slices; the graph deliberately prunes surrounding navigation/feedback, unrelated route pages, client-only analytics/theme/motion controllers, and the generated evidence module. Each route records a versioned, line-ending-neutral SHA-256 digest of that graph. Clean sources use the latest Git commit timestamp, dirty sources use the newest source-file modification timestamp, an unchanged digest preserves the previous value, and generation fails when changed content lacks strictly advancing source evidence; changing the digest schema preserves the prior content timestamp only when no newer source evidence exists, while a simultaneous real content update adopts its later timestamp. `llms.txt` is grouped by family and declares the same-URL Markdown interface and approved public content signal. `robots.txt` explicitly allows both retrieval and training crawlers; a release is incomplete until Cloudflare AI Crawl Control is confirmed not to inject a conflicting managed no-train block. `pnpm check:seo` rejects generated-artifact drift, including a hand-edited `index.html` head.

# Analytics

The client exposes a bounded event vocabulary for page views/404s, Web Vitals, lesson starts/completions, problem search/outbound actions, feedback lifecycle, and safe client-error reports. Events are posted to the same-origin endpoint only when the browser is on the exact production hostname, and the Worker writes accepted events to Analytics Engine. Cloudflare Web Analytics / RUM is injected by the Cloudflare proxy; neither the source nor the prerender output may add a manual beacon, and `pnpm check:html` fails the build if one appears in any HTML document. See [Analytics and Alerting](/operations/analytics.md).

The receiver rejects cross-origin requests, unknown providers/events, non-JSON or oversized payloads, clips strings and primitive metadata, and logs no cookies, account identifiers, contact fields, or payment data. Analytics failures are swallowed by the client and cannot block lessons, games, or feedback.

The shell owns cross-route accessibility and positioning behavior: a keyboard-visible skip link targets the focusable `main`, navigation uses current-page semantics, the mobile drawer exposes expanded/controlled state and a real close button, and a polite status region announces route changes. After a client pathname change, the shell focuses `#main-content` with `preventScroll`; a previous-path guard leaves focus unchanged on initial load. Ordinary route changes reset scroll immediately so the new page cannot inherit an in-flight smooth animation from the old page. Fragment navigation is coordinated through `hashNavigation.ts`: it waits for the new DOM, applies the target's declared scroll margin or the sticky-topbar fallback, and briefly corrects layout shifts unless the learner starts another pointer, wheel, touch, or keyboard interaction. Lesson headings receive their stable fragment IDs when the hydrated lesson outline is built, so `TypePage` repeats the fragment restore after those dynamic targets exist. Reduced-motion preference turns requested smooth fragment moves into immediate positioning.

The production-preview browser gate runs against the `dist` build through the custom strict preview server. It covers direct prerendered deep links, hydration, live client navigation, metadata/current-page state, fragment offsets on desktop and mobile, one representative lesson from every family, immediate cross-page scroll reset, real 404 behavior, focus, deferred game loading, seeded replay and round-stat lifecycles, and rejects browser console or page errors. Node contracts separately inspect the origin, the discovery artifacts, and the build output.

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
