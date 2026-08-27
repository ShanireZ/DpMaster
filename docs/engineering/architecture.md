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
| `site/src/config/site.ts` | Public representation identity only: DP大师 brand, canonical origin, and language. Client endpoints and sidebar-only copy live in separate modules that the semantic route graph cannot reach. |
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

Known deep links are physical prerendered HTML assets. Cloudflare Workers Static Assets uses `run_worker_first: true`, so every request reaches `worker.js` before the `ASSETS` binding serves a matching file; this is required because an asset-first match would bypass same-URL content negotiation. The binding uses `404-page` for anything unmatched, returning the themed `404.html` with a real HTTP 404. See root [deploy.md](../../deploy.md) for the platform contract.

For a registered public `GET` or `HEAD`, `worker/content-negotiation.js` selects HTML or Markdown from `Accept`; HTML wins equal preferences and the Worker returns 406 when both supported media types are explicitly unacceptable. Under RFC 9110, every non-`q` media parameter participates in representation matching regardless of whether it appears before or after `q`, while `q` is recognized in either position. Empty semicolon parameter slots are permitted, but a bare parameter, whitespace around `=`, an empty value, or an unterminated quoted value makes that media-range member invalid. Invalid members are ignored rather than accepted; if a broken quoted member precedes another syntactically valid media range, parsing recovers at that later member instead of discarding the whole header. Markdown is fetched only through a distinct internal asset URL, so its ETag and static-asset cache key cannot collide with HTML. Both representations add `Vary: Accept`, alternate links, `nosniff`, and the approved public `Content-Signal`; direct requests to the internal prefix return 404. `HEAD` executes the same matrix and headers but never returns a body. APIs, ordinary assets, the internal specimen, and unknown routes pass through the Worker routing layer without content negotiation. The internal path mapper and public signal live in `publicWebContract.ts`, preventing the generator, discovery files, and Worker from silently diverging.

# SEO And Accessibility

`pageMeta.ts` is the shared route metadata authority. The site has a single origin, so every public page canonicalizes to itself and publishes no language alternates at all. Unknown routes are non-indexable and deliberately have no canonical link.

`seoHead.ts` renders the same head contract at build time that `RouteMeta` maintains after client navigation: title, description, citable abstract, robots, canonical, Open Graph, Twitter, and a Schema.org graph. Every indexable page includes Organization and WebSite nodes and states `isAccessibleForFree`; the WebSite node declares a `SearchAction` pointing at the real `?q=` problem search. Lessons add Course/LearningResource/TechArticle with `educationalUse` and an `EducationalAudience`, family pages add CollectionPage plus an ItemList of their ready lessons, other pages add WebPage, and routes with hierarchy add BreadcrumbList. Course duration is deliberately not declared: there is no trustworthy source for it, so `hasCourseInstance` is omitted rather than fabricated.

`site/scripts/generate-seo.mjs` writes the checked-in baseline for `sitemap.xml`, `robots.txt`, `llms.txt`, `route-summaries.json`, and the home-route head inside `index.html`; the prerender step regenerates the four discovery files into the build output. All of them derive from the same 47-path catalog contract: home, seven families, 37 completed lessons, method, and problem index. Sitemap entries are sorted by canonical URL. `semantic-source-graph.mjs` follows the real SSR injection chain from `entry-server.tsx` through the static application/providers and route tree, together with metadata roots and the exact route page, lesson, and family-art modules.

