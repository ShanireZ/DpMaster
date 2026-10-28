---
type: Engineering Contract
title: Browser Compatibility
description: Project-specific browser support, Baseline governance, and build target authorities.
tags: [engineering, contract]
status: stable
generated: { by: openai/codex, at: 2026-10-28T05:00:17.580Z }
sources:
  - resource: ../../site/baseline.config.json
  - resource: ../../site/baseline-targets.ts
  - resource: ../../site/vite.config.ts
  - resource: ../../site/scripts/check-baseline.mjs
---

# Browser compatibility

The browser support contract covers the current and previous major versions of Chrome, Edge, Firefox, and Safari. Automated checks use full Chromium coverage and tagged Firefox/WebKit smoke tests; a release also needs real Edge/Safari and previous-major evidence.

[baseline.config.json](../../site/baseline.config.json) owns the six governance fields, required engines, approved minimums, review snapshot, and fallback requirements. It declares `runtime: public-web` and `featureTarget: newly`. Newly is the development capability ceiling; unsupported optional capabilities must leave lessons, navigation, problems, and feedback usable.

Vite consumes the explicit frozen browser targets in [baseline-targets.ts](../../site/baseline-targets.ts), wired through [vite.config.ts](../../site/vite.config.ts). The moving `baseline widely available with downstream` query is a capability-audit input, not a replacement for those output targets.

`pnpm baseline:check` validates the actual query expansion, required desktop/mobile engines, approved minimums, review date, and build wiring. Missing engines, unapproved advances, and disconnected consumers fail. Review moving-query data and available RUM at least quarterly; record absent RUM honestly. Compatibility-policy changes require an owner decision with before/after evidence and an isolated negative probe proving the original guard rejects the old approval.

The shared-workspace copy wrapper also checks local policy inputs when that workspace exists; a standalone clone reports that cross-workspace check as SKIP. That does not replace this repository's browser gate. Keep runtime configuration and enforcement scripts unchanged when reorganizing documentation.
