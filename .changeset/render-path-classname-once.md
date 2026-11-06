---
"@styled-cva/react": patch
"@styled-cva/solid": patch
"@styled-cva/vue": patch
---

Pass `className` once in the React CVA path. Before, non-Tailwind classes from a wrapping CVA component were repeated in the output. Each adapter now builds the default `tw` once at import, not twice.
