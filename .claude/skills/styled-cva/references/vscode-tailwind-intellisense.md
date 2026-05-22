# VSCode Tailwind CSS IntelliSense

Use the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension with `experimental.classRegex` so autocomplete, hovers, and lint run inside styled-cva and CVA class strings — not only `className`.

## Settings

Add to the workspace `.vscode/settings.json` (or user settings):

```json
{
  "tailwindCSS.emmetCompletions": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
  "tailwindCSS.experimental.classRegex": [
    "tw`([^`]*)",
    "tw\\.\\w+`([^`]*)`",
    "tw\\([^)]*\\)`([^`]*)`",
    ["tw\\.\\w+\\s*\\(([^;]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"],
    ["tw\\.\\w+\\.cva\\s*\\(([^;]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"],
    ["tw\\([^)]+\\)\\s*\\(([^;]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"],
    ["cva\\(([^;]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"],
    ["cn\\(([^;]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"]
  ],
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

For Vue SFCs, add `"vue": "html"` under `tailwindCSS.includeLanguages`.

Reload the editor window after changing these settings.

## What each pattern matches

| Pattern | Syntax | Example |
|--------|--------|---------|
| `tw\`…\`` | Rare bare tagged call | — |
| `tw.tag\`…\`` | Tagged template | `tw.div\`flex gap-2\`` |
| `tw(Comp)\`…\`` | Polymorphic template | `tw(Link)\`text-primary\`` |
| `tw.tag(…)` tuple | **0.7 CVA shorthand** | `tw.span("base", { variants })` |
| `tw.tag.cva(…)` tuple | Deprecated alias | `tw.button.cva("base", { variants })` |
| `tw(Comp)(…)` tuple | Custom component + CVA | `tw(Link)("base", { variants })` |
| `cva(…)` tuple | Standalone `class-variance-authority` | `cva("base", { variants })` |
| `cn(…)` tuple | `cn()` merges (e.g. shadcn ui) | `cn(variants({ size }), className)` |

## Tuple rules (important)

Patterns like `["tw\\.\\w+\\s*\\(([^;]*)\\)", "[\"'`]([^\"'`]*)[\"'`]"]` use two steps:

1. **Container** — must include a **capturing group** around the full argument list (`([^;]*)`), not just the opening `tw.span(`. IntelliSense applies the second regex only inside that capture.
2. **Class list** — `["'\`]([^"'\`]*)["'\`]` finds each quoted string in that block (base, variant values, array entries).

Use `([^;]*)` instead of `([^)]*)` so arbitrary properties with parentheses still work, e.g. `[&_svg:not([class*='size-'])]:size-4`.

Do **not** use a pattern like `tw\\.\\w+\\([^;]*\\)\`([^`]*)\`` — there is no `tw.tag(args)\`…\`` API in styled-cva 0.7.

## Example

```tsx
const StatusBadge = tw.span(
  "inline-flex h-5 rounded-sm",
  {
    variants: {
      $status: {
        online: "bg-status-healthy/15 text-status-healthy",
        offline: "bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { $status: "online" },
  },
);
```

IntelliSense should work inside the base string and each variant string when the cursor is in those quotes.

## Related tooling

- `@styled-cva/prettier-plugin` — auto-fixes `tw\`…\`` whitespace and line length (pair with IntelliSense).
- `@styled-cva/biome-plugin` — flags the same issues in `biome check` (diagnostics only). See [tooling.md](./tooling.md).
