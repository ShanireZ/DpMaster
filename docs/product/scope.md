---
type: Product Scope
title: DpMaster Product Scope
description: User-facing DpMaster scope, routes, learning flow, and explicit exclusions.
tags: [product, routes, scope]
status: stable
generated: { by: openai/codex, at: 2026-10-28T05:02:08.368Z }
sources:
  - resource: ../../site/src/app/App.tsx
  - resource: ../../site/src/pages/Home.tsx
  - resource: ../../site/src/pages/MethodPage.tsx
  - resource: ../../site/src/pages/ProblemsPage.tsx
  - resource: ../../site/src/lib/pageMeta.ts
  - resource: ../../site/public/sitemap.xml
---

# Promise

DpMaster teaches dynamic programming through precise explanations, editable visualizations, and small interactive games. The teaching promise is precise explanation with rich interaction: explain the state and transition, then let the learner change inputs and watch the DP table, tree, or bitmask state recompute.

# Routes

The current app routes are:

| Route | Purpose |
|---|---|
| `/` | Home and family entry surface. |
| `/method` | General DP method: state design, transitions, order, optimization, debugging. |
| `/problems` | Searchable Luogu problem index. |
| `/part/:pid` | DP family page. |
| `/part/:pid/:slug` | Specific type lesson page. |
| `*` | DP-themed not-found page. |

Invalid family/type routes and unregistered content should fall through to `NotFound`.

All seven family pages and all 37 completed lesson pages are public and indexable. Together with the home and two static pages, the build prerenders 47 HTML routes and hydrates them in the browser, so games, feedback, and client navigation remain interactive. Lesson titles follow `课程名 · 家族名 · DP大师`.

The site publishes to one origin, `https://dp.round1.cc`, from a single Cloudflare Worker. Every public page canonicalizes to itself and publishes no language alternates, plus Git-derived `lastmod`, route summaries, a shared Open Graph image, Course/LearningResource/TechArticle or CollectionPage JSON-LD, and Breadcrumb JSON-LD where applicable. One sitemap, one robots file — carrying an explicit allow group for generative-engine crawlers — one family-grouped `llms.txt`, and one machine-readable route-summary file. Each registered public URL also negotiates an actively generated `text/markdown` representation from the same prerendered semantic content; browser-only controls and hidden/internal routes are excluded, while headings, prose, code, formulas, tables, visual descriptions, and public links remain. Unknown paths use the themed `NotFound` page with an HTTP 404 response, `noindex,nofollow`, and no canonical.

# Learning Surface

Every type page should provide:

* Concept motivation from a concrete small case.
* State definition and transition derivation.
* Hand calculation steps.
* At least one editable visualization.
* 2-3 Luogu-native examples.
* 3 practice problems when the native problem pool supports it.
* Previous/next navigation.

Every family has one registered game:

* A Knapsack DP — packing game.
* B Linear DP — LIS sequence game.
* C Interval DP — stone merging.
* D Matrix DP — exponentiation accelerator.
* E Reroot DP — root tour.
* F Tree DP — party invitation.
* G Bitmask DP — board arrangement.

The shared shell supports keyboard navigation with a skip link, explicit current-page state, route announcements, an accessible mobile drawer, visible focus styles, and reduced-motion behavior. Visualization playback uses the same reset/previous/play-pause/next/progress/speed semantics across full and compact layouts.

# Exclusions

DpMaster does not copy full Luogu statements. It uses summaries, teaching commentary, and links to the original problem pages. It does not ship paid or redistribution-prohibited assets.
