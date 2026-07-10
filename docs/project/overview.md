---
type: Project
title: DP大师 Project Overview
description: DP大师 is an independent interactive dynamic-programming teaching site built as a React and Vite static app.
tags: [project, identity, status]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - README.md
  - site/src/data/catalog.ts
  - site/src/data/problems.ts
---

# Identity

DP大师 is an independent Chinese interactive teaching site for dynamic programming. It targets C++ algorithm learners around NOIP, CSP, and provincial-selection preparation, and uses a normal teaching voice rather than a fantasy or 修真 narrative.

The current local project root is `D:\WorkSpace\DpMaster`. The public remote is `https://github.com/ShanireZ/DpMaster.git`.

DP大师 is not part of `Cpplearn` or any earlier `cpplearn-animation-lab` work. Treat paths that mention `D:\WorkSpace\dp` as stale historical text.

# Current Status

The app surface is essentially complete:

* 7 DP families are registered.
* 37 type pages are registered and marked `ready`.
* 7 family games are registered.
* The problem index contains 177 problem slots: 84 examples and 93 exercises.
* Those slots represent 116 unique Luogu problem IDs, with intentional reuse across families and review contexts.

The current code and data files are the authority for product state:

* `site/src/data/catalog.ts` for family/type status, implemented lesson routes, ordering, and lazy game registration.
* Lesson JSX `ExampleCard` / `Exercise` entries for the problem corpus.
* Generated `site/src/data/problems.ts` for the public problem-index projection.

# Non-Goals

The current phase does not include browser-side C++ execution, online judging, accounts, cloud progress sync, or a separate backend service. Code examples are rendered with highlighting, copy affordances, and Luogu links. Learning progress is local to the browser.

# Documentation Rules

Durable project knowledge belongs in this OKF bundle. Operational deployment and feedback instructions belong in root `deploy.md`. Root `README.md` is only an entrypoint and quick-start map.

Project-level maintenance rules live in `D:\WorkSpace\DpMaster\AGENTS.md` and inherit the workspace-level rules.
