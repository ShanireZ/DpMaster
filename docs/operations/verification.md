---
type: Runbook
title: Verification Runbook
description: Build, lint, route, documentation, and deployment verification gates for DP大师.
tags: [operations, verification, build]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/package.json
  - docs/
  - deploy.md
---

# Local Checks

Run from `site/`:

```bash
npm run verify
```

`npm run verify` checks generated content and SEO artifacts, runs Node tests and zero-warning lint, builds with TypeScript/Vite, writes EdgeOne fallback artifacts, runs Chromium against that production `dist` through `vite preview`, and enforces the asset budget.

The current closure gate contains 133 Node tests and nine Chromium tests.

To rerun only the browser smoke suite after a production build:

```bash
npm run build
npm run test:browser
```

Install its local Chromium runtime once with `npx playwright install chromium`. CI installs Chromium and its system dependencies before invoking the complete verification gate.

Algorithm verification runs directly on Node 24's TypeScript stripping support and includes:

* independent small-case oracles or property checks for the primary outcome of all 39 public solver entry points that return the 38 named `*Result` Interfaces;
* weighted and node-weighted reroot distance oracles, weighted in/out and eccentricity checks, exhaustive exact-`Q` root-connected tree-knapsack subsets, and exhaustive tree path, distance-two, independent-set, and dominating-set checks;
* legality or consistency invariants for key witness and auxiliary fields, including `chosen`, `guards`, `layout`, representative path/index/argument fields, and child-before-parent orders;
* input-domain regressions for malformed reroot trees and invalid tree-DP weights or limits, plus large-value sentinel regressions for dominating set and bitmask cover;
* equality between public `solve` results and recorded teaching runs, immutable domain-event snapshots, and final teaching-Adapter projections;
* exact enumeration of all 29 teaching Adapters plus architecture guards that prevent games/readouts from importing internal Modules, deriving answers from teaching frames, or restoring private duplicate solvers;
* a brand contract that rejects legacy product-facing names.

Pure TypeScript Modules imported by Node tests must use explicit `.ts` extensions for their runtime relative imports.

# SEO And Accessibility Checks

`npm run check:seo` verifies that route metadata remains complete and that `robots.txt` and the 48-URL sitemap match the catalog. When routes or lesson readiness change, run `npm run seo:generate` and review the generated URL set before committing it.

The browser gate runs nine Chromium tests against the built production `dist` through a strict, non-reused `vite preview` server. Seven route tests directly open `/`, `/part/a`, `/part/a/01`, `/method`, and `/part/g/plug`, then exercise live client navigation and keyboard focus. They check HTTP route status where applicable, title/description/canonical/Open Graph metadata, one visible `h1`, route announcements, current-page semantics, initial-load focus, changed-route focus, and skip-link focus. Every one of the seven route tests also requires zero console errors and zero uncaught page errors.

Two game tests cover the catalog-owned lazy boundary and shared runtime contracts. Pack must keep its chunk absent before the near-viewport gate, auto-load without a manual control, replay the currently displayed seed into the identical round with cleared interaction state, and preserve exact played/matched totals across replay, shuffle, difficulty, and reveal. BitBoard must suppress duplicate completion counts and rearm after clear. These tests do not provide arbitrary-seed entry or pixel-regression coverage.

For browser-facing changes, keep those automated samples representative and manually inspect additional affected routes when needed. Confirm:

* Each route has the expected title, description, canonical URL, Open Graph URL/type, and exactly one `h1`.
* Completed lesson titles follow `课程名 · 家族名 · DP大师` and use Open Graph type `article`.
* Sidebar and breadcrumb current-page semantics follow navigation.
* Initial page load does not steal focus; later keyboard route navigation focuses `#main-content` without scrolling, and activating the first-target skip link focuses the same element.
* The mobile navigation exposes `aria-expanded`, references `#site-sidebar`, and has a keyboard-operable close scrim.
* With `prefers-reduced-motion: reduce`, smooth scrolling is disabled and transitions/animations are reduced without hiding content.
* The browser console reports no errors; no uncaught page error occurs.

# Playback And Caption Checks

Playback architecture/state tests require every transport to import the deep shared player, use full or compact `PlaybackControls`, and avoid local transport/timer state. Safe-caption tests cover the approved teaching vocabulary plus scripted, attributed, unsupported, and malformed inputs. A recursive `site/src` guard permits raw HTML sinks only at the exact existing Shiki and KaTeX Adapter counts; all playback captions must pass through `SafeCaption`.

Game runtime tests prove equal displayed seeds produce equal rounds for all six random games and require every round builder to accept an injected `RandomSource`. Architecture tests require all seven games that display totals to use `useRoundStats` and its duplicate-safe record/rearm lifecycle.

# Documentation Checks

For OKF bundle changes:

* `docs/index.md` and `docs/log.md` are reserved files.
* Every other `docs/**/*.md` file must start with YAML frontmatter.
* Every concept frontmatter must include a non-empty `type`.
* Prefer `title`, `description`, `tags`, and `timestamp`.
* Use bundle-root links such as `/product/scope.md` for concept links where possible.

# Content Consistency Checks

When changing lesson content:

* Treat `site/src/data/catalog.ts` as the family/type/route authority.
* Run `npm run check:content` to compare generated `site/src/data/problems.ts` against lesson cards.
* Check that all official problem IDs still use P/B prefixes.
* Verify formula strings contain no Chinese inside TeX.
* Do not reintroduce `opacity: 0` entrance animations.

# Deployment Checks

Deployment checks live in root [deploy.md](../../deploy.md). At minimum after deployment:

* Open a normal route and a direct deep link.
* Submit a feedback test.
* Confirm the receipt is `ok: true`, `status: logged`, and includes a `requestId`.
* Check Cloudflare or EdgeOne logs for the matching `feedback_received` event.
* If webhook variables are configured, check the matching `feedback_webhook` status and DingTalk delivery separately; forwarding failure does not change the browser's received state.
* For a rate-limit smoke test, use a disposable source and confirm request 11 inside 30 minutes returns 429 with `Retry-After`. The built-in limiter is per edge instance; configure the same policy at platform level when global enforcement is required.
