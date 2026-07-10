---
type: Engineering Contract
title: Visualization Engine Contract
description: Shared DP大师 DP visualization model and demo behavior contract.
tags: [engineering, visualization, dp-engine]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/src/components/dp-engine/types.ts
  - site/src/components/dp-engine/DPViz.tsx
  - site/src/components/dp-engine/playback/
  - site/src/algorithms/
  - site/src/components/demos/
---

# Purpose

The DP visualization engine lets lessons show how a state table, array, tree, or bitmask evolves step by step. It keeps algorithm solving separate from rendering.

# Model Contract

Each demo should compute a `VizModel` with `frames[]`. Frames describe the current values, active state, dependency arrows, semantic cell states, formula text, and caption. The UI consumes the model and handles playback.

`VizModel` is a teaching projection, not an algorithm-result Interface. Games, tests, answer readouts, and other non-teaching callers use the typed result Modules under `site/src/algorithms/`. A migrated algorithm has one internal transition Implementation with an event sink: the result path ignores events, while its teaching Adapter records UI-neutral events and turns them into frames.

The algorithm and teaching Adapter should be deterministic for the same input. Editable inputs should regenerate the model and remount or reset the visualizer so learners can replay the new computation from the beginning.

# Supported Carriers

The engine and surrounding demos support:

* One-dimensional arrays.
* Two-dimensional tables.
* Tree-like views for tree DP and rerooting.
* Bitmask grids and set states.

# Interaction Contract

Frame-based visualizations use the single `StepPlayer` Interface and `PlaybackControls` Adapter under `site/src/components/dp-engine/playback/`. Pure state helpers clamp empty, single-frame, and out-of-range tracks; the hook owns timing, replay-at-end, speed, pause-on-track-change, and timer cleanup.

Both visual layouts expose the same controls:

* Reset, previous, play/pause, and next.
* Scrub/progress control with the current and total frame count.
* `0.5×`, `1×`, and `2×` speed control.
* Highlighting for current state, dependency source, chosen transition, settled state, and invalid/unreachable state.
* Formula and caption synchronized with the current frame.

`full` is the roomier table layout used by `DPViz`; `compact` is used by tree, board, set, and reroot carriers. The visual density may differ, but control order and meaning do not. A focused control group supports `Home` for reset, `ArrowLeft` for previous, `Space` for play/pause, and `ArrowRight` for next. Native input/editable targets keep their own keyboard behavior, and status changes are announced through a polite live region.

# Authoring Guidance

Prefer small default examples that fit on laptop screens. Keep input editing bounded so the model remains readable and fast. If a topic needs a richer specialized view, keep its teaching Adapter local to `site/src/components/demos/<topic>/` and still reuse `DPViz` where practical. Do not put HTML, colors, KaTeX, or `VizModel` into a public algorithm result.

Specialized interactions that are not a finite frame track (for example editable geometry or continuous topic-specific animation) are not forced into `StepPlayer`. If such a view later adopts a frame model, it must use the shared playback Interface instead of adding another transport bar.
