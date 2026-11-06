---
"@styled-cva/eslint-plugin": patch
---

`prefer-styled-cva` autofix now declares the extracted component at module scope. Before, an element in a local render helper got its `tw` declaration inside the enclosing component, so each render made a new component type and remounted the element, which lost its input value and focus.

The autofix also no longer produces broken or wrong code in these cases: a new name that clashes with an import, a declaration or a shadowing local; a file that imports `tw` from `@styled-cva/solid` or `@styled-cva/vue`, or under another name; and a file that starts with a directive such as `"use client"`.
