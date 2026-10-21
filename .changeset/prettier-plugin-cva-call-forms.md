---
"@styled-cva/prettier-plugin": minor
---

Normalize class strings in every `cva(base, config)` call shape — `tw.tag(base, config)`, `tw(Component, base, config)`, `tw.tag.cva(…)` and `tw(Component).cva(…)` — and in `compoundVariants` entries. The positional `base` is now visited; the plugin used to look for a `base` key that the config does not have.
