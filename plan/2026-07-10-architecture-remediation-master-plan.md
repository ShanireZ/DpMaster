# DP大师 Architecture Remediation Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close every remaining gap from `architecture-review-dpmaster-20260710-080946.html` while preserving the completed DP大师 catalog, feedback, playback, game-runtime, SEO, and accessibility work.

**Architecture:** `site/src/data/catalog.ts` remains the course and lazy-loading authority, while lesson JSX remains the problem-corpus source and `problems.ts` stays generated. Remaining work deepens four boundaries: pure algorithm results versus teaching events, one playback/safe-caption interface, reproducible game rounds, and executable browser route/focus verification.

**Tech Stack:** Node 24, npm 11, React 19, TypeScript 6, Vite 8, React Router 7, Node test runner, oxlint, GitHub Actions, Cloudflare Workers/Pages, EdgeOne Pages.

## Global Constraints

- Work directly on the existing `main`; do not create a branch or worktree.
- The product-facing name is `DP大师`; keep repository/deployment identifiers `DpMaster`, `dpmaster`, and `dp.betaoi.cc` unchanged.
- Run all npm commands from `D:\WorkSpace\DpMaster\site` with Node 24 and npm 11.
- `site/src/data/catalog.ts` is the only family/course/lazy-loader registry; do not recreate `parts.ts`, `content/registry.tsx`, or `games/registry.ts`.
- Lesson `ExampleCard` and `Exercise` declarations are the problem-corpus authority; never hand-edit `site/src/data/problems.ts`.
- Feedback acceptance remains the user-approved contract: a successful structured log means “已收到”; webhook forwarding is best-effort diagnostics and does not change the browser receipt.
- Feedback rate limiting remains 10 accepted requests per source in a rolling 30-minute window; request 11 returns 429 and asks the user to retry later.
- Family games load automatically at a 400 px viewport margin; do not add a manual load button.
- All playback surfaces must expose reset, previous, play/pause, next, progress, and speed with the same keyboard semantics; full and compact visual layouts remain allowed.
- All 37 completed lessons remain indexable with title `课程名 · 家族名 · DP大师`, canonical, description, Open Graph, robots, and the complete 48-URL sitemap.
- Do not deploy or push unless separately authorized. Every implementation task ends with an independently reviewable commit.

---

## Audit Snapshot

- Source review: `architecture-review-dpmaster-20260710-080946.html` generated 2026-07-10 08:15 +08:00.
- Review baseline: `2d1878a`.
- Final implementation snapshot: `b098772` on `main`.
- Plan closure: the Task 7 documentation commit closes this plan; its hash is intentionally not embedded in the commit it describes.
- Current gate: `npm run verify` passes 127/127 Node tests, 9/9 production-preview Chromium tests, zero-warning lint, TypeScript/Vite build, generated-content/SEO drift checks, and asset budgets.
- Current security audit: `npm audit --audit-level=low` reports 0 vulnerabilities.
- Current working tree at audit time: clean.

## Status Legend

- `[x]` Complete and protected by an executable or documented gate.
- `[-]` Partially complete or completed under a later approved decision that differs from the original report.
- `[ ]` Not complete; remains in the execution queue below.
- `[!]` Accepted divergence; do not change without a new product/security decision.

## Architecture Review Status

| # | Review area | State | Completed scope | Remaining closure condition |
|---|---|---|---|---|
| 1 | Course catalog and problem corpus | `[x]` | One 37-course/7-game catalog; lesson-derived 177-slot generated corpus; P1880/P1436 correction; drift gate. | None. |
| 2 | Algorithm results vs. teaching traces | `[x]` | All 29 teaching solver surfaces use public typed results, internal event emitters, teaching Adapters, independent small-case oracle/property checks, and public-result game/readout consumers. | None. |
| 3 | Executable verification Module | `[x]` | `test`, `verify`, CI, catalog/SEO/feedback/playback/game contracts, every public-result oracle/property, 9 production-preview Chromium tests, build and asset gates. | None. |
| 4 | Visualization trace and playback shell | `[x]` | Every transport uses the shared typed player and full/compact controls; `SafeCaption` owns playback captions and a whole-source guard restricts raw sinks. | None. |
| 5 | Feedback intake and delivery semantics | `[!]` | Body/schema/kind/origin gates, 10/30m limiter, stable JSON errors, structured logs, three runtime Adapters, focus-managed dialog. | Original report requested redacted logs and delivered semantics; the user explicitly replaced that requirement with log-write acceptance. Keep full validated feedback logs unless policy changes. |
| 6 | Game runtime and lazy loading | `[x]` | Seven lazy game chunks, 400 px gate, shared audio/runtime helpers, displayed-seed replay in six random games, and duplicate-safe shared statistics across all seven games. | None. |
| 7 | Document metadata and focus semantics | `[x]` | Dynamic route metadata, 37 lesson titles, canonical/OG, robots, sitemap, skip link, current-page state, route status, guarded route-change focus, dialog focus lifecycle, reduced motion, and production-preview browser enforcement. | None. |

