---
type: Engineering Contract
title: Visualization Engine Contract
description: Shared DpMaster DP visualization model and demo behavior contract.
tags: [engineering, visualization, dp-engine]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/src/components/dp-engine/types.ts
  - site/src/components/dp-engine/DPViz.tsx
  - site/src/components/dp-engine/useStepPlayer.ts
  - site/src/components/demos/
---

# Purpose

The DP visualization engine lets lessons show how a state table, array, tree, or bitmask evolves step by step. It keeps algorithm solving separate from rendering.

# Model Contract

Each demo should compute a `VizModel` with `frames[]`. Frames describe the current values, active state, dependency arrows, semantic cell states, formula text, and caption. The UI consumes the model and handles playback.

The solver should be deterministic for the same input. Editable inputs should regenerate the model and remount or reset the visualizer so learners can replay the new computation from the beginning.

# Supported Carriers

The engine and surrounding demos support:

* One-dimensional arrays.
* Two-dimensional tables.
* Tree-like views for tree DP and rerooting.
* Bitmask grids and set states.

# Interaction Contract

Visualizations should expose:

* Play and pause.
* Single step.
* Scrub/progress control.
* Speed control where useful.
* Highlighting for current state, dependency source, chosen transition, settled state, and invalid/unreachable state.
* Formula and caption synchronized with the current frame.

# Authoring Guidance

Prefer small default examples that fit on laptop screens. Keep input editing bounded so the model remains readable and fast. If a topic needs a richer specialized demo, keep the solver local to `site/src/components/demos/<topic>/` and still reuse `DPViz` where practical.

