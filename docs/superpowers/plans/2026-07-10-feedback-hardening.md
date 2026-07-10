# Feedback Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make feedback validation, 30-minute/10-request limiting, structured logging, delivery receipts, and dialog accessibility executable and consistent across Cloudflare and EdgeOne.

**Architecture:** Keep `functions/_feedback-core.js` as the deep portable Module. Production callers use `handleFeedback(request, env)`; tests may inject time, source identity, logger, fetch, and request ID through an optional runtime object. Adapters only route requests and never duplicate policy.

**Tech Stack:** Fetch API, Web Crypto, React 19, Node 24 test runner, Cloudflare Workers/Pages, EdgeOne generated function.

## Global Constraints

- Work on current `main`; do not create a branch or worktree.
- A valid request is successful once its structured log is written, even if Webhook forwarding fails.
- Same source: at most 10 accepted feedback requests in a rolling 30-minute window; request 11 returns 429 with `Retry-After`.
- No database, KV, Durable Object, queue, or new dependency.
- Preserve all current deployment identifiers and providers.

---

### Task 1: Executable feedback contract

**Files:**
- Create: `site/scripts/feedback-core.test.mjs`
- Modify: `site/functions/_feedback-core.js`

**Interfaces:**
- Produces: `handleFeedback(request, env, runtime?)`
- Produces: `createFeedbackLimiter({ limit, windowMs })`
- Runtime overrides: `{ now, sourceKey, log, fetch, randomUUID, limiter }`

- [ ] **Step 1: Write failing tests**

Cover bad content type, malformed JSON, invalid kind, field lengths, cross-origin request, accepted request receipt, Webhook absent/success/non-2xx/error, and exact response JSON.

```js
const response = await handler(request({ description: '有效反馈' }), {}, runtime)
assert.equal(response.status, 200)
assert.deepEqual(await response.json(), {
  ok: true,
  status: 'logged',
  forwarded: false,
  requestId: 'feedback-test-id',
})
```
- [ ] **Step 2: Verify RED**

Run: `node --test scripts/feedback-core.test.mjs`

Expected: FAIL because `createFeedbackLimiter` and delivery receipts do not exist.

- [ ] **Step 3: Implement normalization and stable responses**

Use these constants and response shape in `_feedback-core.js`:

```js
const FEEDBACK_KINDS = new Set(['内容有误', '显示异常', '功能问题', '建议', '其他'])
const LIMITS = { description: 2000, steps: 1000, contact: 120, page: 120, path: 160, url: 500, ua: 300 }
const fail = (error, message, status, headers = {}) => json({ ok: false, error, message }, status, headers)
```

Check `Content-Type`, `Origin`, request size, kind, and every field before logging.

- [ ] **Step 4: Run contract tests**

Run: `node --test scripts/feedback-core.test.mjs`

Expected: validation and delivery tests PASS; limiter tests remain RED until Task 2.

### Task 2: Portable rolling limiter

**Files:**
- Modify: `site/functions/_feedback-core.js`
- Modify: `site/scripts/feedback-core.test.mjs`

**Interfaces:**
- `createFeedbackLimiter({limit: 10, windowMs: 1_800_000}).take(source, now)` returns `{allowed,retryAfter}`.

- [ ] **Step 1: Add 10/11 and window-reset tests**

```js
for (let index = 0; index < 10; index++) assert.equal(limiter.take('ip-a', now).allowed, true)
assert.equal(limiter.take('ip-a', now).allowed, false)
assert.equal(limiter.take('ip-b', now).allowed, true)
assert.equal(limiter.take('ip-a', now + 1_800_001).allowed, true)
```

- [ ] **Step 2: Verify RED**

Run: `node --test scripts/feedback-core.test.mjs --test-name-pattern="limiter"`

Expected: FAIL on request 11 and expiry.

- [ ] **Step 3: Implement bounded timestamp buckets**

Store at most ten timestamps per active source, discard timestamps `<= now-windowMs`, delete expired buckets during periodic request cleanup, and attach `Retry-After` to 429.

- [ ] **Step 4: Verify GREEN**

Run: `node --test scripts/feedback-core.test.mjs`

Expected: all feedback core tests PASS.

### Task 3: Runtime Adapters and generated EdgeOne behavior

**Files:**
- Modify: `site/worker.js`
- Modify: `site/functions/api/feedback.js`
- Modify: `site/scripts/postbuild.mjs`
- Create: `site/scripts/feedback-adapters.test.mjs`

**Interfaces:**
- Adapters pass the original Request and environment unchanged to the core.
- API exceptions return JSON 500; they must never fall through to SPA HTML.

- [ ] **Step 1: Write source and generated-output tests**

Assert only POST is accepted, OPTIONS is 204, 405 includes `Allow: POST`, postbuild removes all ESM `export` keywords from inlined core, and `/api/feedback` exceptions produce JSON.

- [ ] **Step 2: Verify RED**

Run: `node --test scripts/feedback-adapters.test.mjs`

Expected: FAIL because current EdgeOne catch falls back to HTML.

- [ ] **Step 3: Implement thin adapters**

Change inlining to `.replace(/^export /gm, '')` and generate a feedback-only catch response:

```js
return new Response(JSON.stringify({ ok:false, error:'internal', message:'反馈服务暂时不可用' }), {
  status: 500,
  headers: { 'content-type': 'application/json; charset=utf-8' },
})
```

- [ ] **Step 4: Verify adapters**

Run: `node --test scripts/feedback-adapters.test.mjs`

Expected: PASS.

### Task 4: Accessible FeedbackWidget

**Files:**
- Modify: `site/src/components/feedback/FeedbackWidget.tsx`
- Modify: `site/src/components/feedback/feedback.css`
- Create: `site/scripts/feedback-ui-contract.test.mjs`

**Interfaces:**
- Client understands `{ok,status,error,message,requestId}`.
- `rate_limited` maps to “提交太频繁，请稍后再试”。

- [ ] **Step 1: Write failing source contracts**

Assert trigger focus restoration, focusable-element trap, body scroll restoration, `fieldset/legend`, `aria-live`, `aria-pressed`, and 429 copy.

- [ ] **Step 2: Verify RED**

Run: `node --test scripts/feedback-ui-contract.test.mjs`

Expected: FAIL on missing focus and field semantics.

- [ ] **Step 3: Implement dialog behavior**

Keep a `triggerRef`, trap Tab within `dialogRef`, store/restore `document.body.style.overflow`, restore trigger focus on close, and set an explicit `errorMessage` from response status.

- [ ] **Step 4: Verify UI contract and build**

Run: `node --test scripts/feedback-ui-contract.test.mjs && npm run lint && npm run build`

Expected: PASS with zero warnings.

### Task 5: Operations documentation and P0 gate

**Files:**
- Modify: `deploy.md`
- Modify: `docs/operations/verification.md`
- Modify: `docs/log.md`

- [ ] **Step 1: Document logged/forwarded receipts and limiter scope**

State that built-in limiting is per edge instance, recommend matching WAF rules for global enforcement, and update troubleshooting examples to include `requestId`, `forwarded`, 422, 429, and 500.

- [ ] **Step 2: Run P0 verification**

Run: `npm run verify && npm audit --audit-level=low && git diff --check`

Expected: all tests/build/assets pass, zero audit findings, zero whitespace errors.

- [ ] **Step 3: Commit P0**

```powershell
git add site/functions site/worker.js site/scripts site/src/components/feedback deploy.md docs
git commit -m "feat: harden feedback intake"
```
