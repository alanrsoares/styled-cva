# @styled-cva/core

## 0.8.0

### Minor Changes

- 02453bb: Accept a string as a boolean variant: `$active: "ring-2"` is the same as `{ true: "ring-2", false: "" }`. The prop type is `boolean`, and `VariantOf` gives `boolean`.

## 0.7.1

### Patch Changes

- 985707b: Clean the class string of a template with no interpolations once, not on each render. Add `createTemplateClassResolver` to `@styled-cva/core`.

## 0.7.0

### Minor Changes

- 871a5c8: Replace `clsx` and `tailwind-merge` with `cn` to target Tailwind CSS v4 class merging and conflict resolution with argument-identity caching.

## 0.6.1

### Patch Changes

- Publish under **The Unlicense**. Deprecate intrinsic `tw.*.cva(...)` in favor of `tw.*(...)` on React, Solid, and Vue. Narrow Vue `ElementKey` / intrinsic typing; refresh docs and examples.

## 0.6.0

### Minor Changes

- 9f94b3c: Add `isTaggedTemplateArg` in core. Intrinsic elements accept `tw.*(base, cvaConfig)` as shorthand for `tw.*.cva(...)`. Re-export `isTaggedTemplateArg` from framework package entries.
