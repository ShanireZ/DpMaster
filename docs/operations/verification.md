---
type: Runbook
title: Verification Runbook
description: Build, lint, route, documentation, and deployment verification gates for DpMaster.
tags: [operations, verification, build]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/package.json
  - docs/
  - deploy.md
---

# Local Checks

Run from `site/`:

```bash
npm run lint
npm run build
```

`npm run build` runs TypeScript build and Vite build, then `postbuild` writes EdgeOne fallback artifacts into `dist/`.

# Documentation Checks

For OKF bundle changes:

* `docs/index.md` and `docs/log.md` are reserved files.
* Every other `docs/**/*.md` file must start with YAML frontmatter.
* Every concept frontmatter must include a non-empty `type`.
* Prefer `title`, `description`, `tags`, and `timestamp`.
* Use bundle-root links such as `/product/scope.md` for concept links where possible.

# Content Consistency Checks

When changing lesson content:

* Compare `site/src/data/parts.ts`, `site/src/content/registry.tsx`, and route behavior.
* Compare `site/src/data/problems.ts` against example/exercise cards.
* Check that all official problem IDs still use P/B prefixes.
* Verify formula strings contain no Chinese inside TeX.
* Do not reintroduce `opacity: 0` entrance animations.

# Deployment Checks

Deployment checks live in root [deploy.md](../../deploy.md). At minimum after deployment:

* Open a normal route and a direct deep link.
* Submit a feedback test.
* Check Cloudflare or EdgeOne logs for `[feedback]`.
* Check DingTalk delivery if webhook variables are configured.

