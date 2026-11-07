# @styled-cva/eslint-plugin

## 0.6.1

### Patch Changes

- d2d11ca: Widen the peer dependency ranges to `eslint` `^9 || ^10` and `typescript` `^5 || ^6`.

## 0.6.0

### Minor Changes

- 6ca7bb2: Add the `importSource` option to `prefer-styled-cva`. It sets the module of the `tw` import that the autofix adds, for example `@styled-cva/solid` or a local re-export. An existing default import from that module is reused. The default stays `@styled-cva/react`.

### Patch Changes

- 5a31d14: `prefer-styled-cva` autofix now declares the extracted component at module scope. Before, an element in a local render helper got its `tw` declaration inside the enclosing component, so each render made a new component type and remounted the element, which lost its input value and focus.

  The autofix also no longer produces broken or wrong code in these cases: a new name that clashes with an import, a declaration or a shadowing local; a file that imports `tw` from `@styled-cva/solid` or `@styled-cva/vue`, or under another name; and a file that starts with a directive such as `"use client"`.

## 0.5.2

### Patch Changes

- Publish under **The Unlicense**. Deprecate intrinsic `tw.*.cva(...)` in favor of `tw.*(...)` on React, Solid, and Vue. Narrow Vue `ElementKey` / intrinsic typing; refresh docs and examples.
