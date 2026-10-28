---
type: Design Standard
title: DP Family Visual Standard
description: Durable visual contract for A–G family heroes, course journeys, and lesson semantic plates.
tags: [design, family-art, polygon, accessibility]
status: stable
generated: { by: openai/codex, at: 2026-10-28T05:02:08.368Z }
sources:
  - resource: ../../site/src/components/art/
---

# Family visual standard

Warm Ink and [tokens.css](../../site/src/styles/tokens.css) govern the visual system. The catalog alone owns lesson titles, slugs, order, and content. Family art explains a state, transition, constraint, or boundary.

## Three art slots

Every family implements `HeroArt`, `JourneyArt`, and `LessonPlate` through the lazy family-art registry:

- Hero: transparent polygon sculpture; decorative, with empty alt text and `aria-hidden`.
- Journey: deterministic SVG/CSS structure connecting real lesson links. Link labels, numbers, summaries, and actions remain DOM.
- Lesson plate: a unique semantic composition per slug, with an accessible name explaining its state or transition.

Keep shared geometry, lighting direction, detail density, fine engineering lines, soft ground shadows, and transparent edges. Light and dark themes use identical geometry and information. Family identity tokens never replace the cross-family `--viz-current/source/chosen/settled/invalid` roles.

## Assets and responsive composition

Keep high-resolution sources separate from compressed production AVIF. Artwork contains no lesson titles, formulas, numbers, or explanatory labels; DOM supplies meaning. Atlas cells use 3:2 viewports with about 6% silhouette safety space and optical centering based on visible bounds. Unused cells stay empty.

| Family | Material and spatial grammar | Atlas |
|---|---|---|
| C Interval | Terracotta endpoints, nested arches, splits | 3×2; last cell empty |
| D Matrix | Olivine planes, hinges, transformation axes | 2×1 |
| E Reroot | Muted amethyst root stations, orbit, two-way flow | 2×2 |
| F Tree | Ochre mineral subtree containers, upward aggregation | 3×2; last cell empty |
| G Bitmask | Rose-quartz sparse states, legal edges, contour | 3×2; last cell empty |

Journey art and lesson links share one composition. Below 900px, use two-column document flow; below 700px, use one column. Hide secondary structure on narrow screens while retaining complete titles, summaries, sequence, and actions. Do not crop meaningful endpoints or force page-level horizontal scrolling.

The family specifications link to desktop light/dark and mobile concept references. These are design comparisons; existing Chinese labels are product-content examples. Production rendering stays in the art modules and semantic DOM.

## Lesson instruments

All 37 ready lessons use `data-demo-standard="instrument"` and `data-demo-intensity="enhanced"`, with at least one real editable demo. Use the catalog scope rather than a second lesson allowlist.

Existing `.demo` layouts share the vertical instrument rail, sequential numbering, engineering grid, focus treatment, and 44×44px touch targets. New work uses `DemoWorkbench`, `InstrumentRail`, `DemoTableViewport`, `DemoDetailSwitch`, and `VizStateRole`. Reuse shared playback through these primitives.

Each lesson's first real demo has its own decorative `DemoSculptureHero` asset. Keep empty alt text and `aria-hidden`; exclude controls, embedded SVG, and coupling to parameters, solver results, or playback frames. Reusing another lesson's art or baking dynamic state into a hero breaks this contract.

Large tables scroll inside their own viewport. Mobile layouts preserve the main algorithm structure and rearrange controls, tables, and explanation. State roles need a second channel beyond color: outline, symbol, pattern, or line style. Reduced motion changes presentation, never steps or results.

## Acceptance

Check light/dark and reduced motion, plus 1600×1000, 1440×900, 1024px, 820px, and 390×844 layouts. Require no page overflow, one family hero, a same-motif journey, a unique accessible lesson plate per ready slug, no production `PartGlyph` fallback, and one independent static demo hero per lesson. The current route loads only its own family art module/assets.

Asset limits remain 760 KB per file and 80 KB per CSS file; the total build budget is enforced by [check-assets.mjs](../../site/scripts/check-assets.mjs). Optimize assets rather than increasing limits.
