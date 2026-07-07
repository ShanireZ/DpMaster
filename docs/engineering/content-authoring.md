---
type: Engineering Contract
title: Content Authoring Contract
description: How to maintain DpMaster type pages, examples, formulas, code, and registration.
tags: [content, authoring, lessons]
timestamp: 2026-07-07T00:00:00+08:00
source_paths:
  - site/src/content/a/Knapsack01.tsx
  - site/src/content/a/KnapsackComplete.tsx
  - site/src/components/ui/ProblemBits.tsx
  - site/src/components/ui/CodeBlock.tsx
---

# Golden Flow

Each DP type page should follow this teaching sequence:

1. Scenario introduction with a concrete small input and a figure.
2. State definition and transition derivation.
3. Hand calculation using the same small input.
4. Editable visualization.
5. Deeper contrast, optimization, or common trap.
6. 2-3 examples.
7. 3 exercises where the native problem pool supports it.
8. Previous/next navigation.

The A/01 背包 and A/完全背包 pages are the strongest current templates.

# Minimum Page Shape

A mature type page should usually have:

* 6-8 `section.lesson` blocks.
* At least 3 on-brand figures when the topic allows it.
* At least 1 editable demo.
* At least 1 "本质" info box and a "常见陷阱" box where applicable.
* 2-3 example cards and practice entries.
* Cross-links to nearby families/types when a concept is reused.

# Components

Use existing UI components and classes:

* `section.lesson` and `h2.section-title`.
* `.prose` for readable lesson text.
* `figure.figure` with SVG illustrations.
* `.steps` and `.step` for hand calculation.
* `<InfoBox kind="key|warn">`.
* `<ExampleCard>`, `<Field>`, and `<Exercise>`.
* `<CodeBlock code={...} luogu="Pxxxx" />`.
* `<M>` and `<MB>` for formulas.

# C++ Style

Example code must follow ShanireZ OJ style:

* Allman braces.
* 4-space indentation.
* 1-based indexing where natural for OI-style problems.
* Explicit `long long` when values can exceed `int`.
* `endl` in examples where it matches the established style.
* Short Chinese comments on genuinely important lines.

# Registration Checklist

When adding or changing a type:

1. Place the content component under `site/src/content/<part>/`.
2. Register it in `site/src/content/registry.tsx`.
3. Keep `site/src/data/parts.ts` in sync.
4. Update `site/src/data/problems.ts` for example/exercise changes.
5. Add or update any demo solvers under `site/src/components/demos/<topic>/`.
6. Run `npm run build` from `site/`.

