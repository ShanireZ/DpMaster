# DP大师 Content Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate lesson/problem-index drift through one course catalog Module and generated problem data, then finish the agreed project-governance quick wins.

**Architecture:** `site/src/data/catalog.ts` owns family/type metadata and lazy implementations. `site/scripts/generate-problems.mjs` derives `problems.ts` from lesson JSX with the TypeScript AST, while Node tests and CI enforce catalog, content, lint, build, and asset invariants.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Node 24 built-in test runner, Oxlint, GitHub Actions.

## Global Constraints

- Work on the current `main` checkout; do not create a branch or worktree.
- Do not commit or push unless the user explicitly asks.
- Product-facing name is `DP大师`.
- Preserve compatibility identifiers: `D:\WorkSpace\DpMaster`, the GitHub repository URL, deployment project name `dpmaster`, and `dp.betaoi.cc`.
- Keep lesson JSX as the problem-corpus source of truth.
- Add no runtime dependency.

---

### Task 1: Generated problem corpus

**Files:**
- Create: `site/scripts/content-catalog.test.mjs`
- Create: `site/scripts/generate-problems.mjs`
- Modify (generated): `site/src/data/problems.ts`
- Modify: `site/package.json`

**Interfaces:**
- Produces: CLI modes `--json`, `--check`, and `--write`.
- Produces: JSON report `{ total, examples, exercises, unique, problems }`.
- Preserves: exported TypeScript `ProblemKind`, `Problem`, and `PROBLEMS`.

- [ ] **Step 1: Write the failing content test**

```js
const report = runGenerator('--json')
assert.equal(report.total, 177)
assert.ok(report.problems.some((p) => p.route === 'c/tree' && p.pid === 'P1880' && p.kind === 'example'))
assert.ok(report.problems.some((p) => p.route === 'c/tree' && p.pid === 'P1436' && p.kind === 'exercise'))
assert.equal(runGenerator('--check').status, 0)
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test scripts/content-catalog.test.mjs`

Expected: FAIL because `scripts/generate-problems.mjs` does not exist.

- [ ] **Step 3: Implement AST collection and stable generation**

Parse the current family/type registry, resolve each lesson source, collect literal JSX attributes, escape TypeScript strings, and render a deterministic `problems.ts`.

- [ ] **Step 4: Generate and verify GREEN**

Run: `node scripts/generate-problems.mjs --write && node --test scripts/content-catalog.test.mjs`

Expected: 177 generated slots and all tests PASS.

### Task 2: Deep course catalog Module

**Files:**
- Create: `site/src/data/catalog.ts`
- Create: `site/scripts/catalog-contract.test.mjs`
- Modify: every import of `src/data/parts.ts`
- Modify: `site/src/pages/TypePage.tsx`
- Modify: `site/src/pages/PartPage.tsx`
- Modify: `site/scripts/generate-problems.mjs`
- Delete: `site/src/data/parts.ts`
- Delete: `site/src/content/registry.tsx`
- Delete: `site/src/components/games/registry.ts`

**Interfaces:**
- Produces: `PARTS`, `Part`, `DPType`, `PartId`, `getPart`, `getLesson`.
- `DPType.content` is a stable `LazyExoticComponent<ComponentType>`.
- `Part.game` contains the title and lazy game implementation.
- Invariant: every ready lesson has exactly one lazy content implementation; every part has exactly one lazy game implementation.

- [ ] **Step 1: Write the failing catalog contract test**

```js
assert.equal(existsSync('src/data/catalog.ts'), true)
assert.equal(existsSync('src/content/registry.tsx'), false)
assert.equal(existsSync('src/components/games/registry.ts'), false)
assert.equal(countLessonLazyImports(), 37)
assert.equal(countGameLazyImports(), 7)
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test scripts/catalog-contract.test.mjs`

Expected: FAIL because the catalog does not yet exist and both registries still exist.

- [ ] **Step 3: Implement the catalog and migrate callers**

Move part/type metadata into `catalog.ts`, attach literal lazy imports, migrate pages/navigation/feedback to the catalog Interface, and make `PartPage` suspend only the selected game.

- [ ] **Step 4: Remove shallow registries and verify GREEN**

