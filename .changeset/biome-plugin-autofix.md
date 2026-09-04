---
"@styled-cva/biome-plugin": minor
---

Add safe auto-fix rewrites for `@styled-cva/biome-plugin` via Biome GritQL (`biome lint --write` / `biome check --write`):
- `normalize-tw-classes`: collapses runs of spaces/tabs and trims irregular whitespace
- `prefer-size-class`: converts identical width and height classes (e.g. `w-4 h-4`, `md:w-8 md:h-8`) into shorthand `size-n` (`size-4`, `md:size-8`)
