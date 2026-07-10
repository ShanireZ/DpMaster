# SEO and Accessibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide route-derived metadata, complete crawl files, route announcements, skip navigation, current-link semantics, focus visibility, and reduced-motion behavior.

**Architecture:** `pageMeta.ts` is a pure route-to-metadata Module backed by `catalog.ts`; `RouteMeta.tsx` is the only DOM-head Adapter. A generator derives sitemap/robots from the same catalog. Shell owns cross-route accessibility infrastructure.

**Tech Stack:** React Router 7, React 19, TypeScript, Node 24, Vite static assets.

## Global Constraints

- Work on current `main`; no branch/worktree.
- Production origin is `https://dp.betaoi.cc`.
- All 37 ready lessons are indexable.
- Lesson title format: `课程名 · 家族名 · DP大师`.
- Generate description, canonical, Open Graph, robots, and complete sitemap.
- Do not add SSR, prerendering, or an SEO registry parallel to `catalog.ts`.

---

### Task 1: Pure route metadata Module

**Files:**
- Create: `site/src/lib/pageMeta.ts`
- Create: `site/scripts/seo-contract.test.mjs`

**Interfaces:**

```ts
export interface PageMeta { title:string; description:string; canonical:string; ogType:'website'|'article' }
export const SITE_ORIGIN = 'https://dp.betaoi.cc'
export function getPageMeta(pathname:string): PageMeta
```

- [ ] **Step 1: Write tests** for home, seven families, all 37 lessons, method, problems, about, and not-found.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement route parsing using `getPart/getLesson`**; do not duplicate course arrays.
- [ ] **Step 4: Verify GREEN**.

### Task 2: RouteMeta DOM Adapter

**Files:**
- Create: `site/src/components/seo/RouteMeta.tsx`
- Modify: `site/src/app/App.tsx`
- Modify: `site/scripts/seo-contract.test.mjs`

**Interfaces:**
- `RouteMeta` reads `useLocation`, calls `getPageMeta`, sets title, description, canonical, `og:title`, `og:description`, `og:url`, `og:type`, and `og:site_name`.

- [ ] **Step 1: Add source contracts** for all tags and singleton upsert behavior.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement `upsertMeta`/`upsertLink` in an effect and mount once inside BrowserRouter**.
- [ ] **Step 4: Run tests/lint/build**.

### Task 3: Generate sitemap and robots

**Files:**
- Create: `site/scripts/generate-seo.mjs`
- Create: `site/public/sitemap.xml`
- Create: `site/public/robots.txt`
- Modify: `site/package.json`
- Modify: `site/scripts/seo-contract.test.mjs`

**Interfaces:**
- `node scripts/generate-seo.mjs --write`
- `node scripts/generate-seo.mjs --check`
- npm script: `check:seo`.

- [ ] **Step 1: Test expected URL set**: home + 7 families + 37 lessons + method/problems/about = 48 unique URLs.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement deterministic XML/text generation from catalog** and check/write modes.
- [ ] **Step 4: Add `check:seo` before tests in `verify` and `generate-seo --write` to prebuild**.
- [ ] **Step 5: Run** `npm run check:seo && npm run build`.

### Task 4: Static homepage metadata

**Files:**
- Modify: `site/index.html`
- Modify: `site/scripts/seo-contract.test.mjs`

- [ ] **Step 1: Require** default description, canonical, Open Graph, theme-color, and WebSite JSON-LD.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Add tags** using `https://dp.betaoi.cc/` and DP大师 homepage copy.
- [ ] **Step 4: Run SEO tests**.

### Task 5: Shell accessibility infrastructure

**Files:**
- Modify: `site/src/components/layout/Shell.tsx`
- Modify: `site/src/components/layout/Sidebar.tsx`
- Modify: `site/src/components/layout/TopBar.tsx`
- Modify: `site/src/components/layout/shell.css`
- Create: `site/scripts/accessibility-contract.test.mjs`

- [ ] **Step 1: Write failing contracts** for skip link, `main#main-content`, route live region, `aria-current`, mobile scrim button semantics, and route name announcement.
- [ ] **Step 2: Verify RED**.
- [ ] **Step 3: Implement Shell** with skip link and polite live region; use NavLink `aria-current="page"`; mark current breadcrumb.
- [ ] **Step 4: Add visible focus styles** for skip link and navigation.
- [ ] **Step 5: Run tests/lint/build**.

### Task 6: Reduced motion and semantic audit

**Files:**
- Modify: `site/src/styles/global.css`
- Modify: `site/scripts/accessibility-contract.test.mjs`

- [ ] **Step 1: Locate the global stylesheet and test for reduced-motion override**.
- [ ] **Step 2: Add** `@media (prefers-reduced-motion: reduce)` disabling nonessential animation/transition and smooth scrolling while preserving state visibility.
- [ ] **Step 3: Test one h1, accessible icon buttons, and no clickable non-button scrim in key layout files**.
- [ ] **Step 4: Run accessibility tests and build**.

### Task 7: Browser and documentation gate

**Files:**
- Modify: `docs/engineering/architecture.md`
- Modify: `docs/operations/verification.md`
- Modify: `docs/product/scope.md`
- Modify: `docs/log.md`

- [ ] **Step 1: Browser navigate** home/family/lesson/static pages and verify title, canonical, description, OG, route announcement, skip link, focus-visible, and current navigation.
- [ ] **Step 2: Emulate reduced motion** when browser capability permits and confirm content remains visible.
- [ ] **Step 3: Document Page Meta ownership, sitemap count, and accessibility contracts**.
- [ ] **Step 4: Run** `npm run verify && npm audit --audit-level=low && git diff --check`.
- [ ] **Step 5: Commit** with `git commit -m "feat: add SEO and accessibility foundations"`.