Run: `node --test scripts/catalog-contract.test.mjs scripts/content-catalog.test.mjs`

Expected: 37 lesson imports, 7 game imports, no shallow registry files, all tests PASS.

### Task 3: Asset budget and clean lint gate

**Files:**
- Create: `site/scripts/asset-budget.test.mjs`
- Create: `site/scripts/check-assets.mjs`
- Create: `site/src/components/demos/treedp/treeCanvasUtils.ts`
- Modify: `site/src/components/demos/treedp/TreeCanvas.tsx`
- Modify: callers importing `makeScale`
- Modify: `site/vite.config.ts`
- Modify: `site/src/main.tsx`
- Modify: `site/package.json`

**Interfaces:**
- Produces: asset CLI `node scripts/check-assets.mjs [dist-dir]`.
- Budgets: total output at most 4,700,000 bytes; any file at most 760,000 bytes; CSS at most 80,000 bytes.
- Lint invariant: zero warnings.

- [ ] **Step 1: Write failing asset fixture tests**

Create a temporary within-budget directory and an oversized directory. Assert exit 0 for the first and non-zero for the second.

- [ ] **Step 2: Verify RED and existing lint warning**

Run: `node --test scripts/asset-budget.test.mjs`

Expected: FAIL because the checker is missing.

Run: `npx oxlint --deny-warnings`

Expected: non-zero due to `TreeCanvas.tsx` Fast Refresh warning.

- [ ] **Step 3: Implement budgets and isolate `makeScale`**

Add the checker, move non-React runtime exports out of `TreeCanvas.tsx`, import Latin-only font CSS, and set Vite's warning threshold to the enforced maximum.

- [ ] **Step 4: Verify GREEN**

Run: `node --test scripts/asset-budget.test.mjs && npm run lint && npm run build && npm run check:assets`

Expected: tests PASS, zero lint warnings, build exit 0, budgets PASS.

### Task 4: Project governance, dependency cleanup, and rename

**Files:**
- Create: `AGENTS.md`
- Create: `.github/workflows/ci.yml`
- Modify: `site/package.json`
- Modify: `site/package-lock.json`
- Modify: user-facing source strings under `site/src/` and `site/index.html`
- Modify: `README.md`, `deploy.md`, and canonical `docs/**/*.md`

**Interfaces:**
- Package toolchain: Node `>=24 <25`, npm `>=11 <12`, `packageManager` `npm@11.13.0`.
- Produces scripts: `test`, `content:generate`, `check:content`, `check:assets`, `verify`.
- CI runs `npm ci` and `npm run verify` from `site/`.
- Product-facing name: `DP大师`; compatibility identifiers remain unchanged.

- [ ] **Step 1: Remove unused packages mechanically**

Run: `npm uninstall @gsap/react @types/react-katex gsap motion react-katex`

Expected: manifest and lockfile no longer contain those packages.

- [ ] **Step 2: Add project rules and CI**

Document package-root commands and preserved deployment identifiers in `AGENTS.md`; add Node 24 CI with npm cache, `npm ci`, and `npm run verify`.

- [ ] **Step 3: Apply the DP大师 rename**

Replace product-facing DpMaster / DP 图谱 / DP ATLAS copy while preserving filesystem paths, URLs, deployment names, and historical source paths.

- [ ] **Step 4: Update canonical counts and run text audits**

Use generated report counts in README/OKF docs. Run searches confirming no stale product-facing names and confirming compatibility identifiers remain.

### Task 5: Full verification and diff audit

**Files:**
- Review all modified files.

**Interfaces:**
- `npm run verify` is the single local quality gate.

- [ ] **Step 1: Run the full gate**

Run: `npm run verify`

Expected: content check, Node tests, zero-warning lint, TypeScript/Vite build, and asset budget all PASS.

- [ ] **Step 2: Run dependency and repository checks**

Run: `npm audit --json` and `git status --short`.

Expected: zero known vulnerabilities; only intended files changed; no branch/worktree created.

- [ ] **Step 3: Review diff for generated/manual separation**

Run: `git diff --check` and inspect `git diff --stat` plus focused diffs for catalog, generator, package manifest, CI, and docs.

Expected: no whitespace errors, no accidental compatibility-identifier rename, no unrelated changes.

