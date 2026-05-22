---
name: styled-cva
description: Type-safe styled components with CVA variants for React, Solid, and Vue. Use when authoring components with Tailwind CSS, implementing variant-based styling, using `tw` template literals or the intrinsic CVA shorthand (`tw.tag(base, config)`), refactoring `className`/`cn()` logic into named components, or configuring the companion lint/format tooling. Triggers on `@styled-cva/react`, `@styled-cva/solid`, `@styled-cva/vue`, `@styled-cva/eslint-plugin`, `@styled-cva/prettier-plugin`, `@styled-cva/biome-plugin`, `tw.div`, `tw.button`, `tw(Component)`, `.cva(`, `.withProps(`, `$variant`, `$size`, `$as` props, `PolymorphicComponentProps`, and `VariantProps`. Also applies under Preact via the `preact/compat` alias.
---

# styled-cva

A TypeScript-first library combining class-variance-authority (CVA) with a styled-components-like API. Same surface across React, Solid, and Vue.

Adapters and current major:
- **React** — `@styled-cva/react` (React 19+; for React 18 use 0.3.x)
- **Solid** — `@styled-cva/solid`
- **Vue** — `@styled-cva/vue`
- **Preact** — use `@styled-cva/react` with the `preact/compat` bundler alias. See [references/preact.md](references/preact.md).

Everything below uses the React import path; the API and triggers are identical across all adapters unless called out.

## Two ways to declare variants

**Preferred — intrinsic shorthand:** `tw.tag(baseClasses, config)`. The factory is called directly. This is the canonical form going forward.

**Deprecated — `.cva()` form:** `tw.tag.cva(baseClasses, config)` — still works, behaves identically, kept for backwards compatibility. Migrate to the shorthand for new code.

```tsx
import tw from "@styled-cva/react";

// PREFERRED
const Button = tw.button("px-4 py-2 rounded", {
  variants: {
    $variant: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-200 text-gray-900",
    },
    $size: { sm: "text-sm h-8", md: "text-base h-10", lg: "text-lg h-12" },
  },
  defaultVariants: { $variant: "primary", $size: "md" },
});

<Button $variant="primary" $size="lg">Click me</Button>

// DEPRECATED (equivalent)
const Old = tw.button.cva("px-4 py-2 rounded", { variants: { … } });
```

Custom components (anything that accepts `className`) still use the tagged-template form: `` tw(Component)`…` `` and `tw(Component)(base, config)`.

### Transient props rule

**Variant prop names start with `$`** (e.g. `$variant`, `$size`, `$tone`). The `$` prefix marks them as transient: they drive variant resolution but are stripped before the underlying DOM element receives props, preventing the "unknown prop" warning. This is a hard convention — variants without `$` will leak to the DOM.

## Core API

### Basic styled components

```tsx
const Card = tw.div`p-4 rounded-lg shadow-md`;
const Input = tw.input`border px-3 py-2 rounded`;

// Custom component (must accept className)
const StyledLink = tw(NextLink)`text-blue-500 hover:underline`;

// Extending another styled component
const BaseButton = tw.button`px-4 py-2`;
const PrimaryButton = tw(BaseButton)`bg-blue-500 text-white`;
```

### `.withProps()` — default props

Sets defaults that the consumer can override. Chains after the variant factory.

```tsx
const SubmitButton = tw
  .button("px-4 py-2 rounded", {
    variants: {
      $variant: {
        primary: "bg-blue-500 text-white",
        secondary: "bg-gray-200 text-gray-900",
      },
    },
  })
  .withProps({
    type: "submit",
    "data-testid": "submit-button",
    $variant: "primary",
  });
```

### `$as` — polymorphic rendering

Render as a different element or component:

```tsx
const Button = tw.button("btn", { variants: { $variant: { primary: "btn-primary" } } });

<Button $as="a" href="/link">Link Button</Button>
<Button $as={Link} href="/page">Nav Link</Button>
```

For typed wrappers around router `Link` components (TanStack / Next / Remix), use `PolymorphicComponentProps<Component, $As>`:

```tsx
import type { PolymorphicComponentProps } from "@styled-cva/react";
import { Link } from "@tanstack/react-router";

const StyledLink = tw(Link)("text-blue-500 hover:underline", {
  variants: {
    $tone: {
      brand: "text-brand-600",
      muted: "text-muted",
    },
  },
});

type StyledLinkProps = PolymorphicComponentProps<typeof StyledLink, typeof Link>;
// Picks up router Link props AND every $-prefixed variant.
```

### Variant patterns

