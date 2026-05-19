# @styled-cva/prettier-plugin

Prettier plugin for [@styled-cva/react](https://www.npmjs.com/package/@styled-cva/react). Normalizes class-string whitespace inside `tw.tag`…``, `tw(Component)`…``, and `tw.tag.cva({ base, variants })` constructs, and rewrites long inline `tw` tagged templates into multi-line form when they exceed `printWidth`.

Part of the [styled-cva](https://github.com/alanrsoares/styled-cva) monorepo.

## What it does

1. **Normalizes whitespace.** Collapses runs of whitespace inside recognized class strings to a single space.
2. **Rewrites long inline tagged templates to multi-line.** When `tw.tag\`…\`` (or `tw(Component)\`…\``) would overflow `printWidth`, the plugin wraps the class list across multiple indented lines.

For Tailwind-aware class ordering, pair this plugin with [`prettier-plugin-tailwindcss`](https://github.com/tailwindlabs/prettier-plugin-tailwindcss). Load it **after** this plugin in your Prettier config.

### Targets

- `` tw.div`…` `` / `` tw.button`…` `` — any `tw.<tag>` tagged template
- `` tw(Component)`…` `` — `tw(Foo)` wrapper tagged template
- `tw.div.cva({ base: "…", variants: { … } })` — `base` string + each variant option string

`className="…"` attributes are intentionally **not** handled — that is `prettier-plugin-tailwindcss`'s job.

### Example

**Before:**

```ts
const Button = tw.button`  rounded   bg-blue-500   px-4 py-2 font-bold text-white   hover:bg-blue-600  `;

const Card = tw.div.cva({
  base: "  rounded-lg   bg-white   shadow ",
  variants: {
    $tone: {
      info: "  bg-blue-50   text-blue-900 ",
      danger: "bg-red-50  text-red-900",
    },
  },
});
```

**After (`printWidth: 80`):**

```ts
const Button = tw.button`rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600`;

const Card = tw.div.cva({
  base: "rounded-lg bg-white shadow",
  variants: {
    $tone: {
      info: "bg-blue-50 text-blue-900",
      danger: "bg-red-50 text-red-900",
    },
  },
});
```

**Multi-line rewrite (when single-line exceeds `printWidth`):**

```ts
const HeroCard = tw.div`
  flex items-center justify-between gap-4 rounded-xl
  border border-slate-200 bg-white p-6 shadow-md
  hover:border-slate-300 hover:shadow-lg
`;
```

Inner lines are indented by `tabWidth` (or one tab when `useTabs` is true) relative to the column where the tag starts; the closing backtick aligns back to that column.

## Installation

```bash
bun add -D @styled-cva/prettier-plugin
```

**Peer dependencies:** `prettier` (^3). Optional companion: `prettier-plugin-tailwindcss`.

## Configuration

In `.prettierrc` / `prettier.config.js`:

```json
{
  "plugins": [
    "@styled-cva/prettier-plugin",
    "prettier-plugin-tailwindcss"
  ]
}
```

Order matters: load `@styled-cva/prettier-plugin` **before** `prettier-plugin-tailwindcss` so class sorting runs on the normalized, multi-lined output.

This plugin reuses the standard Prettier options (`printWidth`, `tabWidth`, `useTabs`). It introduces no new options.

## Caveats

- **Static templates only.** Tagged templates that contain `${…}` interpolations are skipped.
- **Single-line strings stay strings.** `cva({ base: "…" })` string literals are only whitespace-normalized — they are not converted to multi-line template literals automatically.
- **Recognition is conservative.** A `tw` identifier must be the root of the tag or `.cva()` member chain. Renamed or aliased `tw` imports are not detected.
