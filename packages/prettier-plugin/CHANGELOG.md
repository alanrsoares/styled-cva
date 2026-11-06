# @styled-cva/prettier-plugin

## 0.2.0

### Minor Changes

- 5037825: Normalize class strings in every `cva(base, config)` call shape — `tw.tag(base, config)`, `tw(Component, base, config)`, `tw.tag.cva(…)` and `tw(Component).cva(…)` — and in `compoundVariants` entries. The positional `base` is now visited; the plugin used to look for a `base` key that the config does not have.

### Patch Changes

- 13bc0ae: Replace `workspace:*` internal dependency specifiers with concrete semver ranges to avoid unresolved workspace references on npm publish, fix double-caret typos in peerDependencies, and widen `@rescript/react` peer dependency to include `^0.14.0`.
- Updated dependencies [985707b]
  - @styled-cva/core@0.7.1

## 0.1.1

### Patch Changes

- Updated dependencies [871a5c8]
  - @styled-cva/core@0.7.0