```tsx
// Boolean variants — use "true" / "false" string keys
const Wrapper = tw.div("border rounded", {
  variants: {
    $active: { true: "border-blue-500 bg-blue-50", false: "border-gray-200" },
  },
  defaultVariants: { $active: false },
});
<Wrapper $active={isActive}>…</Wrapper>

// Compound variants — apply when multiple variants match
const Btn = tw.button("px-4 py-2", {
  variants: {
    $variant: { primary: "bg-blue-500", outline: "border border-blue-500" },
    $size: { sm: "text-sm", lg: "text-lg" },
  },
  compoundVariants: [
    { $variant: "outline", $size: "lg", class: "border-2" },
  ],
});
```

## Utilities

```tsx
import { cn, cva, type VariantProps } from "@styled-cva/react";

// cn — clsx + tailwind-merge
cn("text-red-500", condition && "bg-blue-500", "text-blue-500"); // last text-* wins

// cva — raw class-variance-authority, no $ prefix needed
const buttonVariants = cva("btn-base", {
  variants: { variant: { primary: "btn-primary" } },
});
<button className={buttonVariants({ variant: "primary" })}>Click</button>

// VariantProps — extract the variant slice of a styled component's props
const Button = tw.button("…", {
  variants: { $variant: { primary: "…" }, $size: { sm: "…", lg: "…" } },
});
type ButtonProps = VariantProps<typeof Button>;
// { $variant?: "primary"; $size?: "sm" | "lg" }
```

## When to reach for styled-cva

Good candidates:
- JSX cluttered with long inline Tailwind class strings
- `cn()` chains that branch on multiple props
- Buttons / badges / inputs / cards with size / tone / state variants
- Polymorphic wrappers (router `Link`, primitives with `$as`)

```tsx
// Before — branching cn at the call site
<button
  className={cn(
    "flex items-center gap-2 rounded-full border px-3 py-2",
    !isConnected && "opacity-50 cursor-not-allowed",
    canInteract && "cursor-pointer hover:border-white/30",
  )}
>

// After — variant on a named component
const PillButton = tw.button("flex items-center gap-2 rounded-full border px-3 py-2", {
  variants: {
    $state: {
      disconnected: "opacity-50 cursor-not-allowed",
      interactive: "cursor-pointer hover:border-white/30",
    },
  },
});
<PillButton $state={isConnected ? "interactive" : "disconnected"} />
```

## Companion lint and format tooling

Three first-party plugins ship in the same monorepo. They are independent — install only what your toolchain uses. Full configuration recipes in [references/tooling.md](references/tooling.md).

- **`@styled-cva/eslint-plugin`** — rule `prefer-styled-cva` (fixable) flags JSX elements whose `className` has more than `threshold` classes and offers to extract them into a styled component.
- **`@styled-cva/prettier-plugin`** — Prettier preprocess that normalizes whitespace inside `tw.tag\`…\``, `tw(Component)\`…\``, and `tw.tag.cva({ base, variants })` constructs, and rewrites overflowing inline templates into multi-line form. Load **before** `prettier-plugin-tailwindcss` if both are present.
- **`@styled-cva/biome-plugin`** — Biome 2.x GritQL rules (`normalize-tw-classes`, `multiline-long-tw`) that *flag* the same issues. Biome GritQL is diagnostics-only — pair with the Prettier plugin or the editor for fixes.

## VSCode Tailwind IntelliSense

Add to `.vscode/settings.json` for autocomplete inside tagged templates, `tw.tag(base, { variants })`, standalone `cva()`, and `cn()`. Full patterns and caveats: [references/vscode-tailwind-intellisense.md](references/vscode-tailwind-intellisense.md).

```json
{
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
  "editor.quickSuggestions": { "strings": true }
}
```

## Testing

```tsx
import { render, screen } from "@testing-library/react";

const Button = tw.button("btn", { variants: { $variant: { primary: "btn-primary" } } });

test("applies variant classes", () => {
  render(<Button $variant="primary">Click</Button>);
  expect(screen.getByRole("button")).toHaveClass("btn", "btn-primary");
});

test("polymorphic rendering", () => {
  render(<Button $as="a" href="/test">Link</Button>);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/test");
});
```

Solid uses `@solidjs/testing-library`; Vue uses `@vue/test-utils`. Variant assertions are identical.

## Cross-framework gotchas

- **Solid / Vue** — same `tw` API surface; the `$as` prop and `.withProps()` chaining behave identically. Vue templates use `:class` rather than `className` inside SFCs, but inside `<script setup>` you still write `tw.div(…)` calls the same way.
- **Don't replace `{}` with `Record<string, …>` in this codebase's types** — it widens variant unions to `string`. If you contribute to the styled-cva monorepo, read `AGENTS.md` first.

## Resources

- Docs: <https://styled-cva.vercel.app>
- MCP docs server: <https://styled-cva.vercel.app/api/mcp>
- GitHub: <https://github.com/alanrsoares/styled-cva>
