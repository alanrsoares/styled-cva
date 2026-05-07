# @styled-cva/react

## 0.7.0

### Minor Changes

- 9f94b3c: Add `isTaggedTemplateArg` in core. Intrinsic elements accept `tw.*(base, cvaConfig)` as shorthand for `tw.*.cva(...)`. Re-export `isTaggedTemplateArg` from framework package entries.

### Patch Changes

- Updated dependencies [9f94b3c]
  - @styled-cva/core@0.6.0

## 0.6.0

### Minor Changes

- Add `PolymorphicComponentProps<Component, $As>` utility type for rendering CVA components as custom React components (TanStack Router `Link`, Next.js `Link`, etc.) while preserving every `$`-prefixed variant prop (`$variant`, `$size`, `$tone`, …) from the source component.

  Internals: dedupe the forward-ref shape behind a shared `CVAComponent<K, T>` alias and split `tsconfig.build.json` so `bun run compile` skips spec files (~95% faster typecheck on that script).

### Patch Changes

- Cache `MergeProps<O, P>` and add `in out` variance markers on `TailwindComponentBase`, `WithStyle`, and `TemplateFunction` to skip TS's unreliable variance probe. No public API change. Vue typecheck: ~297k → ~154k instantiations (−48%).
