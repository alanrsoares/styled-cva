---
"@styled-cva/rescript": patch
"@styled-cva/prettier-plugin": patch
---

Replace `workspace:*` internal dependency specifiers with concrete semver ranges to avoid unresolved workspace references on npm publish, fix double-caret typos in peerDependencies, and widen `@rescript/react` peer dependency to include `^0.14.0`.