Every parsed source contribution is reduced to a runtime AST projection, so TypeScript-only syntax and formatting do not advance public-content evidence while runtime-bearing TypeScript parameter properties and optional-chain semantics remain visible. Intrinsic-element event handlers, refs, and keys are excluded because React never serializes them, while custom-component props and SSR-bearing attributes remain. `config/site.ts` has a narrower public projection containing only the brand and origin fields that can change a public representation. That projection follows immutable local bindings, object spreads, and static computed keys; mutable, escaped, cyclic, aliased, globally patched, or dynamic dependencies fail closed. Mixed shell modules use an AST-rooted closure: the route-rendering JSX plus local declarations, every runtime module-evaluation edge, root/program synchronous calls, proven synchronous callbacks, constructors, tagged templates, and render-phase mutations reached by lexical binding identity are hashed. Known asynchronous platform and Promise callbacks remain outside the public digest; callback timing that cannot be proved fails closed. The closure tracks stable direct/container aliases, destructuring defaults, shallow-copy nested references without conflating direct object-rest copies, later property aliases, call/getter-created targets, control-flow scopes, class helpers, route/outlet bindings, and patched or replaced React/global static owners. Local and relative callable or constructable targets are pulled into the closure; unsupported dynamic targets, imported member receivers, arbitrary external mutations, and other ambiguous writes fail closed.

Effect-only callbacks are excluded only when the callee has one exact, stable React-effect origin through named, default, namespace, member, or destructured aliases. Mixed aliases, reassigned hooks, patched React namespaces, and same-named local helpers are never pruned as effects. Runtime import edges remain while declaration- and specifier-level type-only edges, unselected import siblings, object-spread copies, and JSX attribute names do not leak in. The graph deliberately prunes surrounding navigation/feedback, unrelated route pages, client-only analytics/theme/motion controllers, and the generated evidence module. Public representation identity is structurally isolated in `config/site.ts`; client endpoints and sidebar-only copy are in modules reachable only through pruned branches.

Each route records a versioned, line-ending-neutral SHA-256 digest of that graph. An unchanged digest preserves the previous value; changed content uses the precise Git commit or working-tree timestamp of a semantically changed projection and must advance. During a digest-schema migration, the current projector is applied to historical sources at the previous `lastmod`: a clean committed semantic edit advances, while an edit confined to a pruned client branch does not. Version 15 first added byte-exact binary assets, semantic CSS queries, nested global-container provenance, top-level dynamic imports, mixed-target validation, and the audited runtime package graph. Version 16 narrowed that package evidence to the trusted package roots actually reachable from each route, then required every selected root and recursively reachable registry package to have an exact importer entry, snapshot, package record, and integrity in `pnpm-lock.yaml`; missing evidence failed closed. Version 17 follows named and aliased module-evaluation callbacks, prunes statically false literal branches and loops, includes selected React `lazy` package imports, requires canonical SHA-256/384/512 SRI specifically under `resolution.integrity`, rejects conditional/nested/factory/getter global-container stores, and rejects every semantically reachable package outside the audited allowlist. Version 18 resolves module-evaluation callbacks by lexical binding identity, including nested declarations, shadowing, member-held callbacks, and the latest unconditional reassignment; it executes callbacks only at proven awaited Promise continuation points, prunes unmatched literal `switch` cases, and follows selected React `lazy` relative child modules without expanding unrelated deferred catalog entries. Registry evidence additionally requires the corresponding 32/48/64-byte digest; empty, malformed, short, sibling, or unsupported-algorithm values fail closed. Potential global containers stored through `Object`/`Reflect` or collection mutators fail closed in both runtime and public-config projections, as do class getter-derived dynamic call targets. This schema refinement preserves all 47 route times at the dependency-maintenance commit `2026-08-23T21:18:04+08:00`, because it changes evidence precision without adding a later semantic source change. Earlier rejected schemas admitted shared client effects, sidebar-only copyright copy, imported sibling noise, type-only noise, incomplete execution/scope/mutation context, lossy UTF-8 decoding of binary assets, or an unpinned or route-unrelated trusted runtime package graph. `llms.txt` is grouped by family and declares the same-URL Markdown interface and approved public content signal. `robots.txt` explicitly allows both retrieval and training crawlers; a release is incomplete until Cloudflare AI Crawl Control is confirmed not to inject a conflicting managed no-train block. `pnpm check:seo` rejects generated-artifact drift, including a hand-edited `index.html` head.

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
