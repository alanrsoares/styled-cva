---
"@styled-cva/react": patch
"@styled-cva/solid": patch
"@styled-cva/vue": patch
---

Add `.withProps()` to template-literal components (`tw.tag\`…\``and`tw(Component)\`…\``). Before, a call gave a type error and a runtime `TypeError: withProps is not a function`. Call-site props override the defaults, and the result keeps `.withStyle()`and`.withProps()` for chaining.
