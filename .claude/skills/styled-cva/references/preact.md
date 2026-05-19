# Preact compatibility

`@styled-cva/react` runs on [Preact](https://preactjs.com/) via the standard `preact/compat` alias. The styled-cva runtime imports `forwardRef` and a stack of React types — `preact/compat` re-exports all of them, so no styled-cva code changes are required.

There is no dedicated `@styled-cva/preact` package; the alias is the supported path.

## Install

```bash
bun add preact @styled-cva/react
# or npm i preact @styled-cva/react
```

## Bundler alias

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
});
```

`@preact/preset-vite` wires the alias for you; the explicit `resolve.alias` block above is shown for projects that don't use the preset.

### Webpack 5

```js
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
};
```

### Next.js

```js
// next.config.js
module.exports = {
  webpack: (config) => {
    Object.assign(config.resolve.alias, {
      react: "preact/compat",
      "react-dom": "preact/compat",
      "react/jsx-runtime": "preact/jsx-runtime",
    });
    return config;
  },
};
```

## Usage is identical

```tsx
import tw from "@styled-cva/react";

const Button = tw.button("rounded bg-blue-500 px-4 py-2 text-white", {
  variants: {
    $variant: {
      primary: "bg-blue-500",
      ghost: "bg-transparent text-blue-500",
    },
  },
});

<Button $variant="primary">Click</Button>;
```

## Notes

- **`forwardRef` is "deprecated" in React 19** but still works; styled-cva uses it heavily. Preact has no equivalent deprecation, so no issue under the alias.
- **JSX namespace** must resolve to React types under the alias. `preact/compat` re-exports them, so polymorphic `$as` props and intrinsic element typings keep working.
- **Plugin tooling is unaffected.** `@styled-cva/eslint-plugin`, `@styled-cva/prettier-plugin`, and `@styled-cva/biome-plugin` key off the `tw` identifier in source code — they work the same under Preact.
