# Game Runtime and Lazy Loading Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize shared game audio, deterministic randomness, round statistics, and defer each family game until it approaches the viewport.

**Architecture:** Pure random and round Modules are directly executable in Node. A browser-only audio Adapter lazily owns one AudioContext. `DeferredGame` gates the existing catalog-owned React lazy component without creating another registry.

**Tech Stack:** React 19, TypeScript, IntersectionObserver, Web Audio, Node 24.

## Global Constraints

- Work on current `main`; no branch/worktree.
- Keep game identities and dynamic imports only in `catalog.ts`.
- Trigger load at approximately 400px before viewport; no manual load button.
- Unsupported IntersectionObserver loads immediately.
- Do not unify game rules or difficulty tables.

---

### Task 1: Deterministic RandomSource

**Files:**
- Create: `site/src/components/games/runtime/random.ts`
- Create: `site/scripts/game-runtime.test.mjs`

**Interfaces:**

```ts
export type RandomSource = () => number
export const browserRandom: RandomSource
export function createSeededRandom(seed:number): RandomSource
export function randomInt(random:RandomSource, min:number, maxInclusive:number): number
```

- [ ] **Step 1: Write tests** for repeatable seed sequences, `[0,1)` values, inclusive bounds, and invalid bounds.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement** a small uint32 generator and browser crypto-backed default with Math.random fallback.
- [ ] **Step 4: Verify GREEN**.

### Task 2: Round statistics Module

**Files:**
- Create: `site/src/components/games/runtime/round.ts`
- Create: `site/src/components/games/runtime/useRoundStats.ts`
- Modify: `site/scripts/game-runtime.test.mjs`

**Interfaces:**

```ts
export interface RoundStats { played:number; matched:number; counted:boolean }
export function recordRound(state:RoundStats, matched:boolean): RoundStats
export function startRound(state:RoundStats): RoundStats
export function useRoundStats(): { stats:RoundStats; record(matched:boolean):void; start():void }
```

- [ ] **Step 1: Write tests** proving duplicate record is ignored and start preserves totals while clearing counted.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement pure reducer and thin hook**.
- [ ] **Step 4: Run runtime tests/lint**.

### Task 3: Lazy shared audio

**Files:**
- Create: `site/src/components/games/runtime/audio.ts`
- Create: `site/scripts/game-runtime-architecture.test.mjs`

**Interfaces:**

```ts
export interface Tone { frequency:number; duration?:number; type?:OscillatorType }
export function playGameTone(tone:Tone, muted?:boolean): void
```

- [ ] **Step 1: Add source contracts**: no AudioContext at module evaluation, one shared context variable, muted early return, compatibility constructor.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement audio Adapter** creating/resuming context inside `playGameTone` only.
- [ ] **Step 4: Run source tests and build**.

### Task 4: DeferredGame

**Files:**
- Create: `site/src/components/games/runtime/DeferredGame.tsx`
- Create: `site/src/components/games/runtime/deferred-game.css`
- Modify: `site/src/pages/PartPage.tsx`
- Modify: `site/src/pages/part.css`
- Modify: `site/scripts/game-runtime-architecture.test.mjs`

**Interfaces:**

```ts
export function DeferredGame({ children, label }:{children:ReactNode;label:string}): JSX.Element
```

- [ ] **Step 1: Write failing contracts** for rootMargin `400px`, one-way loaded state, immediate unsupported-browser path, `aria-busy`, and PartPage ownership.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement IntersectionObserver gate** and render Suspense/Game only after `ready`.
- [ ] **Step 4: Run tests/lint/build**.

### Task 5: Migrate all seven games

**Files:**
- Modify: `site/src/components/games/PackMasterGame.tsx`
- Modify: `site/src/components/games/LISChainGame.tsx`
- Modify: `site/src/components/games/StoneMergeGame.tsx`
- Modify: `site/src/components/games/PowerAccelGame.tsx`
- Modify: `site/src/components/games/RerootGame.tsx`
- Modify: `site/src/components/games/TreePartyGame.tsx`
- Modify: `site/src/components/games/BitBoardGame.tsx`
- Modify: `site/scripts/game-runtime-architecture.test.mjs`

- [ ] **Step 1: Require no local `AudioContext`, `blip`, direct `Math.random`, or `countedThisRound`** in game files.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Replace random generation** with `randomInt(browserRandom,...)` and audio calls with `playGameTone`.
- [ ] **Step 4: Replace duplicated stats** where present with `useRoundStats`; call `stats.start()` on shuffle/difficulty/reset and `stats.record(win)` on first reveal.
- [ ] **Step 5: Run** `node --test scripts/game-runtime*.test.mjs && npm run lint && npm run build`.

### Task 6: Lazy-load browser gate and docs

**Files:**
- Modify: `docs/engineering/architecture.md`
- Modify: `docs/log.md`

- [ ] **Step 1: Browser verify** initial family page has no game chunk, scrolling near game mounts it once, interaction works after scrolling away/back.
- [ ] **Step 2: Verify all seven games** reveal/reset/difficulty controls and zero console errors.
- [ ] **Step 3: Document runtime Interfaces and lazy threshold**.
- [ ] **Step 4: Run** `npm run verify && git diff --check`.
- [ ] **Step 5: Commit** with `git commit -m "feat: add lazy game runtime"`.
