---
type: Product Scope
title: DP大师 Product Scope
description: User-facing DP大师 scope, routes, learning flow, and explicit exclusions.
tags: [product, routes, scope]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/src/app/App.tsx
  - site/src/pages/Home.tsx
  - site/src/pages/MethodPage.tsx
  - site/src/pages/ProblemsPage.tsx
  - site/src/pages/AboutPage.tsx
  - site/src/lib/pageMeta.ts
  - site/public/sitemap.xml
---

# Promise

DP大师 teaches dynamic programming through precise explanations, editable visualizations, and small interactive games. The teaching promise is "精讲 + 重交互": explain the state and transition, then let the learner change inputs and watch the DP table, tree, or bitmask state recompute.

# Routes

The current app routes are:

| Route | Purpose |
|---|---|
| `/` | Home and family entry surface. |
| `/method` | General DP method: state design, transitions, order, optimization, debugging. |
| `/problems` | Searchable Luogu problem index. |
| `/about` | Site explanation, usage guide, source/license notes. |
| `/part/:pid` | DP family page. |
| `/part/:pid/:slug` | Specific type lesson page. |
| `*` | DP-themed not-found page. |

Invalid family/type routes and unregistered content should fall through to `NotFound`.

All seven family pages and all 37 completed lesson pages are public and indexable. Lesson titles follow `课程名 · 家族名 · DP大师`; every public route has a canonical URL, description, and Open Graph metadata. The complete discovery surface is published through `robots.txt` and a generated 48-URL sitemap.

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

* A 背包 DP - 装包大师.
* B 线性 DP - LIS 接龙.
* C 区间 DP - 合并石子.
* D 矩阵 DP - 幂次加速器.
* E 换根 DP - 换根巡礼.
* F 树形 DP - 舞会邀请.
* G 状压 DP - 棋盘布阵.

The shared shell supports keyboard navigation with a skip link, explicit current-page state, route announcements, an accessible mobile drawer, visible focus styles, and reduced-motion behavior. Visualization playback uses the same reset/previous/play-pause/next/progress/speed semantics across full and compact layouts.

# Exclusions

DP大师 does not copy full Luogu statements. It uses summaries, teaching commentary, and links to the original problem pages. It does not ship paid or redistribution-prohibited assets.
