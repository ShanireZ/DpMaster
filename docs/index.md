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

# Agent Conventions

`agents/` records **how tooling uses this repository** (where issues live, where to find domain docs, which engineering skills are installed, and this bundle's own maintenance contract) rather than product knowledge. The authority on project-level agent constraints is always [`AGENTS.md`](../AGENTS.md); this directory only carries the details it references.

* [Agent Configuration](/agents/index.md) - entry point for five conventions: issue tracker and Wayfinder rules, triage-label mapping, domain-doc layout (`CONTEXT.md` / ADRs, silently skipped when absent), engineering-skill orchestration, and the OKF v0.2 maintenance contract this bundle follows.

# Web 治理

* [Web Platform Baseline 治理（工作区唯一权威）](./web-baseline.md) - 工作区权威的逐字节副本，由 `node Docs/check-baseline-copies.mjs` 守着。**不要就地改**：改工作区权威再同步全部副本。
* [sitemap / Markdown 内容协商 / Accept 判据（工作区唯一权威）](./web-contracts.md) - 同上，同一道门。