## Completed Checklist

### Course Catalog And Content

- [x] Consolidated family identity, course order, lesson lazy imports, and game lazy imports in `site/src/data/catalog.ts`.
- [x] Removed `site/src/data/parts.ts`, `site/src/content/registry.tsx`, and `site/src/components/games/registry.ts`.
- [x] Generated `site/src/data/problems.ts` from lesson `ExampleCard` / `Exercise` declarations.
- [x] Reconciled all 177 problem slots: 84 examples, 93 exercises, 116 unique IDs.
- [x] Corrected `c/tree`: P1880 is an example and P1436 is an exercise.
- [x] Added catalog, corpus, navigation, official-ID, and generated-file drift tests.

### Algorithm And Verification Foundation

- [x] Added `site/src/algorithms/contracts.ts` with `EventSink` and `RecordedRun`.
- [x] Migrated 01 knapsack to `algorithms/knapsack/{index,internal}.ts`.
- [x] Migrated LIS to `algorithms/lis/{index,internal}.ts`.
- [x] Migrated stone merge to `algorithms/stone-merge/{index,internal}.ts`.
- [x] Reused public results in PackMaster, LIS Chain, and Stone Merge games.
- [x] Added exhaustive small-case oracles for the three migrated algorithms.
- [x] Added direct oracle checks for reroot distance sums and tree independent set.
- [x] Added `npm test`, `npm run verify`, GitHub Actions with `npm ci`, and build/asset gates.

### Feedback

- [x] Centralized feedback validation, rate limiting, logging, forwarding diagnostics, and receipts in `site/functions/_feedback-core.js`.
- [x] Kept Cloudflare Worker, Cloudflare Pages, and generated EdgeOne handlers as environment-only Adapters.
- [x] Enforced `application/json`, body limits, allowed kinds, field limits, same-origin browser requests, and rolling rate limits.
- [x] Returned 429 plus `Retry-After` for request 11 in 30 minutes.
- [x] Kept “structured log succeeded = 已收到” even when webhook forwarding fails, per user decision.
- [x] Added dialog focus trap, body scroll lock, trigger restoration, live status, and rate-limit copy.

### Playback

- [x] Added `site/src/components/dp-engine/playback/` with pure state, typed hook, common controls, and common styles.
- [x] Unified DPViz full controls.
- [x] Unified tree compact controls.
- [x] Unified bitmask board/subset/cover compact controls.
- [x] Unified reroot compact controls.
- [x] Added reset/previous/play-pause/next/progress/speed semantics, keyboard shortcuts, and live status.

### Games

- [x] Added shared random, audio, round-state, statistics, and deferred-render runtime Modules.
- [x] Migrated all seven games away from direct `Math.random` and per-game `AudioContext` creation.
- [x] Preserved catalog-owned dynamic imports so a family page requests only its own game chunk.
- [x] Added one-way 400 px near-viewport loading with no manual fallback button.
- [x] Added duplicate-safe round totals to six games.

### SEO And Accessibility

- [x] Added `pageMeta.ts` as the route metadata authority and `RouteMeta.tsx` as the DOM-head Adapter.
- [x] Added titles, descriptions, canonicals, Open Graph values, homepage static metadata, and WebSite JSON-LD.
- [x] Generated `robots.txt` and a catalog-derived 48-URL sitemap.
- [x] Added skip navigation, focus-visible styles, route announcements, current-page semantics, accessible mobile navigation, and reduced motion.
- [x] Browser-checked home, family, lesson, and static routes; skip link; mobile drawer; reduced motion; and zero console errors.

### Low-Cost Review Wins

- [x] Removed unused GSAP, `@gsap/react`, Motion, `react-katex`, and stale type dependencies.
- [x] Added `D:\WorkSpace\DpMaster\AGENTS.md`.
- [x] Removed the TreeCanvas Fast Refresh warning and enforce zero-warning lint.
- [x] Declared `packageManager: npm@11.13.0`, Node 24/npm 11 engines, and CI `npm ci`.
- [x] Added executable total/file/CSS asset budgets.
- [x] Preserved the zero-known-vulnerability audit baseline.

