# @styled-cva/biome-plugin

Biome GritQL plugin for [@styled-cva/react](https://www.npmjs.com/package/@styled-cva/react) (and the solid / vue / svelte adapters). Provides **safe auto-fixes** and **lint diagnostics** for the class strings in styled-cva tagged templates and `cva()` configs.

Part of the [styled-cva](https://github.com/alanrsoares/styled-cva) monorepo.

## Rules

| Rule                    | What it does                                                                                     | Fix  |
| ----------------------- | ------------------------------------------------------------------------------------------------ | ---- |
| `normalize-tw-classes`  | Collapses whitespace runs and trims a single-line `tw` template's class string                   | safe |
| `normalize-cva-classes` | Same normalization for `base`, `variants.*.*` and `compoundVariants[].class` in a `cva()` config | safe |
| `multiline-long-tw`     | Wraps a class string with a line over 80 characters across lines                                 | safe |
| `prefer-size-class`     | Rewrites identical width/height (`w-4 h-4`, `md:w-8 md:h-8`) to `size-n`                         | safe |

All four register a **safe** fix, so `biome check --write` / `biome lint --write` applies them.

### Fixes converge, they do not just fire once

Every rule is written as **one small rewrite plus recursion**: `normalize-tw-classes` collapses one whitespace run, `prefer-size-class` collapses one `w-`/`h-` pair, `multiline-long-tw` splits one line. Biome re-applies safe plugin fixes until no rule rewrites, so a single `--write` reaches the fixpoint:

```ts
// before
const A = tw.div`w-4 h-4 gap-2 w-8 h-8`;
// after one `biome lint --write` — both pairs, not just the first
const A = tw.div`size-4 gap-2 size-8`;
```

### `multiline-long-tw`

```ts
// before
const Header = tw.div`-mx-4 flex flex-col gap-4 border-b border-border/90 px-4 pt-3 pb-7 sm:-mx-6 sm:flex-row sm:items-end sm:justify-between sm:px-6`;

// after
const Header = tw.div`
  -mx-4 flex flex-col gap-4 border-b border-border/90 px-4 pt-3 pb-7
  sm:-mx-6 sm:flex-row sm:items-end sm:justify-between sm:px-6
`;
```

Lines are packed greedily to 74 characters, which leaves the 2-space indent inside an 80-column budget. GritQL has no arithmetic, but a greedy bounded repetition followed by a required space makes the same decision a width-aware wrapper does.

**The budget and the indent are fixed.** GritQL cannot read plugin options, and the matched node carries no column information, so a deeply nested declaration is wrapped to the same 2-space indent as a top-level one. Reach for [`@styled-cva/prettier-plugin`](../prettier-plugin) when the indent has to follow the source column — it calls the real width-aware formatter in [`@styled-cva/core/formatting`](../core).

### Binding resolution

The rules resolve the local styled-cva binding rather than hard-coding `tw`:

- an aliased default import from any `@styled-cva/*` adapter is followed — `import sc from "@styled-cva/solid"` makes `sc.div\`…\`` match;
- otherwise a bare `tw` is assumed, so files that re-export `tw` from a local module still lint;
- unless the file imports `tw` from somewhere else, in which case that library's `tw\`…\`` templates are left alone.

## Installation

```bash
bun add -D @styled-cva/biome-plugin @biomejs/biome
```

**Peer dependency:** `@biomejs/biome` `>= 2.0`.

## Configuration

In `biome.json` reference the `.grit` files directly by path:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "plugins": [
    "./node_modules/@styled-cva/biome-plugin/rules/normalize-tw-classes.grit",
    "./node_modules/@styled-cva/biome-plugin/rules/normalize-cva-classes.grit",
    "./node_modules/@styled-cva/biome-plugin/rules/multiline-long-tw.grit",
    "./node_modules/@styled-cva/biome-plugin/rules/prefer-size-class.grit"
  ]
}
```

Biome plugins are referenced by relative path; there is no package-name shorthand in Biome 2.x.

Note that `plugins` inside an `overrides` entry is **additive** — an override's plugins run in addition to the ones declared at the top level and by earlier overrides, so these can be scoped to the app that uses styled-cva without losing the rest.

## Relationship to the Prettier plugin

`@styled-cva/prettier-plugin` runs the real formatter from `@styled-cva/core/formatting`: it knows the print width, the tab width and the source column, and it reflows on save. This plugin re-derives a narrower version of the same behavior in GritQL because Biome plugins cannot call JavaScript.

Use both if you format with Prettier and lint with Biome. If Biome is your only tool, this plugin covers normalization, wrapping and `size-n` on its own.

## Caveats

- **80/74 is not configurable.** GritQL has no plugin options; fork the `.grit` file to change the budget.
- **Only static, single-chunk templates are visited.** A template with an interpolation (`tw.div\`flex ${x}\``) is skipped — its chunks are not the whole class list, so normalizing them in isolation is not sound.
- **`compoundVariants` matching is by property name** (`class` / `className`), not by position in the array.
- **Escapes are not decoded.** A literal `\t` in source is two characters to the regex, not a tab; only real horizontal whitespace is normalized.

## Tests

Fixtures live under `fixtures/{valid,invalid}/`; the package's own `biome.json` enables all four rules and scopes linting to that directory. `src/rules.spec.ts` shells out to `biome lint --reporter=json` for diagnostics and to `biome lint --write` on throwaway fixtures for fixpoint output.

```bash
bun test
```
