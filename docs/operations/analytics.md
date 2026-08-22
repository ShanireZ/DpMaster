---
type: Runbook
title: Analytics and Alerting Runbook
description: Privacy-bounded RUM, event dashboards, feedback delivery, and error-alert operations for the DP大师 Cloudflare Worker.
tags: [operations, analytics, rum, alerting]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
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

The receiver never trusts a client-supplied IP. On Cloudflare it uses the platform-injected `cf-connecting-ip` header, which the platform guarantees and overwrites. `x-real-ip` / `x-forwarded-for` are fallbacks only for a non-Cloudflare relay host, and the rate limiter keys on the same derived IP. A relay may override the IP with `x-dp-client-ip`, but only when `x-dp-relay-secret` matches in constant time and the value is a bare IPv4/IPv6 literal.

# Outbound Delivery Is An Open Problem

Cloudflare datacenter egress to DingTalk (`oapi.dingtalk.com`) fails the TLS handshake — reproduced repeatedly through 2026-08, stable 525, while ordinary overseas hosts reach it fine. Until 2026-08 the site worked around this by having the browser post feedback and analytics cross-origin to the now-retired China site, which forwarded into DingTalk. Retiring that site removed the workaround, and **there is currently no verified path from this Worker into DingTalk.**

The relay protocol is still implemented and tested (`FEEDBACK_RELAY_URL` plus `x-dp-relay-secret` / `x-dp-client-ip` / `x-dp-relay-kind: alert`); it just has no host pointed at it. `worker/feedback-core.js` is both the Worker handler and the reference implementation for whatever host takes that role.

Before choosing a transport, run the egress probe below and read the real errors. The candidate answers, roughly in order of how little they cost:

1. **Raw sockets may already work.** Cloudflare documents that `connect()` from `cloudflare:sockets` egresses from a prefix that is *not* in Cloudflare's published IP ranges, unlike `fetch()`. If DingTalk blocks by published Cloudflare range, hand-rolling the HTTPS request over `connect()` reaches it. The probe tests exactly this.
2. **A different DingTalk entry point.** `api.dingtalk.com` is a separate ingress from `oapi.dingtalk.com`; the probe covers both.
3. **A different destination the Worker can reach.** `webhookBody()` already emits DingTalk, WeCom, Feishu, Slack, and Discord shapes. Lark international, Slack, and Discord are all plain overseas HTTPS.
4. **Cloudflare Tunnel plus Workers VPC.** Bind a `cloudflared` tunnel as a VPC Network and `fetch()` the relay through it. No public IP, no inbound port, no filing; Workers VPC is in beta and free on all Workers plans.
5. **An external relay host.** Any always-on machine or serverless platform that can reach DingTalk, running the relay protocol above. Worker-side cost is two environment variables.

Whichever path wins, record the decision here and in `deploy.md`, and delete the alternatives that no longer apply.

## Egress Probe

`POST /api/_diag/egress` measures both egress paths (`fetch()` and `connect()`) against DingTalk's two ingresses, WeCom, Feishu, Lark international, Telegram, and a Cloudflare control host. Every target is probed with a side-effect-free `GET /` or `HEAD /`; no message is ever sent.

The endpoint does not exist until `EGRESS_DIAG_SECRET` is set on the Worker, and an unauthenticated or mis-keyed request falls through to static assets and returns an ordinary 404 — the endpoint's existence is not observable. Unset the variable once the transport decision is made.

```bash
curl.exe -s -X POST https://dp.round1.cc/api/_diag/egress -H "x-dp-diag-secret: THE_SECRET"
```

Read the per-target `fetch.error` and `socket.error` strings verbatim; the control host distinguishes "DingTalk is blocked" from "the probe itself is broken".

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

Keep Cloudflare Web Analytics enabled for independent request/page-view trends; use the first-party dataset for route, feedback, search, outbound-problem, and RUM funnels. The deployment relies exclusively on Cloudflare automatic injection (Rocket Loader stays off); neither the source nor the prerender output may add a second beacon, and `pnpm check:html` fails the build if one appears in any HTML document. Course visits are represented only by ordinary route page views; the site does not record lesson-start, lesson-completion, or local learning-progress state.

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
| `FEEDBACK_RELAY_URL` | Relay host endpoint, once a transport is chosen. Feedback and alerts both ride it. |
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

Steps 1 and 5 cannot pass until the outbound-delivery question above is settled.
