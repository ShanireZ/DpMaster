# AGENTS.md — DpMaster

When the shared workspace parent `../AGENTS.md` exists, read and inherit it explicitly. This guide records repository-specific contracts and also works in a standalone checkout.

## Authorities and boundaries

- Display name: **DP大師**. Directory `DpMaster`, repository `ShanireZ/DpMaster`, and Worker `dpmaster` are stable publication identifiers.
- Deploy only `site/dist/` to Cloudflare Workers Static Assets at `https://dp.round1.cc`. The app is static React/Vite: accounts, databases, and an online judging backend are outside its scope.
- Read [docs/index.md](docs/index.md) for reusable product/design/engineering contracts; [deploy.md](deploy.md) for release, feedback, and edge configuration. The Web-governance exit gate is [issue #6](https://github.com/ShanireZ/DpMaster/issues/6).
- `site/src/data/catalog.ts` alone owns lesson identity, order, content, and lazy lesson/game imports. Keep lessons and games split by route. `PUBLIC_PATHS` in `site/src/lib/publicRoutes.ts` alone owns public URLs, sitemap, prerendering, and Markdown negotiation.
- Lesson `ExampleCard` / `Exercise` entries own problems. Run `pnpm content:generate` after changing them; commit the generated projection and update documented counts.
- Preserve Chinese teaching content and UI labels. Keep each document's prose consistent with its intended language: English editions use English, and localized editions use their respective languages. Preserve translated editions and their navigation. Keep reusable current contracts in Git; workspace procedures, machine facts, historical receipts, and task handoffs belong outside this repository.

## Commands and evidence

Run from `site/`. Runtime and package-manager authorities are `.node-version` and `package.json`; use globally installed Node and pnpm without Corepack.

| Scope | Command | Evidence and prerequisites |
|---|---|---|
| Install or lockfile change | `pnpm install --frozen-lockfile` | Matching runtime; proves installability only. |
| Development | `pnpm dev` | Dependencies installed; local server only. |
| Scripts, Worker, content contracts | `pnpm test` | Node contract tests; no component/browser evidence. |
| React components | `pnpm test:unit` | Vitest checks; no device evidence. |
| Static diagnostics | `pnpm lint` | Type-aware lint with zero warnings. |
| Build artifact | `pnpm build` | Generates content/SEO, type-checks, and builds; writes generated files. |
| Complete local delivery | `pnpm verify` | Dependencies and Playwright Chromium/Firefox/WebKit prepared; full order is in `package.json`. |

For documentation changes, run the [documentation checks](docs/operations/verification.md#documentation-checks). In the shared workspace, also run `node Docs/check-context-budget.mjs` after guide changes and `node Docs/check-docs-graph.mjs` after navigation changes. Report actual failures, skips, and uncovered surfaces.

`pnpm release` is the complete production-release entry: verify once, reuse its artifact, then deploy. It writes externally and needs explicit authorization. GitHub Actions runs CI without production credentials. Wrangler is global; its machine-readable baseline is in `deploy.md`.

## Contracts that changes must preserve

- Read [browser compatibility](docs/engineering/browser-compatibility.md) before changing Baseline/toolchain policy and [public HTTP](docs/engineering/public-http.md) before changing routes, discovery, negotiation, caching, or edge behavior. `site/baseline.config.json` owns the six governance fields; Vite consumes the explicit frozen target in `baseline-targets.ts`, while the moving Widely query is audit-only.
- Keep proxy-injected Cloudflare Web Analytics/RUM enabled and Rocket Loader off. Source and generated HTML contain zero manual beacons. CSP permits `static.cloudflareinsights.com` scripts and `'self' https://cloudflareinsights.com` connections. Run `pnpm check:html` for build/prerender/CSP changes.
- Webhooks use fetch first, with socket fallback only for 52x or thrown transport errors. Retain the relay protocol/tests and `worker/feedback-core.js` as the relay reference. Removing `EGRESS_DIAG_SECRET` requires redeployment to disable the version-bound diagnostic endpoint.
- Repository robots and Content-Signal allow public-content training. The zone-wide managed robots setting must stay off; changes affect other hosts and need their owners' approval. HTML edge injection may remove ETag; keep established injection enabled.
- `site/src/styles/tokens.css` is the visual-token authority; [visual-system.md](docs/design/visual-system.md) is its navigation layer. Keep semantic state colors separate from family branding and meet AA 4.5:1 text contrast in both themes. Token exceptions need an identified external setter and a reason for reusing dark values; do not increase locked debt to pass.
- Keep every linted file in its TS Program: Node scripts in `tsconfig.scripts.json`, Playwright in `tsconfig.browser-tests.json`. When lint/tsconfig changes, prove `typescript/no-deprecated` with temporary probes rather than changing ignores.
- Direct dependencies use approved stable caret ranges, or an exact pin the owner approved and `approvedPackagePins` in `scripts/check-toolchain-drift.mjs` registers: Shiki 4.3.1, and `typescript` 7.1.0-beta (workspace-wide upgrade target; exact because a pre-release caret range resolves to nightly dev builds). The lockfile fixes CI resolution. Preserve the 24-hour quarantine, strict engines, build-script allowlist, and dependency-status checks. Handle upgrades as separate verified changes.
- Use ESM and modern APIs. Deprecated APIs, compatibility shims, obsolete CLI paths, and lint exemptions require an explicit product decision before implementation.

## Delivery

Use this repository's GitHub Issues as the tracker. Produce one focused commit on local `main`; the owner aggregates pushes unless the current user explicitly authorizes otherwise. Visual direction, product rules, compatibility policy, and release-contract changes need evidence and owner approval.

README is the public entry point; facts come from source/configuration. Preserve the license wording: `LICENSE` does not declare only/or-later, so documentation uses generic `GPL-3.0`.
