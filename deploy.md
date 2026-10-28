# Deployment and feedback

Run commands from `site/`. The only production target is `site/dist/` → Cloudflare Workers Static Assets → `https://dp.round1.cc`, using Worker `dpmaster` and entry `worker.js`. [wrangler.jsonc](site/wrangler.jsonc) owns routing and asset configuration. Release and control-plane writes require explicit authorization.

## Prerequisites and release

Install the Node and pnpm versions declared by [site/.node-version](site/.node-version) and [package.json](site/package.json) globally, without Corepack. Install Wrangler globally and authenticate it to an account authorized for the Worker and its custom domain. Keep tokens and authentication caches outside Git.

The following table is parsed by `scripts/check-toolchain-drift.mjs`; update it after a separately approved global CLI upgrade and rerun verification.

| CLI | Baseline |
| --- | --- |
| wrangler | 4.128.0 |

```bash
pnpm install --frozen-lockfile
pnpm release
```

`pnpm release` runs the complete `pnpm verify` gate once and deploys its resulting artifact. `pnpm deploy:cf` is the low-level deployment command and requires a completed full verification of the exact artifact. CI verifies changes and holds no production secrets. See [verification](docs/operations/verification.md) for local and release evidence.

The build generates route HTML, same-URL Markdown assets, the themed 404, and discovery files from [PUBLIC_PATHS](site/src/lib/publicRoutes.ts). Keep `run_worker_first: true` so matching static assets cannot bypass negotiation; keep `html_handling: drop-trailing-slash` and `not_found_handling: 404-page`.

## Worker configuration

Set secrets through the provider or `wrangler secret put NAME`; never commit values, `.env`, `.dev.vars`, or provider/login caches. Variable changes take effect only after deploying the intended Worker version.

| Variable | Purpose |
|---|---|
| `FEEDBACK_WEBHOOK_URL` | Secret feedback destination URL; required for direct delivery. |
| `FEEDBACK_WEBHOOK_KIND` | `dingtalk`, `wecom`, `feishu`, `slack`, or `discord`. |
| `FEEDBACK_WEBHOOK_SECRET` | Optional DingTalk signing secret. |
| `ALERT_WEBHOOK_URL` | Secret alert destination; prefer a separate channel. |
| `ALERT_WEBHOOK_KIND` | Alert format; defaults to feedback kind. |
| `ALERT_WEBHOOK_SECRET` | Optional alert signing secret. |
| `FEEDBACK_RELAY_URL` | Optional relay endpoint; feedback and alerts use it when configured. |
| `FEEDBACK_RELAY_SECRET` | Shared relay secret matching the relay host. |
| `EGRESS_DIAG_SECRET` | Temporarily enables `POST /api/_diag/egress`. Remove and redeploy after investigation. |

## Delivery and diagnostics

[webhook-core.js](site/worker/webhook-core.js) tries `fetch()` first and falls back through [socket-fetch.js](site/worker/socket-fetch.js) only for 52x responses or thrown transport errors. Other 4xx/5xx responses are not retried. Keep this order: socket connections cannot target Cloudflare IP ranges, while destinations such as Slack or Discord may sit behind Cloudflare.

Delivery reports `transport` as `fetch`, `socket`, or `fetch+socket`. Signing happens before transport selection. When both transports fail, preserve the fetch result and include the socket failure reason. The tested relay protocol remains supported: `x-dp-relay-secret`, `x-dp-client-ip`, and `x-dp-relay-kind: alert`. [feedback-core.js](site/worker/feedback-core.js) is also the relay-host reference implementation.

The egress probe compares fetch and socket requests to its configured control targets without sending messages. Authenticate with `x-dp-diag-secret`; an unset or invalid secret falls through exactly like an unknown static path. Removing the secret alone does not disable a deployed version: redeploy after removal.

For DingTalk, configure a group webhook bot with `FEEDBACK_WEBHOOK_KIND=dingtalk` and its full URL. Signed bots also need `FEEDBACK_WEBHOOK_SECRET`. Keep any required literal bot keywords such as `反馈` or `DP大师` consistent with delivered Chinese copy. Provider console setup is an operator responsibility.

## Feedback interface

`FeedbackWidget` submits same-origin JSON to `POST /api/feedback`. The source [feedback-core.js](site/worker/feedback-core.js) owns exact validation and field limits; UI labels remain Chinese.

- Allowed `kind` values: `内容错漏`, `显示异常`, `其他建议`.
- `description` is required (4–2,000 characters after trimming); contact is optional (120 characters).
- Page and route identify the context. URL, user agent, viewport, screen, browser, device, locale, and time-zone diagnostics are opt-in.
- The request limit is 16,000 bytes. Non-JSON, cross-origin, malformed, oversized, and invalid requests receive 415, 403, 400, 413, and 422 respectively.
- The in-memory limiter allows ten submissions per source in a rolling 30-minute window; the next receives 429 and `Retry-After`. This is per edge instance. Strict global enforcement needs an authorized platform rule.
- Valid requests log `feedback_received`. Confirmed delivery returns 200 with `ok: true`, `status: delivered`, and `requestId`. Missing delivery configuration returns 503 `delivery_unavailable`; forwarding failure returns 502 `delivery_failed`; logging failure returns 500 `log_failed`.
- Match `requestId` to `feedback_webhook` and the destination message. A received log alone is not delivery evidence. Logs must exclude webhook URLs and signing secrets.

## Edge and discovery contract

Read the [public HTTP contract](docs/engineering/public-http.md) before changing URLs, caching, or content negotiation.

Keep proxy-injected Cloudflare Web Analytics/RUM enabled and Rocket Loader off; source and built HTML contain no manual beacon. CSP must allow the injected script and collection endpoints. Bare HTTP clients may not trigger injection; use real navigation and the provider dashboard for RUM evidence.

The approved public-content signal is `search=yes, ai-train=yes, ai-input=yes`. Repository robots is authoritative and has no `Disallow`. Cloudflare managed robots must stay off: it is zone-wide and affects other `round1.cc` hosts. Any change requires the affected owners' approval. Check the final edge response for managed-block injection and request-level crawler blocks before submitting a sitemap.

After an authorized release, inspect the Worker route/binding, public HTML and Markdown GET/HEAD, 406 responses, hidden representation paths, real 404s, robots, sitemap, llms, and route summaries. Submit a synthetic feedback only with message-send authorization, confirm its receipt at the destination, and validate analytics separately. Search-console submissions and observation receipts belong in the operator workspace, not this document.

## Troubleshooting

| Symptom | Check |
|---|---|
| Known deep link returns 404 | Published `dist/`, route HTML, and asset HTML handling. |
| Unknown URL returns 200 | `404-page` and generated `404.html`. |
| API returns HTML | Method, exact API URL, and deployed Worker version. |
| Feedback returns 502/503 | Destination variables and delivery logs for the request ID. |
| Feedback returns 429 | Rolling-window limit and `Retry-After`. |
| DingTalk rejects signing/keyword | Matching signing key and configured Chinese keyword. |
| Dynamic-import/preload error repeats | HTML cache policy and hashed JS/CSS availability; automatic recovery reloads at most once per build/path. |
| Canonical uses an obsolete host | Artifact/source alignment; rerun SEO checks before release. |

## References

- [Workers Static Assets routing](https://developers.cloudflare.com/workers/static-assets/routing/)
- [Workers secrets](https://developers.cloudflare.com/workers/configuration/secrets/)
- [Workers TCP sockets](https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/)
- [DingTalk group webhook bots](https://open-dingtalk.github.io/developerpedia/docs/learn/bot/webhook/overview/)
