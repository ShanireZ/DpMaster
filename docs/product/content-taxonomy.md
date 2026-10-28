---
type: Product Reference
title: DP Content Taxonomy
description: The current A-G family taxonomy and type inventory used by the live site.
tags: [content, taxonomy, routing]
status: stable
generated: { by: openai/codex, at: 2026-10-28T05:02:08.368Z }
sources:
  - resource: ../../site/src/data/catalog.ts
---

# Authority

[The catalog](../../site/src/data/catalog.ts) is the sole authority for family IDs, lesson slugs, order, readiness, titles, and lazy imports. Use the implemented order below. Course labels remain Chinese in the product; this table explains their meaning for contributors.

| Code | Route ID | Family | Lessons | Motif |
|---|---|---|---:|---|
| A | `a` | Knapsack DP | 9 | Capacity containers and cells |
| B | `b` | Linear DP | 7 | Indexed sequence and predecessors |
| C | `c` | Interval DP | 5 | Endpoints, nested arches, splits |
| D | `d` | Matrix DP | 2 | Coordinate planes and transformations |
| E | `e` | Reroot DP | 4 | Moving root and two-way tree flow |
| F | `f` | Tree DP | 5 | Fixed root and subtree aggregation |
| G | `g` | Bitmask DP | 5 | Sparse states and contours |

The catalog also registers one game per family. Public URLs derive from [PUBLIC_PATHS](../../site/src/lib/publicRoutes.ts), so navigation, discovery, and prerendering consume the same identities.

Problem reuse is intentional: a problem has a main teaching position and may recur as review, practice, or a cross-reference. The generated problem index can therefore contain more entries than unique Luogu IDs. See [problem policy](problem-policy.md).
