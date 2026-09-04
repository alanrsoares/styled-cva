# @styled-cva/core

## 0.7.0

### Minor Changes

- 871a5c8: Replace `clsx` and `tailwind-merge` with `cn` to target Tailwind CSS v4 class merging and conflict resolution with argument-identity caching.

## 0.6.1

### Patch Changes

- Publish under **The Unlicense**. Deprecate intrinsic `tw.*.cva(...)` in favor of `tw.*(...)` on React, Solid, and Vue. Narrow Vue `ElementKey` / intrinsic typing; refresh docs and examples.

## 0.6.0

### Minor Changes

- 9f94b3c: Add `isTaggedTemplateArg` in core. Intrinsic elements accept `tw.*(base, cvaConfig)` as shorthand for `tw.*.cva(...)`. Re-export `isTaggedTemplateArg` from framework package entries.
