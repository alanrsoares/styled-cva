<p align="center">
  <img src="https://raw.githubusercontent.com/alanrsoares/styled-cva/refs/heads/main/assets/styled-cva.svg" alt="styled-cva logo" width="128" height="128" />
</p>

<h1 align="center">styled-cva</h1>

<p align="center">
  <strong>A typesafe, <a href="https://github.com/joe-bell/cva">class-variance-authority-based</a>, styled-components-like library for authoring React components with Tailwind CSS.</strong>
</p>

<p align="center">
  <a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" /></a>
  <a href="https://github.com/alanrsoares/styled-cva"><img alt="License" src="https://img.shields.io/github/license/alanrsoares/styled-cva" /></a>
  <a href="https://www.npmjs.com/package/@styled-cva/react"><img alt="Types" src="https://img.shields.io/npm/types/@styled-cva/react" /></a>
  <a href="https://www.npmjs.com/package/@styled-cva/react" rel="nofollow"><img src="https://img.shields.io/npm/v/@styled-cva/react.svg?sanitize=true"></a>
</p>

> ⚠️ starting from 0.4.x, styled-cva only supports React >=19.x. If you're on React 18, use the latest 0.3.x ⚠️

## Why styled-cva?

`styled-cva` offers the best of both worlds: the expressiveness of `styled-components` and the power of `class-variance-authority`, all while being fully typesafe and optimized for Tailwind CSS.

- **Familiar `styled-components` API:** If you love the `tw.button`...` syntax, you'll feel right at home.
- **Powered by CVA:** Easily create components with complex variants.
- **Fully Typesafe:** Enjoy autocompletion and type-checking for all your component's variants.
- **Seamless Tailwind CSS Integration:** `styled-cva` is designed to work perfectly with Tailwind CSS and the official Tailwind CSS VSCode extension.
- **Lightweight and Performant:** No unnecessary abstractions, just the essentials to build beautiful and consistent UIs.

## Features

- ✅ Supports all HTML elements.
- ✅ Full TypeScript support, including prop and variant inference.
- ✅ Re-exports `@styled-cva/core` utilities (`cn`, `cva`, `isTaggedTemplateArg`, …) from the package entry.
- ✅ `cva` and `withProps` for powerful component customization.
- ✅ Polymorphic `as` prop to change the rendered element.
- ✅ Smart prop filtering to avoid extraneous props on the DOM.
- ✅ Works with custom React components.

## Installation

npm

```bash
npm i --save @styled-cva/react
```

pnpm

```bash
pnpm add @styled-cva/react
```

bun

```bash
bun add @styled-cva/react
```

## Usage

### Basic Example

Create a simple, styled button.

```tsx
import tw from "@styled-cva/react";

const Button = tw.button`
  bg-blue-500 text-white font-bold py-2 px-4 rounded
`;

// ...
<Button>Click Me</Button>;
```

### Variants with `cva`

Create a button with different variants.

```tsx
import tw from "@styled-cva/react";

const Button = tw.button.cva(
  "font-bold py-2 px-4 rounded", // base class
  {
    variants: {
      // Use '$' to prevent the prop from being passed to the DOM
      $variant: {
        primary: "bg-blue-500 text-white",
        secondary: "bg-gray-500 text-white",
      },
      $size: {
        small: "text-sm",
        large: "text-lg",
      },
    },
    defaultVariants: {
      $variant: "primary",
    },
  },
);

// ...

<Button $variant="secondary" $size="large">
  Click Me
</Button>;
```

### `withProps` for Default Props

Apply default props to your component.

```tsx
const PrimaryButton = tw.button
  .cva("font-bold py-2 px-4 rounded", {
    variants: {
      $variant: {
        primary: "bg-blue-500 text-white",
        secondary: "bg-gray-500 text-white",
      },
    },
  })
  .withProps({
    "data-testid": "my-button",
    type: "button",
    $variant: "primary", // Default variant
  });

// ...

<PrimaryButton>Click Me</PrimaryButton>;
```

### Polymorphic `as` Prop

Render a different element or component.

```tsx
import Link from "next/link";
import tw from "@styled-cva/react";

const Button = tw.button.cva("font-bold py-2 px-4 rounded", {
  variants: {
    $variant: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-500 text-white",
    },
  },
});

// ...

// Renders as an anchor tag
<Button $as="a" href="/some/url" $variant="primary">
  I'm a link!
</Button>

// Renders as a Next.js Link component
<Button $as={Link} href="/some/url" $variant="secondary">
  I'm a Next.js Link!
</Button>
```

#### Type-safe wrapper with `PolymorphicComponentProps`

When `$as` is a custom React component (TanStack Router `Link`, Next.js `Link`, etc.) and you want a typed wrapper, compose the props with `PolymorphicComponentProps`. It automatically picks up every `$`-prefixed variant on the source component.

```tsx
import Link, { type LinkProps } from "next/link";
import tw, { type PolymorphicComponentProps } from "@styled-cva/react";

const Button = tw.button.cva("btn", {
  variants: {
    $variant: { primary: "btn-primary", secondary: "btn-secondary" },
  },
});

type ButtonLinkProps = PolymorphicComponentProps<typeof Button, typeof Link> &
  LinkProps;

export const ButtonLink = (props: ButtonLinkProps) => (
  <Button {...props} $as={Link} />
);

// <ButtonLink href="/about" $variant="primary">About</ButtonLink>
```

### Styling Custom Components

Create a styled component from a custom component that accepts a `className` prop.

```tsx
import tw from "@styled-cva/react";

const MyButton = ({ className }: { className: string }) => {
  return <button className={className}>Hello</button>;
};

const StyledButton = tw(MyButton)`text-red-500`;

// ...

<StyledButton />;
```

## VSCode IntelliSense

Install the [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss) extension and add to `.vscode/settings.json`:

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

Covers tagged templates (`tw.div\`…\``), **0.7 shorthand** `tw.span("base", { variants })`, deprecated `tw.span.cva(…)`, `tw(Component)(…)`, standalone `cva()`, and `cn()`. Tuple patterns must use a capturing group `([^;]*)` for the full argument list (not just `tw.span(`). Reload the editor after saving.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is dedicated to the public domain under [The Unlicense](https://unlicense.org/). See [`LICENSE`](LICENSE) in this package.

### Acknowledgements

- [Tailwind-Styled-Components](https://github.com/MathiasGilson/Tailwind-Styled-Component)

- [CVA](https://github.com/joe-bell/cva)

- [CLSX](https://github.com/lukeed/clsx)

- [tailwind-merge](https://github.com/dcastil/tailwind-merge)
