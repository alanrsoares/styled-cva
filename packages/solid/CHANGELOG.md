# @styled-cva/solid

## 0.5.3

### Patch Changes

- Fix `$variant` literal union widening to `string` when hovering JSX attributes. The `O` generic on `TailwindComponent` in `CVAWithPropsReturn` was producing an index signature that collapsed `Pick<…, keyof …>` inside `TailwindPropHelper`. Switched to a non-indexed empty-object type so variant unions survive through the JSX call-site overload.
- Cache `MergeProps<O, P>` and add `in out` variance markers on `TailwindComponentBase`, `WithStyle`, and `TemplateFunction` to skip TS's unreliable variance probe. No public API change. Vue typecheck: ~297k → ~154k instantiations (−48%).
