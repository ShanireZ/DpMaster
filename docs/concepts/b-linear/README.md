---
type: Family Visual Specification
title: B Linear DP Visual Specification
description: Current visual grammar and semantic plate contract for the B family.
tags: [design, family-art, linear-dp]
status: stable
generated: { by: openai/codex, at: 2026-10-28T05:02:08.368Z }
---

# B Linear DP

Use an indexed track with predecessor relations. The hero folds, rises, falls, and branches; height expresses sequence values and forward edges express state sources. Its vertical wireframe forms the journey. Lesson plates use a 640×390 logical canvas and vary by the actual state structure.

References: [dark desktop](family-concept-dark.svg), [light desktop](family-concept-light.svg), [390×844 mobile](family-concept-mobile.svg). Light/dark preserve geometry; mobile keeps the main sequence and key predecessors while reducing secondary construction lines.

The family identity uses `--grad-b` (muted teal); DP states continue to use shared semantic tokens. Keep SVG definition IDs unique per instance and give lesson plates accessible names.

| Slug | Required meaning |
|---|---|
| `path` | Legal sources from the preceding layer; optimum and count share structure but aggregate differently. |
| `maxseg` | A state ending at i either extends the prior segment or restarts here. |
| `lis` | Earlier smaller predecessors extend f[i]; tails stores the smallest end for each length. |
| `lcs` | Equal suffix characters use the diagonal; otherwise choose the upper/left prefix state. |
| `edit` | Minimize priced insertion, deletion, and replacement edges. |
| `fsm` | Parallel state tracks preserve decision memory that controls future choices. |
| `count` | Sum sources rather than choosing an optimum; the empty prefix contributes one base case. |

LIS and edit distance are representative comparisons: the latter must retain two visible sequences even with a 2D table. Keep index ticks, line styles, and nodes consistent across slots. Avoid generic line charts, backpack/capacity geometry, replacing state colors with teal, or cropping the mobile diagram. A narrow layout must explain the same dependency rather than shrink a desktop screenshot.
