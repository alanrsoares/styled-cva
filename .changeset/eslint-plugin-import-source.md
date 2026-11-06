---
"@styled-cva/eslint-plugin": minor
---

Add the `importSource` option to `prefer-styled-cva`. It sets the module of the `tw` import that the autofix adds, for example `@styled-cva/solid` or a local re-export. An existing default import from that module is reused. The default stays `@styled-cva/react`.
