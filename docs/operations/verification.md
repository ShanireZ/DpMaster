---
type: Runbook
title: Verification Runbook
description: Build, lint, route, documentation, and deployment verification gates for DP大师.
tags: [operations, verification, build]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
sources:
  - resource: ../../site/package.json
  - resource: ../
  - resource: ../../deploy.md
---

# Local Checks

Run from `site/`:

```bash
pnpm verify
```

`pnpm verify` first runs `pnpm baseline:check`, then checks generated content and discovery artifacts, runs Node and React tests, runs TypeScript-aware zero-warning lint with deprecated API rejection, builds and prerenders `dist/` with TypeScript 7, verifies the HTML contract (page count plus no manual Web Analytics beacon), runs the browser matrix, and enforces the asset budget on `dist/assets`.

To rerun only the browser smoke suite after a production build:

```bash
pnpm build
pnpm test:browser
```

Install the local browser runtimes once with `pnpm exec playwright install chromium firefox webkit`. CI installs all three engines and their system dependencies before invoking the complete verification gate. Chromium runs all browser specifications; Firefox and WebKit run tests tagged `@cross-browser`.

Algorithm verification runs directly on the repository-pinned Node runtime's TypeScript stripping support and includes:

* independent small-case oracles or property checks for the primary outcome of all 39 public solver entry points that return the 38 named `*Result` Interfaces;
* weighted and node-weighted reroot distance oracles, weighted in/out and eccentricity checks, exhaustive exact-`Q` root-connected tree-knapsack subsets, and exhaustive tree path, distance-two, independent-set, and dominating-set checks;
* legality or consistency invariants for key witness and auxiliary fields, including `chosen`, `guards`, `layout`, representative path/index/argument fields, and child-before-parent orders;
* input-domain regressions for malformed reroot trees and invalid tree-DP weights or limits, plus large-value sentinel regressions for dominating set and bitmask cover;
* equality between public `solve` results and recorded teaching runs, immutable domain-event snapshots, and final teaching-Adapter projections;
* exact enumeration of all 29 teaching Adapters plus architecture guards that prevent games/readouts from importing internal Modules, deriving answers from teaching frames, or restoring private duplicate solvers;
* a brand contract that rejects legacy product-facing names.

Pure TypeScript Modules imported by Node tests must use explicit `.ts` extensions for their runtime relative imports.

# SEO And Accessibility Checks

`pnpm check:seo` verifies the 47-path catalog, route metadata, the checked-in international sitemap/robots baseline, real `llms.txt`, 47-entry route summaries, and Git-derived `lastmod` data. It also checks the source contracts for dual-region outputs, React prerender/hydration, route CSS injection, host-aware metadata, removed-route 404 behavior, and host-aware metadata. When routes, lesson readiness, or route-owned source files change, run `pnpm seo:generate` and review the generated files before committing them.

The browser gate runs Chromium against built `dist/cloudflare` through a strict, non-reused custom preview server. Route tests directly open `/`, `/part/a`, `/part/a/01`, `/method`, and `/part/g/plug`, then exercise live client navigation and keyboard focus. They check HTTP status, prerendered HTML, absence of pending streamed-Suspense placeholders, route CSS at first paint, hydration without errors, CLS below `0.05`, title/description/abstract/canonical/hreflang/Open Graph/JSON-LD metadata, one visible `h1`, route announcements, current-page semantics, initial-load focus, changed-route focus, and skip-link focus. Navigation-positioning tests click a representative lesson outline in each of the seven families, restore a direct lesson fragment, verify the mobile outline and an ordinary family-page fragment, and require a changed route to reset old-page scroll immediately. An unknown path must return 404 with `noindex,nofollow`, no canonical, and the themed not-found heading.

Two game tests cover the catalog-owned lazy boundary and shared runtime contracts. Pack must keep its chunk absent before the near-viewport gate, auto-load without a manual control, replay the currently displayed seed into the identical round with cleared interaction state, and preserve exact played/matched totals across replay, shuffle, difficulty, and reveal. BitBoard must suppress duplicate completion counts and rearm after clear. These tests do not provide arbitrary-seed entry or pixel-regression coverage.