## Accepted Decisions — Closed Unless Reopened

- [x] Display name is `DP大师`; infrastructure identifiers remain unchanged.
- [x] Feedback remains “已收到” after the structured log succeeds, regardless of webhook state.
- [x] Feedback logs contain the complete validated feedback so operators can recover it without webhook delivery.
- [x] The feedback limiter is per runtime instance; platform-level global enforcement is an operations concern.
- [x] Games auto-load near the viewport and have no manual load control.
- [x] Playback has one control language while retaining full/compact visual variants.
- [x] The 37 completed lessons are indexable; the sitemap contains 48 approved canonical URLs.

---

## Closed Execution Queue

### Task 1: Complete Algorithm Result/Teaching Trace Separation — Knapsack Wave

**Priority:** P0

**Files:**
- Create: `site/src/algorithms/knapsack-group/{index,internal}.ts`
- Create: `site/src/algorithms/knapsack-multiple/{index,internal}.ts`
- Create: `site/src/algorithms/knapsack-mixed/{index,internal}.ts`
- Create: `site/src/algorithms/knapsack-cost2d/{index,internal}.ts`
- Create: `site/src/algorithms/knapsack-dependency/{index,internal}.ts`
- Create: `site/src/algorithms/knapsack-variant/{index,internal}.ts`
- Modify: `site/src/components/demos/knapsack/groupSolver.ts`
- Modify: `site/src/components/demos/knapsack/groupOrderSolver.ts`
- Modify: `site/src/components/demos/knapsack/multipleSolver.ts`
- Modify: `site/src/components/demos/knapsack/mixedSolver.ts`
- Modify: `site/src/components/demos/knapsack/cost2dSolver.ts`
- Modify: `site/src/components/demos/knapsack/dependencySolver.ts`
- Modify: `site/src/components/demos/knapsack/variantSolver.ts`
- Modify: `site/src/components/demos/knapsack/variantUndoSolver.ts`
- Test: `site/scripts/algorithm-results.test.mjs`
- Test: `site/scripts/algorithm-architecture.test.mjs`

**Interfaces:**
- Consumes: `EventSink<Event>`, `RecordedRun<Result, Event>`, and `ignoreEvents` from `site/src/algorithms/contracts.ts`.
- Produces: one public `solve*` result function per domain and one internal `execute*`/`record*` event surface; teaching Adapters consume events and never recover answers from the last frame.

- [x] Add failing exhaustive-oracle cases for group, multiple, mixed, two-cost, dependency, and variant results.
- [x] Run `node --test scripts/algorithm-results.test.mjs`; expect the new imports or assertions to fail before the Modules exist.
- [x] Move each sole transition loop into its `internal.ts`; public `index.ts` calls it with `ignoreEvents`.
- [x] Convert the eight existing teaching solvers into event-to-`VizModel` Adapters.
- [x] Extend the architecture contract with all eight Adapter/import pairs and prohibit private duplicate loops.
- [x] Run `node --test scripts/algorithm-results.test.mjs scripts/algorithm-architecture.test.mjs`; expect all cases to pass.
- [x] Run `npm run verify`; expect all gates to pass with no generated drift.
- [x] Commit: `feat: separate remaining knapsack results from teaching traces`.

The required implementation pattern is:

```ts
export function solveDomain(input: readonly Input[]): DomainResult {
  return executeDomain(input, ignoreEvents)
}

export function recordDomain(input: readonly Input[]): RecordedRun<DomainResult, DomainEvent> {
  const events: DomainEvent[] = []
  const result = executeDomain(input, (event) => events.push(event))
  return { result, events }
}
```

### Task 2: Complete Algorithm Separation — Linear, Grid, And FSM Wave

**Priority:** P0

