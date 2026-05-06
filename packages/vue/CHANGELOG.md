# @styled-cva/vue

## 0.5.3

### Patch Changes

- Cache `MergeProps<O, P>` and add `in out` variance markers on `TailwindComponentBase`, `WithStyle`, and `TemplateFunction` to skip TS's unreliable variance probe. No public API change. Vue typecheck: ~297k → ~154k instantiations (−48%).
