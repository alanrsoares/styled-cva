# @styled-cva/solid

## 0.6.0

### Minor Changes

- 9f94b3c: Add `isTaggedTemplateArg` in core. Intrinsic elements accept `tw.*(base, cvaConfig)` as shorthand for `tw.*.cva(...)`. Re-export `isTaggedTemplateArg` from framework package entries.

### Patch Changes

- Updated dependencies [9f94b3c]
  - @styled-cva/core@0.6.0

## 0.5.3

### Patch Changes

- Fix `$variant` literal union widening to `string` when hovering JSX attributes. The `O` generic on `TailwindComponent` in `CVAWithPropsReturn` was producing an index signature that collapsed `Pick<…, keyof …>` inside `TailwindPropHelper`. Switched to a non-indexed empty-object type so variant unions survive through the JSX call-site overload.
- Cache `MergeProps<O, P>` and add `in out` variance markers on `TailwindComponentBase`, `WithStyle`, and `TemplateFunction` to skip TS's unreliable variance probe. No public API change. Vue typecheck: ~297k → ~154k instantiations (−48%).
