# @styled-cva/rescript

## 0.8.4

### Patch Changes

- 13bc0ae: Replace `workspace:*` internal dependency specifiers with concrete semver ranges to avoid unresolved workspace references on npm publish, fix double-caret typos in peerDependencies, and widen `@rescript/react` peer dependency to include `^0.14.0`.
- Updated dependencies [1e6e76d]
- Updated dependencies [985707b]
- Updated dependencies [17229b5]
  - @styled-cva/react@0.7.4

## 0.8.3

### Patch Changes

- @styled-cva/react@0.7.3

## 0.8.2

### Patch Changes

- Updated dependencies [a2537a1]
  - @styled-cva/react@0.7.2

## 0.8.1

### Patch Changes

- improve component authoring in res

## 0.8.0

### Minor Changes

- 8110e2e: Add `@styled-cva/rescript` package providing zero-cost ReScript v12 bindings for `@styled-cva/react` with build-time codegen for 72+ HTML element factories (`Tw.div`, `Tw.button`, etc.), `cva()`, and `cn()`.
