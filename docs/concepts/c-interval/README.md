---
type: Family Visual Specification
title: C Interval DP Visual Specification
description: Current visual grammar and semantic plate contract for the C family.
tags: [design, family-art, interval-dp]
status: stable
generated: { by: openai/codex, at: 2026-10-28T05:02:08.368Z }
---

# C Interval DP

Terracotta nested arches express tension between endpoints, split positions, and shrinking intervals. Five real links occupy alternating endpoint stations. Keep endpoints and interval length visible; a generic ring is insufficient.

References: [dark desktop](family-concept-dark.svg), [light desktop](family-concept-light.svg), [mobile](family-concept-mobile.svg). These concept assets retain the course's Chinese labels.

## Lesson semantics

| Slug | Required meaning |
|---|---|
| `stone` | Split [l,r] at k; combine both subcosts and the merge cost. |
| `ring` | Cut and duplicate the ring into a bounded linear interval. |
| `palindrome` | Matching endpoints move inward; mismatches choose a one-sided substate. |
| `tree` | Enumerate the root inside the interval, with left/right subintervals as subtrees. |
| `merge` | Removing interior states lets matching endpoints reconnect and merge. |

## Composition and mobile fidelity

Preserve nested endpoints, perceptible splits, and a journey derived from the hero. Reduce secondary arches on mobile. Avoid generic circles, backpack capacity tracks, or links detached from the arches.

At 390px, use a single ordered lesson flow, hide the journey background, and scale the full hero without cropping endpoints. Use a 3×2 atlas with the lower-right cell empty; center each visible silhouette.
