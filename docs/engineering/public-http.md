---
type: Engineering Contract
title: Public HTTP Contract
description: Public route, sitemap, same-URL Markdown, caching, and edge contracts.
tags: [engineering, contract]
status: stable
generated: { by: openai/codex, at: 2026-10-28T05:00:17.580Z }
sources:
  - resource: ../../site/src/lib/publicRoutes.ts
  - resource: ../../site/src/lib/publicWebContract.ts
  - resource: ../../site/src/lib/discovery.ts
  - resource: ../../site/worker/content-negotiation.js
  - resource: ../../site/scripts/generate-seo.mjs
---

# Public HTTP contract

[PUBLIC_PATHS](../../site/src/lib/publicRoutes.ts) is the sole public route set for prerendering, sitemap, and Markdown generation. Every indexable URL is HTTPS under `https://dp.round1.cc`, self-canonical, directly 200, and free of query/fragment variants. Unknown routes return HTTP 404 with `noindex,nofollow` and no canonical; internal specimens and `/_representations/` paths are never public.

## Discovery

`/sitemap.xml` is UTF-8 sitemap XML, deduplicated and sorted by canonical URL. `lastmod` derives from a semantically changed source's Git or working-tree evidence, never build time. [semantic-source-graph.mjs](../../site/scripts/semantic-source-graph.mjs) owns that projection. Do not hand-edit generated discovery artifacts or maintain another URL list. An empty public set must not publish an empty advertised sitemap.

Robots, `llms.txt`, and route summaries derive from the same source set. Public-content policy is `Content-Signal: search=yes, ai-train=yes, ai-input=yes`; repository robots permits the declared crawlers and contains no `Disallow`. Final edge policy must agree. See [deployment](../../deploy.md#edge-and-discovery-contract) for the zone-wide control-plane boundary.

## Representation selection

Only registered public GET/HEAD pages negotiate `text/html` and `text/markdown` at the same URL. No public `.md` route is added. [content-negotiation.js](../../site/worker/content-negotiation.js) owns RFC 9110 parsing and the test matrix:

| Accept | Selection |
|---|---|
| Missing, `text/*`, or `*/*` | HTML |
| `text/markdown` | Markdown |
| Equal effective preferences | HTML |
| Explicit `q=0` | Exclude that representation |
| Neither supported representation acceptable | 406 |

The parser ignores malformed members and recovers later valid ranges. Media parameters participate in matching, including parameters after `q`. Tests cover quality/specificity, invalid members, GET/HEAD, and conditional requests. APIs, assets, specimens, and unknown paths keep their own routing behavior.

## Response and content invariants

- Merge and deduplicate `Vary: Accept`; send `nosniff`, approved Content-Signal, and same-URL alternate links. Markdown adds canonical, `Content-Type: text/markdown; charset=utf-8`, and `Content-Language: zh-CN`.
- Isolate HTML and Markdown asset/cache keys and validators. HEAD follows GET status/selection/headers with no body; conditional requests match only their own representation. Markdown cache lifetime/scope cannot exceed HTML.
- The Worker preserves representation-specific asset ETags. Final Cloudflare HTML injection may remove HTML ETag; keep established Analytics/JavaScript Detection injection enabled. Markdown retains its independent asset validator.
- Generate Markdown from the same local semantic render as HTML. Preserve headings, prose, code, formulas, tables, image descriptions, and public links; replace interaction with a static explanation and canonical link.
- Exclude scripts, styles, controls, navigation noise, hidden state, private data, tokens, debugging content, and internal asset paths. Do not scrape production HTML or maintain a parallel body.

Run [verification](../operations/verification.md) for source, generated-artifact, HTML, and final-edge evidence.
