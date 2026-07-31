---
type: Engineering Contract
title: Toolchain and Modernity Contract
description: Current Node, pnpm, TypeScript, dependency, compatibility, CI, and local release rules for DP大师.
tags: [engineering, node, pnpm, typescript, ci]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
sources:
  - resource: ../../site/package.json
  - resource: ../../site/pnpm-workspace.yaml
  - resource: ../../.github/workflows/ci.yml
  - resource: ../../.github/workflows/toolchain-drift.yml
---

# Runtime and package authority

`site/` is the only package root. `.node-version` fixes the current Node 24 LTS patch, `package.json` fixes pnpm 11 through `packageManager` and `devEngines`, and `pnpm-lock.yaml` is the reproducible dependency graph used by CI.

All package commands use pnpm through Corepack. npm, yarn, and bun are not alternative project workflows. Direct dependencies use a caret range whose lower bound is the current stable mainline version eligible under the release-age policy.

# Supply-chain policy

`pnpm-workspace.yaml` is the pnpm 11 settings authority:

* New package releases are quarantined for 1,440 minutes and missing publication times fail resolution.
* Node engine checks are strict.
* Dependency build scripts are denied unless explicitly approved; only the build tools required by the current graph are allowed.
* Commands fail when `node_modules` does not match the lockfile instead of silently reinstalling.

CI installs with `pnpm install --frozen-lockfile`. No task may bypass these controls with another package manager, a release-age exclusion, permissive build-script execution, or an unreviewed lockfile.

# Language and compatibility

TypeScript 7 is the source compiler. Oxlint uses TypeScript-aware analysis and treats references to `@deprecated` APIs as errors; `tsc -b` remains the authoritative type-check and build gate.

Production source uses ESM and current browser standards. Do not add CommonJS shims, legacy browser polyfills, deprecated platform APIs, transitional CLI commands, compatibility selectors, or lint suppression for obsolete behavior. If a required capability has no modern implementation, stop the task and request a user decision with evidence instead of adding a temporary compatibility layer.

The supported browser contract is the current and previous major versions of Chrome, Edge, Firefox, and Safari. Chromium runs the complete automated browser gate; Firefox and WebKit run the tagged cross-browser smoke gate. Real Edge, Safari, and previous-major behavior are checked before a production release.

# Maintenance and release

Dependency upgrades are independent tasks. `pnpm maintenance:check` compares the declared Node, pnpm, package, external deployment CLI, and GitHub Action baselines with the latest stable versions that have completed the 24-hour quarantine.

The scheduled GitHub workflow maintains one rolling issue for drift. It does not edit source, create upgrade pull requests, or deploy. Pull requests and main-branch pushes run CI only.

`pnpm release` is the sole complete production-release entry point. It runs the full verification gate once, reuses the resulting regional artifacts, and then deploys Cloudflare followed by EdgeOne. Production credentials stay local to the platform CLIs; GitHub Actions never receives them.

# Task and documentation lifecycle

A user-approved task produces one focused local commit after all checks pass. The assistant summarizes the completed work and stops before push or deployment.

`docs/` contains current durable truth in OKF v0.2. It does not store task status, chronological logs, resolved drift, or completed implementation plans. Active plans and review gates live in `handoff/`; checklist entries become complete only after their behavior is verified.
