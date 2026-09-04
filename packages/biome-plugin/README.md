# @styled-cva/biome-plugin

Biome GritQL plugin for [@styled-cva/react](https://www.npmjs.com/package/@styled-cva/react). Provides **lint diagnostics** for `tw.tag\`…\``/`tw(Component)\`…\`` tagged templates that have abnormal whitespace or are too long on a single line.

Part of the [styled-cva](https://github.com/alanrsoares/styled-cva) monorepo.

## Safe auto-fix for whitespace normalization

Biome 2.x supports GritQL rewrites with safe fixes. `@styled-cva/biome-plugin` provides:

- **`normalize-tw-classes`**: registers a **safe auto-fix** (`fix_kind = "safe"`). Running `biome lint --write` (or `biome check --write`) automatically normalizes irregular horizontal whitespace inside single-line `tw` templates.
- **`multiline-long-tw`**: provides **diagnostics only**. Multi-line template formatting (indentation, line wrapping) is handled by [`@styled-cva/prettier-plugin`](../prettier-plugin).

The two plugins complement each other:

- `@styled-cva/biome-plugin` — flags issues and auto-fixes whitespace in `biome check --write` / `biome lint --write`
- `@styled-cva/prettier-plugin` — formats and wraps long templates across multiple lines on save

## Rules

### `normalize-tw-classes`

Flags inline `tw.tag\`…\``/`tw(Component)\`…\`` tagged templates whose class string contains:

- a run of 2+ horizontal whitespace characters
- leading horizontal whitespace
- trailing horizontal whitespace

**Auto-fix:** Rewrites the template chunk to collapse multiple spaces/tabs to a single space and trim leading/trailing whitespace (`biome lint --write`).

Multi-line templates (whose chunk contains a `\n`) are **exempt** so that prettier-formatted multi-line `tw.div\`\n flex\n\`` does not trigger the rule.

### `multiline-long-tw`

Flags inline `tw.tag\`…\``/`tw(Component)\`…\``tagged templates whose quasi text exceeds 80 characters on a single line. Multi-line templates are exempt. Break long templates into multiple lines manually or via`@styled-cva/prettier-plugin`.

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
    "./node_modules/@styled-cva/biome-plugin/rules/multiline-long-tw.grit"
  ]
}
```

Biome plugins are referenced by relative path; there is no package-name shorthand in Biome 2.x.

## Caveats

- **Auto-fix is supported for `normalize-tw-classes` only.** `multiline-long-tw` remains diagnostic-only; use `@styled-cva/prettier-plugin` for multi-line wrapping and indenting.
- **`tw` import name is hard-coded.** The rules only recognize the `tw` identifier; renamed imports (`import sc as tw from …`) are not supported.
- **`.cva({ base, variants })` strings are not analyzed.** Object-literal traversal with conditional regex predicates is not expressible in the current Biome GritQL dialect. Use `@styled-cva/prettier-plugin` to normalize those.
- **80-char threshold is fixed.** GritQL has no numeric comparison or plugin options; the rule uses `r".{81,}"`. To raise/lower the threshold today, fork the `.grit` file.
- **Regex matches the quasi chunk text.** Edge cases (e.g. classes that contain escaped backticks) are not exercised in tests.