**Files:**
- Create: `site/src/algorithms/max-subarray/{index,internal}.ts`
- Create: `site/src/algorithms/linear-count/{index,internal}.ts`
- Create: `site/src/algorithms/edit-distance/{index,internal}.ts`
- Create: `site/src/algorithms/lcs/{index,internal}.ts`
- Create: `site/src/algorithms/two-path/{index,internal}.ts`
- Create: `site/src/algorithms/grid-path/{index,internal}.ts`
- Create: `site/src/algorithms/max-square/{index,internal}.ts`
- Create: `site/src/algorithms/linear-fsm/{index,internal}.ts`
- Modify: `site/src/components/demos/linear/maxsegSolver.ts`
- Modify: `site/src/components/demos/linear/countSolver.ts`
- Modify: `site/src/components/demos/grid/editSolver.ts`
- Modify: `site/src/components/demos/grid/lcsSolver.ts`
- Modify: `site/src/components/demos/grid/twoPathSolver.ts`
- Modify: `site/src/components/demos/grid/pathSolver.ts`
- Modify: `site/src/components/demos/grid/maxSquareSolver.ts`
- Modify: `site/src/components/demos/fsm/fsmSolver.ts`
- Test: `site/scripts/algorithm-results.test.mjs`
- Test: `site/scripts/algorithm-architecture.test.mjs`

**Interfaces:** Same `solve*` + `execute*` + `record*` contract as Task 1; result types own answers/witnesses/tables, while events remain UI-neutral.

- [x] Add brute-force or independent reference checks for all eight results before moving implementations.
- [x] Run the focused tests and confirm the new cases fail against the current teaching-only solvers.
- [x] Create the eight public/internal pairs and preserve exactly one transition loop per algorithm.
- [x] Rewrite the eight teaching files as event Adapters without changing existing visual frame contracts.
- [x] Add result/record equality and immutable-event tests for every pair.
- [x] Run focused tests, then `npm run verify`.
- [x] Commit: `feat: separate linear and grid results from teaching traces`.

### Task 3: Complete Algorithm Separation — Interval, Tree, Reroot, And Bitmask Wave

**Priority:** P0

**Files:**
- Create: `site/src/algorithms/score-tree/{index,internal}.ts`
- Create: `site/src/algorithms/ring-interval/{index,internal}.ts`
- Create: `site/src/algorithms/palindrome/{index,internal}.ts`
- Create: `site/src/algorithms/interval-merge/{index,internal}.ts`
- Create: `site/src/algorithms/reroot/{index,internal}.ts`
- Create: `site/src/algorithms/tree-dp/{index,internal}.ts`
- Create: `site/src/algorithms/bitmask-board/{index,internal}.ts`
- Create: `site/src/algorithms/bitmask-cover/{index,internal}.ts`
- Create: `site/src/algorithms/bitmask-subset/{index,internal}.ts`
- Create: `site/src/algorithms/bitmask-tsp/{index,internal}.ts`
- Modify: `site/src/components/demos/interval/scoreTreeSolver.ts`
- Modify: `site/src/components/demos/interval/ringSolver.ts`
- Modify: `site/src/components/demos/interval/palindromeSolver.ts`
- Modify: `site/src/components/demos/interval/mergeSolver.ts`
- Modify: `site/src/components/demos/reroot/rerootSolver.ts`
- Modify: `site/src/components/demos/treedp/treedpSolver.ts`
- Modify: `site/src/components/demos/bitmask/boardSolver.ts`
- Modify: `site/src/components/demos/bitmask/coverSolver.ts`
- Modify: `site/src/components/demos/bitmask/subsetSolver.ts`
- Modify: `site/src/components/demos/bitmask/tspSolver.ts`
- Test: `site/scripts/algorithm-results.test.mjs`
- Test: `site/scripts/algorithm-architecture.test.mjs`

**Interfaces:** Same result/event contract as Tasks 1-2. Existing reroot-distance and independent-set oracles become public-result tests rather than teaching-solver tests.

- [x] Add or move independent reference/oracle tests for all ten results.
- [x] Confirm the new public-result assertions fail before migration.
- [x] Create the ten result/event implementations and convert teaching solvers into Adapters.
- [x] Remove any game/readout answer extraction from teaching frames.
- [x] Change the architecture test to enumerate all 29 migrated solver surfaces, so a new teaching-only solver fails CI.
- [x] Run focused tests, `npm run verify`, and `npm audit --audit-level=low`.
- [x] Commit: `feat: complete algorithm result and teaching trace separation`.

### Task 4: Automate Production Preview, Deep-Link, And Focus Verification

**Priority:** P0

**Files:**
- Modify: `site/package.json`
- Modify: `site/package-lock.json`
- Modify: `.github/workflows/ci.yml`
- Create: `site/playwright.config.ts`
- Create: `site/tests/browser/routes.spec.ts`
- Modify: `site/src/components/layout/Shell.tsx`
- Modify: `site/scripts/accessibility-contract.test.mjs`
- Modify: `docs/operations/verification.md`

