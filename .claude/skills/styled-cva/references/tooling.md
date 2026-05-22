# Lint and format tooling

Three first-party plugins ship in the same monorepo. They are independent — install only what your toolchain uses.

| Package | Role | Fixable? |
|---|---|---|
| `@styled-cva/eslint-plugin` | Suggest extracting JSX with many classes into a styled component | Yes (ESLint auto-fix) |
| `@styled-cva/prettier-plugin` | Normalize whitespace + multiline long inline `tw\`…\`` and `cva()` strings | Yes (Prettier rewrite) |
| `@styled-cva/biome-plugin` | Flag the same issues during `biome lint` / `biome check` | **No** — Biome GritQL plugins are diagnostics-only in 2.x |

## `@styled-cva/eslint-plugin`

ESLint 9 flat config:

```js
// eslint.config.js
import styledCvaPlugin from "@styled-cva/eslint-plugin";

export default [
  {
    plugins: { "@styled-cva": styledCvaPlugin },
    rules: {
      "@styled-cva/prefer-styled-cva": ["warn", { threshold: 5 }],
    },
  },
];
```

The `prefer-styled-cva` rule reports lowercase JSX elements whose `className` has more than `threshold` classes. The auto-fix adds the `tw` import if missing, creates a named styled component above the call site, and replaces the element. Only native HTML elements are considered — custom components are ignored.

## `@styled-cva/prettier-plugin`

```bash
bun add -D @styled-cva/prettier-plugin
```

```json
// .prettierrc
{
  "plugins": [
    "@styled-cva/prettier-plugin",
    "prettier-plugin-tailwindcss"
  ]
}
```

**Order matters.** Load `@styled-cva/prettier-plugin` **before** `prettier-plugin-tailwindcss` so class sorting runs on the already-normalized output.

What it rewrites:
- `tw.tag\`…\`` and `tw(Component)\`…\`` tagged templates — whitespace normalized; multi-lined when the single-line form would overflow `printWidth`
- `tw.tag.cva({ base: "…", variants: { …: { …: "…" } } })` — `base` string and each variant option string whitespace-normalized (single-line strings stay strings)

Skipped:
- Templates containing `${…}` interpolations
- Renamed/aliased `tw` imports

## `@styled-cva/biome-plugin`

Requires `@biomejs/biome >= 2.0`.

```bash
bun add -D @styled-cva/biome-plugin @biomejs/biome
```

```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "plugins": [
    "./node_modules/@styled-cva/biome-plugin/rules/normalize-tw-classes.grit",
    "./node_modules/@styled-cva/biome-plugin/rules/multiline-long-tw.grit"
  ]
}
```

Biome plugins are referenced by relative path (no package-name shorthand in Biome 2.x).

Rules:
- `normalize-tw-classes` — warns on inline `tw\`…\`` with whitespace runs / leading / trailing whitespace
- `multiline-long-tw` — warns when inline `tw\`…\`` quasi exceeds 80 characters

Multi-line templates are exempt from both rules, so prettier-formatted multi-line output does not trip the lint.

## Recommended composition

If your project uses both Prettier and Biome:

- **Prettier** handles formatting (auto-fix on save)
- **Biome** handles linting (CI gate)
- `@styled-cva/prettier-plugin` rewrites, `@styled-cva/biome-plugin` flags any remaining drift

The pair gives you autofix in editors + a CI-safe gate that doesn't depend on a Prettier run having happened.

## VSCode Tailwind IntelliSense

See [vscode-tailwind-intellisense.md](./vscode-tailwind-intellisense.md) for the full `tailwindCSS.experimental.classRegex` block (tagged templates, `tw.tag(base, { variants })`, `cva()`, `cn()`). The container regex **must** use a capturing group such as `([^;]*)` around the full argument list — matching only `tw.span(` will not surface variant strings.
