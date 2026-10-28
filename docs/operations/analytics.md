---
type: Runbook
title: Analytics and Alerting Runbook
description: Privacy-bounded RUM, event dashboards, feedback delivery, and error-alert operations for the DpMaster Cloudflare Worker.
tags: [operations, analytics, rum, alerting]
status: stable
generated: { by: openai/codex, at: 2026-10-28T05:02:45.233Z }
sources:
  - resource: ../../site/src/analytics/
  - resource: ../../site/scripts/prerender.mjs
  - resource: ../../site/scripts/check-html.mjs
  - resource: ../../site/worker/analytics-core.js
  - resource: ../../site/worker/feedback-core.js
  - resource: ../../site/worker/egress-probe.js
  - resource: ../../site/worker.js
  - resource: ../../site/wrangler.jsonc
---

# Event Contract

The browser sends a bounded first-party event schema to the same-origin `POST /api/analytics`. The receiver accepts only:

* `page_view`, `route_not_found`;
* `web_vital`;
* `search_used`, `search_no_result`, `problem_outbound`;
* `feedback_opened`, `feedback_submitted`, `feedback_succeeded`, `feedback_failed`;
* `client_error`.

Metadata is capped at eight scalar fields. The browser automatically adds `build`; Web Vitals add only metric name, numeric value/delta, rating, and navigation type. Search events record query length and result count, never the query text. Analytics must not receive feedback copy, contact details, full URLs, user-agent strings, cookies, account IDs, or IP-derived identifiers.

The UI collects feedback separately. Page name/path and feedback copy are sent only after explicit submission. Contact is optional. Full URL, user agent, and viewport are opt-in diagnostics. A successful receipt means the configured webhook confirmed delivery; a missing or failed webhook returns 503/502 and the UI offers a copy fallback.

The receiver never trusts a client-supplied IP. On Cloudflare it uses the platform-injected `cf-connecting-ip` header, which the platform guarantees and overwrites. The delivered message annotates that IP with a coarse region (country name plus first-level region and city) taken from `request.cf`, for the same reason: it is edge-supplied and cannot be forged. ★ A relayed submission drops the annotation — `request.cf` would then describe the relay host, not the visitor. `x-real-ip` / `x-forwarded-for` are fallbacks only for a non-Cloudflare relay host, and the rate limiter keys on the same derived IP. A relay may override the IP with `x-dp-client-ip`, but only when `x-dp-relay-secret` matches in constant time and the value is a bare IPv4/IPv6 literal.

# Delivery

Webhook delivery tries fetch first, with socket fallback only for 52x responses or thrown transport errors. Other application errors are not retried. The relay protocol remains implemented and tested; `worker/feedback-core.js` also serves as its reference implementation. Configuration and API response contracts are in [deploy.md](../../deploy.md#worker-configuration).

The temporary egress probe compares both transports without sending messages. It requires `EGRESS_DIAG_SECRET`; after investigation, remove the secret and redeploy because secrets are version-bound. Historical probe results do not prove current production reachability.

# Cloudflare Dashboard

The Worker writes every accepted event to the `dpmaster` Analytics Engine dataset through the `ANALYTICS` binding. Blob positions are:

| Blob | Meaning |
| ---: | --- |
| 1 | provider |
| 2 | event name |
| 3 | route path |
| 4 | page title |
| 5 | Web Vital metric name |
| 6 | rating |
| 7 | reserved (was region) |
| 8 | build |

Blob 7 held the region until the site collapsed to one origin. It is written as an empty string rather than removed: the dataset still holds historical rows, and dropping the slot would shift `build` from blob 8 to blob 7 and mix two schemas in one table.

Double positions are metric value, metric delta, and event count.

Use Cloudflare Analytics Engine SQL for the event board. Core queries:

```sql
SELECT blob2 AS event, SUM(double3) AS events
FROM dpmaster
WHERE timestamp > NOW() - INTERVAL '7' DAY
GROUP BY event
ORDER BY events DESC
```

```sql
SELECT blob3 AS path, blob5 AS metric,
       quantile(0.75)(double1) AS p75,
       SUM(double3) AS samples
FROM dpmaster
WHERE timestamp > NOW() - INTERVAL '7' DAY
  AND blob2 = 'web_vital'
GROUP BY path, metric
ORDER BY metric, p75 DESC
```

Automatic injection requires browser-like navigation; a bare HTTP client without a beacon does not prove injection is disabled. Inspect real navigation and the provider dashboard. Keep Web Analytics/RUM enabled and Rocket Loader off, with no manual source/build beacon; `pnpm check:html` enforces that build boundary. Course visits are represented only by ordinary route page views; the site does not record lesson-start, lesson-completion, or local learning-progress state.

# Alerts And Secrets

Configure feedback and alert destinations on the production Worker:

| Variable | Purpose |
| --- | --- |
| `FEEDBACK_WEBHOOK_URL` | Required feedback destination. No successful receipt is returned without it. |
| `FEEDBACK_WEBHOOK_KIND` | `dingtalk`, `wecom`, `feishu`, `slack`, or `discord`. |
| `FEEDBACK_WEBHOOK_SECRET` | Optional DingTalk signature secret. |
| `ALERT_WEBHOOK_URL` | Error-alert destination for `client_error`, `feedback_failed`, and failed feedback delivery. Prefer a different bot/channel from feedback. |
| `ALERT_WEBHOOK_KIND` | Alert webhook format; defaults to the feedback kind. |
| `ALERT_WEBHOOK_SECRET` | Optional alert signature secret. |
| `FEEDBACK_RELAY_URL` | Optional relay host endpoint. Feedback and alerts both ride it. |
| `FEEDBACK_RELAY_SECRET` | Shared relay secret; must match the relay host. |
| `EGRESS_DIAG_SECRET` | Enables `POST /api/_diag/egress`. Leave unset outside an active investigation. |

Never commit webhook URLs or secrets. Configure provider-side retention to no more than 30 days unless a documented incident or legal requirement needs longer. Alert payloads contain a bounded error message, route, and event metadata; they must not contain feedback text, contact details, stack traces with user data, secrets, or request headers.

# Release Checks

After each deployment:

1. Submit one synthetic feedback and match the browser receipt ID to the webhook message.
2. Trigger one route view and confirm `analytics_event`.
3. Confirm LCP, CLS, INP, FCP, and TTFB begin arriving from real navigation.
4. Open a made-up path and confirm an HTTP 404 plus `route_not_found`.
5. Exercise a controlled client error in staging and confirm the alert channel.
6. Verify the Cloudflare Web Analytics dashboard receives `dp.round1.cc` page views.

Delivery and alert checks require configured destinations and explicit authorization to send test messages. Record actual results outside the repository.
