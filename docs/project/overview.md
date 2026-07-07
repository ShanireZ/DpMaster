---
type: Project
title: DpMaster Project Overview
description: DpMaster is an independent interactive dynamic-programming teaching site built as a React and Vite static app.
tags: [project, identity, status]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - README.md
  - site/src/data/parts.ts
  - site/src/data/problems.ts
---

# Identity

DpMaster is an independent Chinese interactive teaching site for dynamic programming. It targets C++ algorithm learners around NOIP, CSP, and provincial-selection preparation, and uses a normal teaching voice rather than a fantasy or 修真 narrative.

The current local project root is `D:\WorkSpace\DpMaster`. The public remote is `https://github.com/ShanireZ/DpMaster.git`.

DpMaster is not part of `Cpplearn` or any earlier `cpplearn-animation-lab` work. Treat paths that mention `D:\WorkSpace\dp` as stale historical text.

# Current Status

The app surface is essentially complete:

* 7 DP families are registered.
* 37 type pages are registered and marked `ready`.
* 7 family games are registered.
* The problem index contains 158 problem slots: 84 examples and 74 exercises.
* Those slots represent 112 unique Luogu problem IDs, with intentional reuse across families and review contexts.

The current code and data files are the authority for product state:

* `site/src/data/parts.ts` for family/type status.
* `site/src/content/registry.tsx` for implemented type routes.
* `site/src/components/games/registry.ts` for game registration.
* `site/src/data/problems.ts` for the public problem index.

# Non-Goals

The current phase does not include browser-side C++ execution, online judging, accounts, cloud progress sync, or a separate backend service. Code examples are rendered with highlighting, copy affordances, and Luogu links. Learning progress is local to the browser.

# Documentation Rules

Durable project knowledge belongs in this OKF bundle. Operational deployment and feedback instructions belong in root `deploy.md`. Root `README.md` is only an entrypoint and quick-start map.

There is currently no project-level `AGENTS.md` in `D:\WorkSpace\DpMaster`; only the workspace-level agent rules were available during this consolidation.

