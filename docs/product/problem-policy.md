---
type: Policy
title: Luogu Problem Policy
description: DpMaster only uses Luogu-native P/B problems and records caveats for thin or disputed pools.
tags: [content, luogu, policy]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/src/data/problems.ts
  - site/src/content/b/LCS.tsx
  - site/src/content/d/GridDP.tsx
---

# Rule

Examples and exercises must use Luogu-native problem IDs with prefix `P` or `B`. Do not use RemoteJudge prefixes such as `SP`, `UVA`, `CF`, `AT`, `POJ`, `SGU`, or `gym`. Do not use `U` user-created problems or `T` temporary contest problems as official examples or exercises.

Contest labels such as USACO, NOIP, NOI, POI, SCOI, or CSP do not by themselves imply RemoteJudge. The problem ID prefix is the primary local/native signal.

# Current Index

The current `site/src/data/problems.ts` index has:

* 158 total problem slots.
* 84 example slots.
* 74 exercise slots.
* 112 unique problem IDs.

The index is derived from implemented content pages and should be updated whenever examples or exercises change.

# Known Gaps

Some concepts have thin native problem pools:

* LCIS has no official P/B template currently used by the site; it is treated as a concept note in the LCS lesson rather than forced into the exercise list.
* 打家劫舍 and common stock-buying names do not have exact Luogu-native counterparts; DpMaster teaches the same state-machine idea through native constrained-selection problems and P2569.
* 分组 / 混合 / 依赖背包 and some interval/bitmask variants have narrower pools; reuse and explicit caveats are preferred over invented coverage.

# Rejected Or Cautious Items

Do not silently add these without fresh review:

| ID | Reason |
|---|---|
| `P4302` | Older notes considered it possibly unsuitable or needing manual confirmation. |
| `P1140` | Older notes marked the source/fit as disputed for this corpus. |
| `P5365` | Greedy + binary search, not a multi-knapsack teaching fit. |
| `P1877` | Reachability DP, not a multi-knapsack teaching fit. |
| `U362056` | User-created LCIS template; violates the P/B-only rule. |

Historical notes also rejected `P2701`, but the current implemented D/Grid lesson uses it as a maximum-square exercise. Treat current content as authoritative, and re-check the problem fit only if D/Grid is revised.

# Difficulty Caveat

Luogu difficulty labels can drift and are rendered client-side. Treat stored difficulty strings as helpful labels, not legal truth. Re-check difficulty during major content refreshes.

