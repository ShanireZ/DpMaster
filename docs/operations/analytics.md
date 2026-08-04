---
type: Runbook
title: Analytics and Alerting Runbook
description: Privacy-bounded RUM, event dashboards, feedback delivery, and error-alert operations for both DP大师 regions.
tags: [operations, analytics, rum, alerting]
status: stable
generated: { by: openai/codex, at: 2026-07-31T15:32:38+08:00 }
sources:
  - resource: ../../site/src/analytics/
  - resource: ../../site/scripts/prerender.mjs
  - resource: ../../site/scripts/check-regional-analytics.mjs
  - resource: ../../site/functions/_analytics-core.js
  - resource: ../../site/functions/_feedback-core.js
  - resource: ../../site/worker.js
  - resource: ../../site/wrangler.jsonc
---

# Event Contract

Both regions send the same bounded first-party event schema to `POST /api/analytics`. The receiver accepts only:

* `page_view`, `route_not_found`;
* `web_vital`;
* `search_used`, `search_no_result`, `problem_outbound`;
* `feedback_opened`, `feedback_submitted`, `feedback_succeeded`, `feedback_failed`;
* `client_error`.

Metadata is capped at eight scalar fields. The browser automatically adds `region` and `build`; Web Vitals add only metric name, numeric value/delta, rating, and navigation type. Search events record query length and result count, never the query text. Analytics must not receive feedback copy, contact details, full URLs, user-agent strings, cookies, account IDs, or IP-derived identifiers.

The UI collects feedback separately. Page name/path and feedback copy are sent only after explicit submission. Contact is optional. Full URL, user agent, and viewport are opt-in diagnostics. A successful receipt means the configured webhook confirmed delivery; a missing or failed webhook returns 503/502 and the UI offers a copy fallback.

# Cloudflare Dashboard

The international Worker writes every accepted event to the `dpmaster` Analytics Engine dataset through the `ANALYTICS` binding. Blob positions are:

| Blob | Meaning |
| ---: | --- |
| 1 | provider |
| 2 | event name |
| 3 | route path |
| 4 | page title |
| 5 | Web Vital metric name |
| 6 | rating |
| 7 | region |
| 8 | build |

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

Keep Cloudflare Web Analytics enabled for independent request/page-view trends; use the first-party dataset for route, feedback, search, outbound-problem, and RUM funnels. The `.cc` deployment relies exclusively on Cloudflare automatic injection (Rocket Loader stays off); source code must not add a second beacon. Course visits are represented only by ordinary route page views; the site does not record lesson-start, lesson-completion, or local learning-progress state.

# EdgeOne Dashboard

Every HTML document published from `dist/edgeone/`, including the real 404 page, contains one statically rendered Cloudflare Web Analytics beacon using the shared production token. This supplies an independent page-view trend for `dp.betaoi.cn`; `pnpm check:analytics` verifies the complete HTML set and rejects missing or duplicate snippets.

The China Adapter writes the identical structured event object to Edge Function logs. In EdgeOne Log Analysis, create saved searches for `analytics_event` and group by `name`, `path`, `metadata.name`, and `metadata.rating`. Create widgets for:

* page views and 404s by route;
* Web Vitals sample count and p75 by metric/route;
* searches with no result;
* feedback success/failure;
* `client_error` count by route and safe message.

EdgeOne access analytics remains the authority for traffic, geography, cache, status code, and edge latency. The first-party function logs are the authority for client-route, feedback, search, outbound-problem, and RUM events. If the platform log retention or aggregation cannot support the desired window, export structured logs to the Tencent logging product approved for the deployment; do not add a public admin dashboard or client-side analytics secret to this static repository.

# Alerts And Secrets

Configure feedback and alert destinations in both production runtimes:

| Variable | Purpose |
| --- | --- |
| `FEEDBACK_WEBHOOK_URL` | Required feedback destination. No successful receipt is returned without it. |
| `FEEDBACK_WEBHOOK_KIND` | `dingtalk`, `wecom`, `feishu`, `slack`, or `discord`. |
| `FEEDBACK_WEBHOOK_SECRET` | Optional DingTalk signature secret. |
| `ALERT_WEBHOOK_URL` | Error-alert destination for `client_error`, `feedback_failed`, and failed feedback delivery. Prefer a different bot/channel from feedback. |
| `ALERT_WEBHOOK_KIND` | Alert webhook format; defaults to the feedback kind. |
| `ALERT_WEBHOOK_SECRET` | Optional alert signature secret. |

Never commit webhook URLs or secrets. Configure provider-side retention to no more than 30 days unless a documented incident or legal requirement needs longer. Alert payloads contain a bounded error message, route, and event metadata; they must not contain feedback text, contact details, stack traces with user data, secrets, or request headers.

# Release Checks

After each regional deployment:

1. Submit one synthetic feedback and match the browser receipt ID to the webhook message.
2. Trigger one route view and confirm `analytics_event`.
3. Confirm LCP, CLS, INP, FCP, and TTFB begin arriving from real navigation.
4. Open a made-up path and confirm an HTTP 404 plus `route_not_found`.
5. Exercise a controlled client error in staging and confirm the alert channel.
6. Verify the Cloudflare Web Analytics dashboard receives `.cc` and `.cn` page views, while first-party dashboards still filter `.cc` as `international` and `.cn` as `china`.
