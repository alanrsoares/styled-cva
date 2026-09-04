---
"@styled-cva/biome-plugin": minor
---

Autofix coverage for every rule, plus `cva()` class strings and aliased imports.

- `multiline-long-tw` now registers a **safe fix** that wraps a long class list across lines, packed greedily to 74 characters. It was diagnostic-only before.
- New rule **`normalize-cva-classes`** normalizes `base`, every `variants.*.*` option and `compoundVariants[].class` / `[].className` in a `tw.tag.cva({ … })` config. Object keys and `defaultVariants` values are left alone.
- `prefer-size-class` now also collapses `w-`/`h-` pairs inside multi-line templates, which the previous single-line-anchored implementation skipped. Its 16 enumerated position arms collapse to 2 with no behaviour change.
- `normalize-tw-classes` replaces a nine-stage hand-unrolled split/join with three arms plus recursion.
- All rules now **resolve the local styled-cva binding** instead of hard-coding `tw`: an aliased default import from any `@styled-cva/*` adapter is followed, a bare `tw` is still assumed when there is no such import, and a `tw` imported from another library is no longer flagged.

Rules are written as one small rewrite plus recursion, relying on Biome re-applying safe plugin fixes until no rule rewrites — a single `biome check --write` reaches the fixpoint.