**Interfaces:**
- Produces `npm run test:browser`, which starts `vite preview` against the built `dist` and checks real client navigation plus direct deep links.
- `Shell` focuses `#main-content` with `{ preventScroll: true }` only after pathname changes, not on the initial page load.

- [x] Add `@playwright/test` as a pinned dev dependency and add `test:browser` after the production build in `verify`.
- [x] Add a failing browser test for `/`, `/part/a`, `/part/a/01`, `/method`, and direct navigation to `/part/g/plug`.
- [x] Assert title, description, canonical, Open Graph type, one `h1`, route status, current-page state, and zero console errors on every sampled route.
- [x] Add a failing keyboard test proving route navigation focuses `#main-content` and skip-link activation still does the same.
- [x] Add a previous-path ref in `Shell`; on later pathname changes call `mainRef.current?.focus({ preventScroll: true })` after scroll reset.
- [x] Install Chromium in CI with `npx playwright install --with-deps chromium` before `npm run verify`.
- [x] Run `npm run verify`; expect unit, browser, lint, build, and asset gates to pass.
- [x] Commit: `test: automate route and focus smoke coverage`.

The focus guard must use this shape so initial page load is not unexpectedly stolen:

```tsx
const mainRef = useRef<HTMLElement>(null)
const previousPath = useRef(location.pathname)

useEffect(() => {
  const changed = previousPath.current !== location.pathname
  previousPath.current = location.pathname
  setMobileOpen(false)
  window.scrollTo({ top: 0 })
  if (changed) mainRef.current?.focus({ preventScroll: true })
}, [location.pathname])
```

### Task 5: Finish Unified Playback And Safe Caption Rendering

**Priority:** P1

**Files:**
- Modify: `site/src/components/demos/lis/LISPatienceDemo.tsx`
- Modify: `site/src/components/demos/grid/LCSToLISDemo.tsx`
- Modify: `site/src/components/demos/interval/PalindromeInsertDemo.tsx`
- Modify: `site/src/components/demos/grid/EditTracebackDemo.tsx`
- Create: `site/src/components/dp-engine/SafeCaption.tsx`
- Modify: `site/src/components/dp-engine/DPViz.tsx`
- Modify: `site/src/components/demos/treedp/TreeCanvas.tsx`
- Modify: `site/src/components/demos/reroot/RerootTwoPassDemo.tsx`
- Modify: `site/src/components/demos/bitmask/BoardDemo.tsx`
- Modify: `site/scripts/playback-architecture.test.mjs`
- Test: `site/scripts/safe-caption.test.mjs`

**Interfaces:**
- All four remaining transports consume `useStepPlayer` and render `PlaybackControls`.
- `SafeCaption` accepts `{ html: string; className?: string }`, preserves only the existing teaching emphasis vocabulary, and renders all other markup as text.

- [x] Extend `playback-architecture.test.mjs` with the four remaining component paths and assert the absence of local `playing`, timer, and transport button state.
- [x] Run the focused test and confirm it fails for all four current bespoke transports.
- [x] Prepend an explicit initial frame where a demo currently uses index `-1`; use player index `0` for the initial state and `index - 1` for the first algorithm step.
- [x] Replace each local reset/previous/play/next/progress control with `PlaybackControls`, retaining its existing visual stage.
- [x] Add safe-caption tests containing `<b>allowed</b>`, `<img onerror=...>`, `<script>`, event attributes, and malformed markup.
- [x] Implement `SafeCaption` without adding a broad animation/rendering dependency; allow only `b`, `strong`, `code`, `br`, and approved static `span` classes.
- [x] Replace all four raw `dangerouslySetInnerHTML` playback sinks with `SafeCaption` and fail the architecture test if a new raw sink appears.
- [x] Run playback tests, `npm run verify`, and the browser keyboard smoke.
- [x] Commit: `feat: finish unified playback and safe captions`.

### Task 6: Make Game Rounds Reproducible And Finish Shared Statistics

**Priority:** P1

**Files:**
- Create: `site/src/components/games/runtime/useRoundSeed.ts`
- Modify: `site/src/components/games/runtime/random.ts`
- Modify: `site/src/components/games/PackMasterGame.tsx`
- Modify: `site/src/components/games/LISChainGame.tsx`
- Modify: `site/src/components/games/StoneMergeGame.tsx`
- Modify: `site/src/components/games/PowerAccelGame.tsx`
- Modify: `site/src/components/games/RerootGame.tsx`
- Modify: `site/src/components/games/TreePartyGame.tsx`
- Modify: `site/src/components/games/BitBoardGame.tsx`
- Modify: `site/scripts/game-runtime.test.mjs`
- Modify: `site/scripts/game-runtime-architecture.test.mjs`
- Modify: `docs/engineering/architecture.md`

