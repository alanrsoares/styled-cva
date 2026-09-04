# @styled-cva/biome-plugin

## 0.3.0

### Minor Changes

- 24fd27d: Autofix coverage for every rule, plus `cva()` class strings and aliased imports.

  - `multiline-long-tw` now registers a **safe fix** that wraps a long class list across lines, packed greedily to 74 characters. It was diagnostic-only before.
  - New rule **`normalize-cva-classes`** normalizes `base`, every `variants.*.*` option and `compoundVariants[].class` / `[].className` in a `tw.tag.cva({ … })` config. Object keys and `defaultVariants` values are left alone.
  - `prefer-size-class` now also collapses `w-`/`h-` pairs inside multi-line templates, which the previous single-line-anchored implementation skipped. Its 16 enumerated position arms collapse to 2 with no behaviour change.
  - `normalize-tw-classes` replaces a nine-stage hand-unrolled split/join with three arms plus recursion.
  - All rules now **resolve the local styled-cva binding** instead of hard-coding `tw`: an aliased default import from any `@styled-cva/*` adapter is followed, a bare `tw` is still assumed when there is no such import, and a `tw` imported from another library is no longer flagged.

  Rules are written as one small rewrite plus recursion, relying on Biome re-applying safe plugin fixes until no rule rewrites — a single `biome check --write` reaches the fixpoint.

## 0.2.0

### Minor Changes

- 3883a69: Add safe auto-fix rewrites for `@styled-cva/biome-plugin` via Biome GritQL (`biome lint --write` / `biome check --write`):
  - `normalize-tw-classes`: collapses runs of spaces/tabs and trims irregular whitespace
  - `prefer-size-class`: converts identical width and height classes (e.g. `w-4 h-4`, `md:w-8 md:h-8`) into shorthand `size-n` (`size-4`, `md:size-8`)
