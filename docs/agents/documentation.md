---
type: convention
title: Documentation system
description: Defines the OKF v0.2 contract for maintaining this target's durable documentation.
tags: [documentation, okf, knowledge-bundle]
status: stable
sources:
  - id: okf-v02
    resource: https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md
    title: Open Knowledge Format v0.2 specification
---

# Documentation System

## Authority and scope

Maintain durable project knowledge as an Open Knowledge Format (OKF) v0.2 bundle: UTF-8 Markdown concept documents with YAML frontmatter, organized in a directory hierarchy.[^okf-v02]

An OKF bundle is a navigation and consumption layer. It does not replace this target's existing source of truth, such as `PLAN.md`, architecture documents, schemas, source code, command help, or project-specific decision logs. When they conflict, repair the bundle to match the applicable authority.

Operational artifacts that are not durable knowledge may remain outside the bundle when the project already has a more appropriate home for them.

## Concept documents

Every concept document must:

- start with YAML frontmatter delimited by `---`;
- include a descriptive `type`;
- use a standard Markdown body;
- prefer structural headings, lists, tables, and fenced examples where they improve retrieval.

Use `title`, a one-sentence `description`, and `tags` when useful for navigation and search.

Record provenance with `sources` when a concept derives factual claims from internal or external materials. Use stable source IDs when body footnotes attribute individual claims. Record `generated`, `verified`, `status`, and `stale_after` when producer identity, review state, lifecycle, or freshness materially affects trust.

Do not invent provenance, verification, freshness, or authority metadata. Absence is more honest than a fabricated signal.

## Structure and navigation

- `index.md` and `log.md` are reserved filenames and are not ordinary concept documents.
- Use `index.md` for progressive disclosure. List immediate children with links and short descriptions; do not duplicate the linked documents.
- Index files have no frontmatter, except that the root index of a complete bundle may declare `okf_version: "0.2"`.
- Use `log.md` only when a durable chronological update log is useful. Date headings use ISO 8601 `YYYY-MM-DD`.
- Prefer bundle-relative Markdown links beginning with `/` when the project already treats `docs/` as the bundle root. Relative links are also valid.
- Consumers must tolerate missing optional documents and broken links, but maintainers should still repair links they touch.

## Maintenance workflow

When creating or materially changing documentation:

1. Read the target's authoritative project documents and relevant existing concepts.
2. Decide whether the material is durable knowledge, a decision, an operational runbook, temporary task state, or historical evidence; put it in the repository's established home.
3. Update the smallest set of concept documents that owns the facts. Avoid parallel sources of truth.
4. Update the nearest `index.md` when navigation changes, and `log.md` only when that bundle uses one.
5. Record real provenance, lifecycle, and freshness signals where they help consumers judge the content.
6. Verify frontmatter structure, links, source-of-truth alignment, and repository-specific documentation gates.

## Incremental migration

Do not mass-rewrite untouched documentation solely to change format.

OKF v0.2 consumers can read v0.1 bundles using documented fallbacks. When a v0.1 concept is materially updated, migrate the touched metadata where practical:

- replace legacy `timestamp` with `generated.at` and an honest actor;
- replace a body `# Citations` list with frontmatter `sources`, using source IDs and footnotes for claim-level attribution;
- preserve unknown extension fields unless the project has explicitly retired them.

Do not change a bundle-root `okf_version` declaration to `"0.2"` until the bundle has been audited for the version it claims.

[^okf-v02]: [Open Knowledge Format v0.2 specification](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
