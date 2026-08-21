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

## Superpowers

Superpowers is a process-skill suite. Its rules guide how work is approached; they do not override the user's request, the applicable `AGENTS.md`, repository safety rules, or the tools actually available in the current session.

- Start by checking whether a Superpowers skill applies. Invoke relevant or explicitly requested skills before exploratory or implementation actions.
- Use `brainstorming` before creative work or behavior changes. Classify the task, present a design scaled to the change, and obtain explicit approval before implementation.
- Use `systematic-debugging` for unexplained failures and performance regressions; establish evidence for the failure mechanism before changing production behavior.
- For approved architectural work, use `writing-plans` and then `executing-plans`. For bounded changes, proceed directly after the approved short design.
- Prefer `test-driven-development` for behavior changes and `verification-before-completion` before reporting success.
- Use `requesting-code-review` and `receiving-code-review` when the task calls for review; finish branches only when the user and repository policy authorize commits, pushes, or pull requests.
- Use `dispatching-parallel-agents`, `subagent-driven-development`, and `using-git-worktrees` only when the user or applicable project instructions authorize that workflow and the required tools are available. Project-specific prohibitions win.

## Modern Web Guidance

Modern Web Guidance is a mandatory research step for modern browser-facing implementation, not a general-purpose engineering skill.

- Use it at the start of every HTML, CSS, client-side JavaScript, frontend component, layout, motion, browser API, or web-performance task.
- Search first with an action-oriented query, then retrieve the relevant guide IDs. On Windows, use `npx.cmd`; read the installed skill for the current `--skill-version` value rather than copying a stale version from this file.
- If search results are vague or low-confidence, list the available guides before choosing one.
- Treat Baseline Widely Available features as safe by default. For newer features, follow the retrieved fallback guidance unless the project declares a stricter or more specific browser-support contract.
- Do not invoke it for backend routes, databases, CI/CD, Docker, Git, or ordinary local scripts.
- Adapt retrieved guidance to the repository's framework, accessibility rules, dependency policy, and browser-support contract. Project-specific constraints remain authoritative.
