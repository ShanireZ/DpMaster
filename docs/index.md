---
okf_version: "0.2"
---

# DP大师 Documentation Bundle

This directory is the canonical, current-truth OKF bundle for DP大师. It contains durable product, design, engineering, and operations knowledge only. Git history carries change history; active task plans and review checklists live separately in `handoff/`.

# Project

* [Project Overview](/project/overview.md) - identity, audience, current status, source-of-truth rules.

# Product

* [Product Scope](/product/scope.md) - user-facing routes, non-goals, current completion surface.
* [Content Taxonomy](/product/content-taxonomy.md) - current A-G family map, type counts, games, and route semantics.
* [Luogu Problem Policy](/product/problem-policy.md) - P/B-only rule, exclusions, current problem index counts, known caveats.

# Design

* [Visual System](/design/visual-system.md) - Warm Ink tokens, accessibility, motion rules, superseded palette notes.
* [Family Visual Standard](/concepts/family-visual-standard.md) - A-G family hero, journey, and lesson-plate contract.
* [Body Visualization Audit](/concepts/body-demo-audit.md) - current A-G figure and Demo inventory feeding the lesson-body standardization task.
* [A Backpack](/concepts/a-backpack/README.md), [B Linear](/concepts/b-linear/README.md), [C Interval](/concepts/c-interval/README.md), [D Matrix](/concepts/d-matrix/README.md), [E Reroot](/concepts/e-reroot/README.md), [F Tree](/concepts/f-tree/README.md), and [G Bitmask](/concepts/g-bitmask/README.md) - family-specific visual grammars.

# Engineering

* [Site Architecture](/engineering/architecture.md) - stack, directory roles, routing, rendering, code-splitting.
* [Toolchain and Modernity Contract](/engineering/toolchain.md) - Node, pnpm, TypeScript, dependency, compatibility, CI, and release rules.
* [Content Authoring Contract](/engineering/content-authoring.md) - type-page structure, C++ style, formulas, registration checklist.
* [Visualization Engine Contract](/engineering/visualization-engine.md) - `VizModel`, demos, playback, editable inputs.

# Operations

* [Verification](/operations/verification.md) - build/lint/doc checks and review gates.
* [Analytics and Alerting](/operations/analytics.md) - RUM events, regional dashboards, feedback delivery, privacy, and alerts.
* Deployment and feedback are maintained in the root [deploy.md](../deploy.md); this bundle records the durable contracts that runbook implements.