For browser-facing changes, keep those automated samples representative and manually inspect additional affected routes when needed. Confirm:

* Each route has the expected title, description, abstract, self-referencing canonical, zero hreflang links, Open Graph URL/type, structured-data graph, and exactly one `h1`.
* Completed lesson titles follow `课程名 · 家族名 · DP大师` and use Open Graph type `article`.
* Every HTML/sitemap/robots/llms artifact uses `https://dp.round1.cc` and no retired domain survives anywhere in the build.
* An unknown URL returns HTTP 404, has `noindex,nofollow`, and has no canonical.
* Sidebar and breadcrumb current-page semantics follow navigation.
* Initial page load does not steal focus; later keyboard route navigation focuses `#main-content` without scrolling, and activating the first-target skip link focuses the same element.
* Lesson outline clicks, direct fragment URLs, and history navigation place the target below the sticky top bar on desktop and mobile; ordinary route changes start at the top instead of inheriting a smooth scroll from the prior page.
* The mobile navigation exposes `aria-expanded`, references `#site-sidebar`, and has a keyboard-operable close scrim.
* With `prefers-reduced-motion: reduce`, smooth scrolling is disabled and transitions/animations are reduced without hiding content.
* The browser console reports no errors; no uncaught page error occurs.

# Playback And Caption Checks

Playback architecture/state tests require every transport to import the deep shared player, use full or compact `PlaybackControls`, and avoid local transport/timer state. Safe-caption tests cover the approved teaching vocabulary plus scripted, attributed, unsupported, and malformed inputs. A recursive `site/src` guard permits raw HTML sinks only at the exact existing Shiki and KaTeX Adapter counts; all playback captions must pass through `SafeCaption`.

Game runtime tests prove equal displayed seeds produce equal rounds for all six random games and require every round builder to accept an injected `RandomSource`. Architecture tests require all seven games that display totals to use `useRoundStats` and its duplicate-safe record/rearm lifecycle.

# Documentation Checks

For OKF bundle changes:

* `docs/index.md` is the bundle index and declares `okf_version: "0.2"`; no chronological `log.md` is maintained.
* Every other `docs/**/*.md` file must start with YAML frontmatter.
* Every concept frontmatter must include non-empty `type`, current lifecycle `status`, and `generated.by` / `generated.at`.
* Use `sources[].resource` for provenance; do not restore v0.1 `timestamp` or custom `source_paths`.
* Use bundle-root links such as `/product/scope.md` for concept links where possible.
* Keep only durable current truth. Task progress, completed plans, resolved drift, and review history belong in `handoff/` or Git history.

# Content Consistency Checks

When changing lesson content:

* Treat `site/src/data/catalog.ts` as the family/type/route authority.
* Run `pnpm check:content` to compare generated `site/src/data/problems.ts` against lesson cards.
* Check that all official problem IDs still use P/B prefixes.
* Verify formula strings contain no Chinese inside TeX.
* Do not reintroduce `opacity: 0` entrance animations.

# Deployment Checks

Deployment checks live in root [deploy.md](../../deploy.md). At minimum after deployment:

* Open a normal route and a direct deep link on both domains.
* Confirm each domain self-canonicalizes and links to both regional variants.
* Request a made-up path and confirm HTTP 404 plus `noindex,nofollow`.
* Submit a feedback test.
* Confirm `POST /api/analytics` returns 204 for a valid same-origin event and inspect the platform log.
* Confirm the receipt is `ok: true`, `status: delivered`, and includes a `requestId`.
* Check the Cloudflare Worker logs for the matching `feedback_received` event.
* Check the matching `feedback_webhook` status and destination message. Missing configuration or forwarding failure must return 503/502 and must not show a successful browser receipt.
* For a rate-limit smoke test, use a disposable source and confirm request 11 inside 30 minutes returns 429 with `Retry-After`. The built-in limiter is per edge instance; configure the same policy at platform level when global enforcement is required.
