---
type: Design System
title: Warm Ink Visual System
description: Current DpMaster visual system, including tokens, motion constraints, and superseded palette guidance.
tags: [design, css, accessibility]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/src/styles/tokens.css
  - site/src/styles/global.css
  - site/src/components/GeometryBackdrop.tsx
---

# Current Direction

The current design system is Warm Ink: warm near-black surfaces, honey-gold global emphasis, low-saturation mineral accents for the seven DP families, fine borders, soft shadows, and readable content areas. It replaced the earlier high-saturation rainbow-gradient direction.

`site/src/styles/tokens.css` is the design-token authority.

# Token Principles

* Default dark mode uses a warm ink base (`--canvas`, `--surface-*`, `--text-*`).
* Light mode uses a warm cream reading palette.
* Family accents are exposed as `--grad-a` through `--grad-g`, plus `--accent-1`, `--accent-2`, and `--grad-accent` in `[data-part]` scope.
* Text placed directly on accent color must use `--text-on-accent`, not white by habit.
* DP visualization semantic colors are separate from family branding: current, source, chosen, settled, invalid.

# Layout And Readability

The design must keep a strict separation between stage and content:

* Stage surfaces may use geometry, gradients, and atmosphere.
* Lesson prose, code, formulas, tables, examples, and exercises must stay high contrast and stable.
* The page should avoid generic card piles where an editorial split, data table, teaching panel, or full-width section is clearer.

# Motion

Use motion to explain hierarchy, state changes, and interaction feedback. Do not use hidden initial states such as `opacity: 0` for entrance or scroll reveal animations. Prior previews showed that headless/background tabs can pause CSS animation or observers and leave content permanently hidden.

Respect reduced-motion users. Complex backgrounds and demos should keep a readable static state.

# Accessibility

Color should not be the only information channel. Pair colors with labels, icons, shape, or position. Text and lesson content should meet high contrast, and controls should remain keyboard reachable.

