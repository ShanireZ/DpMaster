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

`npm run verify` checks generated content and SEO artifacts, runs Node tests and zero-warning lint, builds with TypeScript/Vite, writes EdgeOne fallback artifacts, and enforces the asset budget.

Algorithm verification runs directly on Node 24's TypeScript stripping support and includes:

* exhaustive small-case cross-checks for 01 knapsack, LIS, and stone merge;
* reroot distance sums against the quadratic oracle and tree independent set against subset enumeration;
* equality between public `solve` results and recorded teaching runs;
* teaching-frame dimensions, references, immutable snapshots, and final-result projection;
* architecture guards that prevent games from importing internal Modules or restoring private duplicate solvers;
* a brand contract that rejects legacy product-facing names.

Pure TypeScript Modules imported by Node tests must use explicit `.ts` extensions for their runtime relative imports.

# SEO And Accessibility Checks

`npm run check:seo` verifies that route metadata remains complete and that `robots.txt` and the 48-URL sitemap match the catalog. When routes or lesson readiness change, run `npm run seo:generate` and review the generated URL set before committing it.

For browser-facing changes, check at least the home page, one family, one completed lesson, and one static page. Confirm:

* Each route has the expected title, description, canonical URL, Open Graph URL/type, and exactly one `h1`.
* Completed lesson titles follow `课程名 · 家族名 · DP大师` and use Open Graph type `article`.
* Sidebar and breadcrumb current-page semantics follow navigation.
* The first keyboard target is the skip link and activating it focuses `#main-content`.
* The mobile navigation exposes `aria-expanded`, references `#site-sidebar`, and has a keyboard-operable close scrim.
* With `prefers-reduced-motion: reduce`, smooth scrolling is disabled and transitions/animations are reduced without hiding content.
* The browser console reports no errors or warnings.

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
