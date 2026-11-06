---
"@styled-cva/eslint-plugin": patch
---

`prefer-styled-cva` autofix now declares the extracted component at module scope. Before, an element in a local render helper got its `tw` declaration inside the enclosing component, so each render made a new component type and remounted the element, which lost its input value and focus.
