---
okf_version: "0.1"
---

# DP大师 Documentation Bundle

This directory is the canonical OKF bundle for DP大师 after the July 7, 2026 documentation consolidation. It replaces the older root-level planning documents, the `handoff/` notes, and the `site/` README/deploy notes.

# Project

* [Project Overview](/project/overview.md) - identity, audience, current status, source-of-truth rules.

# Product

* [Product Scope](/product/scope.md) - user-facing routes, non-goals, current completion surface.
* [Content Taxonomy](/product/content-taxonomy.md) - current A-G family map, type counts, games, and route semantics.
* [Luogu Problem Policy](/product/problem-policy.md) - P/B-only rule, exclusions, current problem index counts, known caveats.

# Design

* [Visual System](/design/visual-system.md) - Warm Ink tokens, accessibility, motion rules, superseded palette notes.

# Engineering

* [Site Architecture](/engineering/architecture.md) - stack, directory roles, routing, rendering, code-splitting.
* [Content Authoring Contract](/engineering/content-authoring.md) - type-page structure, C++ style, formulas, registration checklist.
* [Visualization Engine Contract](/engineering/visualization-engine.md) - `VizModel`, demos, playback, editable inputs.

# Operations

* [Verification](/operations/verification.md) - build/lint/doc checks and review gates.
* Deployment and feedback are maintained in the root [deploy.md](../deploy.md) because they are operational runbooks rather than bundle-only concepts.

# Maintenance

* [Staleness Register](/maintenance/staleness-register.md) - conflicts resolved during consolidation and claims that need future review.
