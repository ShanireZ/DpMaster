# Playback Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize playback state, timing, controls, keyboard behavior, and accessibility across grid, tree, board, and reroot visualizations.

**Architecture:** A pure `state.ts` owns legal transitions. `useStepPlayer.ts` owns React timing. `PlaybackControls.tsx` is the only standard control Adapter and renders full or compact layouts from the same player Interface.

**Tech Stack:** React 19, TypeScript 6, Node 24 test runner, Lucide React.

## Global Constraints

- Work on current `main`; no branch/worktree.
- Full and compact layouts expose reset, previous, play/pause, next, progress, and speed.
- Empty tracks never produce index -1.
- Do not force specialized non-frame animations into this Module.

---

### Task 1: Pure playback state

**Files:**
- Create: `site/src/components/dp-engine/playback/state.ts`
- Create: `site/scripts/playback-state.test.mjs`

**Interfaces:**

```ts
export type PlaybackSpeed = 0.5 | 1 | 2
export function clampPlaybackIndex(index: number, count: number): number
export function nextPlaybackIndex(index: number, count: number): number
export function previousPlaybackIndex(index: number, count: number): number
export function normalizePlaybackSpeed(value: number): PlaybackSpeed
```

- [ ] **Step 1: Write boundary tests** for count 0/1, negative and oversized indices, previous/next, and invalid speeds.
- [ ] **Step 2: Verify RED** with `node --test scripts/playback-state.test.mjs`.
- [ ] **Step 3: Implement the pure functions** using `Math.max(0, Math.min(Math.max(0,count-1), index))` and allowed speeds `[0.5,1,2]`.
- [ ] **Step 4: Verify GREEN** with the same command.

### Task 2: Deep useStepPlayer hook

**Files:**
- Move/Modify: `site/src/components/dp-engine/useStepPlayer.ts` -> `site/src/components/dp-engine/playback/useStepPlayer.ts`
- Create: `site/src/components/dp-engine/playback/types.ts`

**Interfaces:**

```ts
export interface StepPlayer {
  index: number; count: number; playing: boolean; speed: PlaybackSpeed
  canPrevious: boolean; canNext: boolean; canPlay: boolean
  setIndex(index:number): void; previous(): void; next(): void
  reset(): void; play(): void; pause(): void; toggle(): void
  setSpeed(speed:PlaybackSpeed): void
}
export function useStepPlayer(count:number): StepPlayer
```

- [ ] **Step 1: Add static hook contract tests** to `scripts/playback-architecture.test.mjs`.
- [ ] **Step 2: Verify RED** because the new path and flags do not exist.
- [ ] **Step 3: Implement hook** with timer cleanup, empty-count guards, end replay, count-change pause/clamp, and state helpers from Task 1.
- [ ] **Step 4: Run** `node --test scripts/playback-*.test.mjs && npm run lint` and expect PASS.

### Task 3: PlaybackControls Adapter

**Files:**
- Create: `site/src/components/dp-engine/playback/PlaybackControls.tsx`
- Create: `site/src/components/dp-engine/playback/playback.css`
- Modify: `site/scripts/playback-architecture.test.mjs`

**Interfaces:**

```ts
export interface PlaybackControlsProps {
  player: StepPlayer
  variant?: 'full' | 'compact'
  label?: string
  className?: string
}
```

- [ ] **Step 1: Write contracts** for six controls, `aria-keyshortcuts`, live status, editable-target keyboard bypass, and both variants.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement controls** with Home/Space/ArrowLeft/ArrowRight on a focusable group; slider max uses `Math.max(0,count-1)`.
- [ ] **Step 4: Run tests/lint/build** and expect PASS.

### Task 4: Grid and tree migration

**Files:**
- Modify: `site/src/components/dp-engine/DPViz.tsx`
- Modify: `site/src/components/dp-engine/dp-viz.css`
- Modify: `site/src/components/demos/treedp/TreeCanvas.tsx`
- Modify: `site/src/components/demos/treedp/treedp-demo.css`

- [ ] **Step 1: Add architecture assertions** that these files import `PlaybackControls` and no longer render duplicated play/speed buttons.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Replace controls** with `variant="full"` for DPViz and `variant="compact"` for TreeCanvas while keeping existing model rendering unchanged.
- [ ] **Step 4: Run** `node --test scripts/playback-architecture.test.mjs && npm run build` and expect PASS.

### Task 5: Board and reroot migration

**Files:**
- Modify: `site/src/components/demos/bitmask/BoardDemo.tsx`
- Modify: `site/src/components/demos/bitmask/bitmask-demo.css`
- Modify: `site/src/components/demos/reroot/RerootTwoPassDemo.tsx`
- Modify: `site/src/components/demos/reroot/reroot-demo.css`

- [ ] **Step 1: Extend architecture tests** to require the common Adapter.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Migrate both carriers** to compact controls and the relocated hook; preserve current frame generation and legends.
- [ ] **Step 4: Run tests/lint/build** and expect PASS.

### Task 6: Playback browser and documentation gate

**Files:**
- Modify: `docs/engineering/visualization-engine.md`
- Modify: `docs/log.md`

- [ ] **Step 1: Browser smoke** grid/tree/board/reroot: click next, toggle play, move slider, select 2x, use keyboard, verify zero console errors.
- [ ] **Step 2: Document** common Interface, variants, keyboard rules, and specialized-animation non-goal.
- [ ] **Step 3: Run** `npm run verify && git diff --check`.
- [ ] **Step 4: Commit** with `git commit -m "feat: deepen visualization playback"` after staging only playback-related files.