**Interfaces:**
- `useRoundSeed()` returns `{ seed: number; next(): void; replay(seed: number): void }`.
- Each random round builder accepts `RandomSource`; the component passes `createSeededRandom(seed)` rather than `browserRandom` directly.
- BitBoard uses `useRoundStats`; a completed legal layout calls `round.record(true)`, while clear/difficulty/reset calls `round.start()`.

- [x] Add failing architecture assertions that no game round builder references `browserRandom` directly and that all seven games use the shared round/stat contract where totals are shown.
- [x] Add deterministic tests proving the same seed creates identical pack, sequence, stones, exponent, tree, and party rounds.
- [x] Implement `useRoundSeed`, seed the six random games, and expose the current numeric seed in the game status for reproducible reports.
- [x] Replace BitBoard `solved` state with `useRoundStats` and keep duplicate-success counting impossible until the next round.
- [x] Run game-runtime tests and browser-check shuffle, difficulty, reveal, reset, replay seed, and lazy chunk behavior.
- [x] Update architecture wording only after all seven games match it.
- [x] Run `npm run verify`.
- [x] Commit: `feat: make game rounds reproducible`.

### Task 7: Close Workspace And Documentation Truth Gaps

**Priority:** P2

**Files:**
- Modify: `D:\WorkSpace\AGENTS.md`
- Modify: `D:\WorkSpace\DpMaster\docs\engineering\architecture.md`
- Modify: `D:\WorkSpace\DpMaster\docs\operations\verification.md`
- Modify: `D:\WorkSpace\DpMaster\docs\log.md`
- Modify: this plan.

**Interfaces:** Documentation must describe only behavior enforced by code/tests; the workspace index must include DP大师 and link its project guideline.

- [x] Add this exact project-index row to `D:\WorkSpace\AGENTS.md`:

```markdown
| `DpMaster/` | DP大师 — React/Vite 动态规划交互式教程；37 门课程、逐帧可视化、小游戏、题目索引与反馈入口。 | [`DpMaster/AGENTS.md`](DpMaster/AGENTS.md) |
```

- [x] Update architecture and verification docs with the final 29-algorithm, browser-smoke, playback, safe-caption, seeded-round, and seven-game statistics contracts.
- [x] Mark every completed checkbox in this master plan and update the audit snapshot to the closing commit.
- [x] Run `git diff --check`, `npm run verify`, and `npm audit --audit-level=low`.
- [x] Confirm `git status --short` contains only the intended plan/document changes before committing.
- [x] Commit: `docs: close architecture remediation plan`.

---

## Final Exit Checklist

- [x] All 29 solver surfaces have a public result Module and a teaching event Adapter.
- [x] Every public result is checked against an independent small-case oracle or property test.
- [x] No game or readout derives answers from a teaching frame.
- [x] Every playback transport uses the common player and full/compact controls.
- [x] No playback carrier renders raw caption HTML outside `SafeCaption`.
- [x] Six random games can reproduce a round from the displayed seed.
- [x] All seven games use the documented shared statistics semantics where totals are displayed.
- [x] Production-preview browser tests cover direct deep links, route metadata, focus, current-page semantics, lazy games, and zero console errors.
- [x] Route changes focus the main content without stealing focus on initial load.
- [x] Feedback retains the approved logged-receipt and 10/30m rate-limit behavior.
- [x] Catalog generation still reports exactly 177 slots and SEO generation exactly 48 canonical URLs.
- [x] `npm run verify` passes from `site/`.
- [x] `npm audit --audit-level=low` reports 0 vulnerabilities.
- [x] `git diff --check` passes and the working tree is clean after the final commit.
- [x] `D:\WorkSpace\AGENTS.md` lists `DpMaster/`.

## Execution Order

1. Tasks 1-3: finish the original P0 algorithm/result boundary in reviewable family waves.
2. Task 4: make route, metadata, focus, and deep-link verification executable in CI.
3. Task 5: finish the playback Seam and close caption safety.
4. Task 6: finish actual seeded reproducibility and BitBoard statistics.
5. Task 7: synchronize standards/docs and close this master checklist.

Do not mark a row complete because the current gate passes; mark it complete only when its explicit closure condition and focused evidence both pass.
