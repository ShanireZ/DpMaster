---
type: convention
title: Related engineering skill workflows
description: Recommends when to use the installed engineering skills and how their workflows compose.
tags: [agents, skills, workflow]
status: stable
---

# Related Engineering Skills

These are recommendations, not automatic invocations. Use a skill only when the current task matches it or the user explicitly requests it.

## Recommended workflows

| Situation | Recommended skill or sequence |
| --- | --- |
| A large or foggy effort needs decisions before implementation | `wayfinder` to map decision tickets; use `research`, `prototype`, or grilling only for the questions that need them. |
| A conversation already contains a settled requirement | `to-spec` to synthesize and publish the specification, then `to-tickets` to create tracer-bullet implementation tickets with blocking edges. |
| A specification or ticket set is ready to build | `implement`, using `tdd` at agreed seams, followed by `code-review` against both repository standards and the originating specification. |
| A bug or performance regression is not yet understood | `diagnosing-bugs` first; move to `tdd` or `implement` only after the failure mechanism is supported by evidence. |
| An issue or external contribution needs classification | `triage`, using the configured tracker, request-surface flag, and canonical label mapping. |
| Terminology, invariants, or domain decisions are changing | `domain-modeling`; use `grill-with-docs` when the plan or design needs an interview that records glossary and ADR decisions as they crystallise. |
| A module interface or architectural seam needs improvement | `codebase-design` for the shared deep-module vocabulary; use `improve-codebase-architecture` for a broader opportunity scan informed by existing context docs and ADRs. |
| A focused technical question needs primary-source evidence | `research`; store findings using the repository's existing documentation convention. |
| A design question is cheaper to answer experimentally | `prototype`; treat the result as throwaway evidence rather than production code. |

## Configuration dependencies

- `to-spec`, `to-tickets`, `triage`, `wayfinder`, and `code-review` read the configured issue-tracker conventions when their workflow touches tickets or reviews.
- `triage` and ticket-producing workflows use the configured canonical label vocabulary.
- `domain-modeling`, `grill-with-docs`, `codebase-design`, `improve-codebase-architecture`, `diagnosing-bugs`, and `tdd` consume relevant context documents and ADRs when they exist.
- Missing context documents are not a setup failure. Create or update them lazily only when domain language or decisions are actually being resolved.
