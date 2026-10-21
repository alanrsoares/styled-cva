---
"@styled-cva/biome-plugin": minor
---

`normalize-cva-classes` now matches every `cva(base, config)` call shape — `tw.tag(base, config)`, `tw(Component, base, config)`, `tw.tag.cva(…)` and `tw(Component).cva(…)` — and normalizes the positional `base`. It used to look for a `base` key that the config does not have. New rule `multiline-long-variant` wraps a long `base` or `variants.*.*` class string into an array, one chunk per line.
