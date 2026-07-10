# Directory Update Log

## 2026-07-07

* **Initialization**: Created the DP大师 OKF bundle under `docs/` and moved durable knowledge out of stale root, `handoff/`, and `site/` Markdown files.
* **2026-07-10 catalog deepening**: Renamed the product to DP大师, centralized 37 lessons and 7 lazy games in `site/src/data/catalog.ts`, and replaced the stale manual problem index with a 177-slot generated projection guarded by tests and CI.
* **2026-07-10 algorithm separation**: Added typed result Modules for 01 knapsack, LIS, and stone merge; converted their demos into event-driven teaching Adapters; reused results in games and readouts; and added exhaustive algorithm and frame-contract verification.
* **2026-07-10 feedback hardening**: Added a validated same-origin JSON contract, per-instance rolling 30-minute/10-request protection, structured logged receipts, best-effort Webhook diagnostics, consistent runtime Adapters, and an accessible focus-managed feedback dialog.
* **2026-07-10 playback deepening**: Centralized finite-frame playback state, timing, speed, keyboard behavior, live status, and full/compact controls; migrated grid, tree, board, set, and reroot carriers away from duplicated transports.
* **2026-07-10 game runtime**: Added seeded/browser random sources, duplicate-safe round statistics, a shared lazy Web Audio Adapter, and a 400 px viewport gate; migrated all seven family games while preserving their rules and catalog-owned chunks.
* **Update**: Promoted root `deploy.md` as the single deployment and feedback runbook.
* **Deprecation**: Removed root numbered planning docs, `handoff/` handoff notes, and `site/README.md` / `site/DEPLOY.md` as maintained documentation sources.
