# @styled-cva/biome-plugin

Biome GritQL plugin for [@styled-cva/react](https://www.npmjs.com/package/@styled-cva/react). Provides **lint diagnostics** for `tw.tag\`…\`` / `tw(Component)\`…\`` tagged templates that have abnormal whitespace or are too long on a single line.

Part of the [styled-cva](https://github.com/alanrsoares/styled-cva) monorepo.

## Diagnostics, not auto-fix

As of Biome 2.x, GritQL plugins can **only register diagnostics** — they cannot rewrite code. To auto-fix the issues this plugin reports, run [`@styled-cva/prettier-plugin`](../prettier-plugin) on the same files. The two plugins are designed to complement each other:

- `@styled-cva/biome-plugin` — flags issues in `biome check` / `biome lint`
- `@styled-cva/prettier-plugin` — rewrites the offending templates on save

A migration to a code-modifying Biome plugin will become possible once Biome's JS plugin API ships.

## Rules

### `normalize-tw-classes`

Flags inline `tw.tag\`…\`` / `tw(Component)\`…\`` tagged templates whose class string contains:

- a run of 2+ horizontal whitespace characters
- leading horizontal whitespace
- trailing horizontal whitespace

Multi-line templates (whose chunk contains a `\n`) are **exempt** so that prettier-formatted multi-line `tw.div\`\n  flex\n\`` does not trigger the rule.

### `multiline-long-tw`

Flags inline `tw.tag\`…\`` / `tw(Component)\`…\`` tagged templates whose quasi text exceeds 80 characters on a single line. Multi-line templates are exempt.

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

- **Diagnostics only.** No auto-fix. Pair with `@styled-cva/prettier-plugin` for rewrites.
- **`tw` import name is hard-coded.** The rules only recognize the `tw` identifier; renamed imports (`import sc as tw from …`) are not supported.
- **`.cva({ base, variants })` strings are not analyzed.** Object-literal traversal with conditional regex predicates is not expressible in the current Biome GritQL dialect. Use `@styled-cva/prettier-plugin` to normalize those.
- **80-char threshold is fixed.** GritQL has no numeric comparison or plugin options; the rule uses `r".{81,}"`. To raise/lower the threshold today, fork the `.grit` file.
- **Regex matches the quasi chunk text.** Edge cases (e.g. classes that contain escaped backticks) are not exercised in tests.
