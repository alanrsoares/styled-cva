---
"@styled-cva/react": minor
"@styled-cva/solid": minor
"@styled-cva/vue": minor
---

Add the `VariantsOf<typeof C>` and `VariantOf<typeof C, "$key">` type helpers. They read the variant types from a styled component, so you do not need a separate `cva` only for the types. `VariantOf` removes `null` and `undefined`, and a boolean variant gives `boolean`.
