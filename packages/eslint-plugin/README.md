# @styled-cva/eslint-plugin

ESLint plugin for [@styled-cva/react](https://www.npmjs.com/package/@styled-cva/react) (styled-cva). Suggests extracting JSX elements with many Tailwind classes into named styled components and can auto-fix.

Part of the [styled-cva](https://github.com/alanrsoares/styled-cva) monorepo. Published to npm as `@styled-cva/eslint-plugin`.

## Rule: `prefer-styled-cva`

Warns when a **native HTML element** (e.g. `button`, `div`) has a `className` with more than a set number of classes, and suggests extracting it to a styled component. Only elements with lowercase tags are considered (custom components are ignored).

- **Default threshold:** 5 classes (configurable)
- **Fixable:** yes — adds `import tw from "@styled-cva/react"` (or the `importSource` option) if missing, creates a styled component at module scope, and replaces the inline element with the new component. The new name does not clash with any name in the file.

### Example

**Before (reported when class count &gt; threshold):**

```tsx
<button className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600">
  Submit
</button>
```

**After (auto-fix):**

```tsx
import tw from "@styled-cva/react";

const StyledButton = tw.button`rounded bg-blue-500 px-4 py-2 text-white font-bold hover:bg-blue-600`;

// ...
<StyledButton>Submit</StyledButton>;
```

The plugin reuses an existing default import from `styled-cva`, `@styled-cva/react`, `@styled-cva/solid` or `@styled-cva/vue`, under its local name. A new import goes after imports and directives such as `"use client"`.

## Installation

From the monorepo root:

```bash
bun install
bun run --filter @styled-cva/eslint-plugin build
```

Or in another project, link the package (e.g. via `file:` or `link:` in `package.json` or `npm link`). Use the **built** package (`dist/`) so it is consumable in Node (CJS and ESM).

**Peer dependencies:** `eslint` (^9 || ^10), `typescript` (^5 || ^6).

## Configuration

**ESLint flat config** (e.g. `eslint.config.js`). Import the plugin and enable the rule:

```js
import styledCvaPlugin from "@styled-cva/eslint-plugin";

export default [
  {
    plugins: {
      "@styled-cva": styledCvaPlugin,
    },
    rules: {
      "@styled-cva/prefer-styled-cva": ["warn", { threshold: 5 }],
    },
  },
];
```

### Options

| Option         | Type   | Default               | Description                                                                                            |
| -------------- | ------ | --------------------- | ------------------------------------------------------------------------------------------------------ |
| `threshold`    | number | `5`                   | Min number of classes to trigger the rule.                                                             |
| `importSource` | string | `"@styled-cva/react"` | Module of the `tw` default import that the autofix adds. An existing default import from it is reused. |

Example: only suggest extraction when there are more than 8 classes:

```js
"@styled-cva/prefer-styled-cva": ["warn", { threshold: 8 }]
```

Example: in a flat config, use the Solid adapter for one part of a monorepo, or a local module that re-exports `tw`:

```js
{
  files: ["packages/solid-app/**/*.tsx"],
  rules: {
    "@styled-cva/prefer-styled-cva": ["warn", { importSource: "@styled-cva/solid" }],
  },
},
{
  files: ["apps/web/**/*.tsx"],
  rules: {
    "@styled-cva/prefer-styled-cva": ["warn", { importSource: "~/lib/tw" }],
  },
},
```

The rule checks only `className` attributes.
