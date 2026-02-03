<p align="center">
  <img src="https://raw.githubusercontent.com/alanrsoares/styled-cva/refs/heads/main/assets/styled-cva.svg" alt="styled-cva logo" width="128" height="128" />
</p>

<h1 align="center">styled-cva</h1>

<p align="center">
  <strong>A typesafe, <a href="https://github.com/joe-bell/cva">class-variance-authority-based</a>, styled-components-like library for authoring SolidJS components with Tailwind CSS.</strong>
</p>

<p align="center">
  <a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" /></a>
  <a href="https://github.com/alanrsoares/styled-cva"><img alt="License" src="https://img.shields.io/github/license/alanrsoares/styled-cva" /></a>
  <a href="https://www.npmjs.com/package/@styled-cva/solid"><img alt="Types" src="https://img.shields.io/npm/types/@styled-cva/solid" /></a>
  <a href="https://www.npmjs.com/package/@styled-cva/solid" rel="nofollow"><img src="https://img.shields.io/npm/v/@styled-cva/solid.svg?sanitize=true"></a>
</p>

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
- ✅ `cva` and `withProps` for powerful component customization.
- ✅ Polymorphic `$as` prop to change the rendered element.
- ✅ Smart prop filtering to avoid extraneous props on the DOM.
- ✅ Works with custom Solid components.
- ✅ Extend CVA components with `tw(Button)\`extra-classes\`` — variant props (`$variant`, `$size`) are preserved.

## Installation

npm

```bash
npm i --save @styled-cva/solid
```

pnpm

```bash
pnpm add @styled-cva/solid
```

bun

```bash
bun add @styled-cva/solid
```

## Usage

### Basic Example

Create a simple, styled button.

```tsx
import tw from "@styled-cva/solid";

const Button = tw.button`
  bg-blue-500 text-white font-bold py-2 px-4 rounded
`;

// ...
<Button>Click Me</Button>;
```

### Variants with `cva`

Create a button with different variants.

```tsx
import tw from "@styled-cva/solid";

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

### Polymorphic `$as` Prop

Render a different element or component.

```tsx
import tw from "@styled-cva/solid";

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
</Button>;
```

### Styling Custom Components

Create a styled component from a custom component that accepts a `class` prop.

```tsx
import tw from "@styled-cva/solid";

const MyButton = (props: { class?: string }) => {
  return <button class={props.class}>Hello</button>;
};

const StyledButton = tw(MyButton)`text-red-500`;

// ...

<StyledButton />;
```

### Extending CVA Components

Add extra classes to a CVA component; variant props stay typed and available.

```tsx
const Button = tw.button.cva("font-bold py-2 px-4 rounded", {
  variants: {
    $variant: { primary: "bg-blue-500", secondary: "bg-gray-500" },
    $size: { small: "text-sm", large: "text-lg" },
  },
});

const StyledButton = tw(Button)`text-red-500`;

// $size and $variant are still available
<StyledButton $size="large" $variant="primary">
  foo
</StyledButton>;
```

## VSCode intellisense

For tailwindcss extension support, add this to your vscode [settings.json](/.vscode/settings.json)

```json
  // tailwindcss intelisense settings
  "tailwindCSS.emmetCompletions": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  },
   "tailwindCSS.experimental.classRegex": [
    "tw`([^`]*)",
    "tw\\.[^`]+`([^`]*)`",
    "tw\\(.*?\\).*?`([^`]*)",
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "editor.quickSuggestions": {
    "strings": true
  },
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the Apache-2.0 License.

### Acknowledgements

- [Tailwind-Styled-Components](https://github.com/MathiasGilson/Tailwind-Styled-Component)

- [CVA](https://github.com/joe-bell/cva)

- [CLSX](https://github.com/lukeed/clsx)

- [tailwind-merge](https://github.com/dcastil/tailwind-merge)

####

License - [Apache-2.0](/LICENSE)
