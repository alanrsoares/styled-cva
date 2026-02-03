<p align="center">
  <img src="../../assets/styled-cva.svg" alt="styled-cva logo" width="128" height="128" />
</p>

<h1 align="center">styled-cva</h1>

<p align="center">
  <strong>A typesafe, <a href="https://github.com/joe-bell/cva">class-variance-authority-based</a>, styled-components-like library for authoring Vue 3 components with Tailwind CSS.</strong>
</p>

<p align="center">
  <a href="https://github.com/prettier/prettier"><img alt="code style: prettier" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg" /></a>
  <a href="https://github.com/alanrsoares/styled-cva"><img alt="License" src="https://img.shields.io/github/license/alanrsoares/styled-cva" /></a>
  <a href="https://www.npmjs.com/package/@styled-cva/vue"><img alt="Types" src="https://img.shields.io/npm/types/@styled-cva/vue" /></a>
  <a href="https://www.npmjs.com/package/@styled-cva/vue" rel="nofollow"><img src="https://img.shields.io/npm/v/@styled-cva/vue.svg?sanitize=true"></a>
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
- ✅ Works with custom Vue components.
- ✅ Extend CVA components with `tw(Button)\`extra-classes\`` — variant props (`$variant`, `$size`) are preserved.

## Installation

npm

```bash
npm i --save @styled-cva/vue
```

pnpm

```bash
pnpm add @styled-cva/vue
```

bun

```bash
bun add @styled-cva/vue
```

## Usage

### Basic Example

Create a simple, styled button.

```vue
<script setup lang="ts">
import tw from "@styled-cva/vue";

const Button = tw.button`
  bg-blue-500 text-white font-bold py-2 px-4 rounded
`;
</script>

<template>
  <Button>Click Me</Button>
</template>
```

### Variants with `cva`

Create a button with different variants.

```vue
<script setup lang="ts">
import tw from "@styled-cva/vue";

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
</script>

<template>
  <Button :$variant="'secondary'" :$size="'large'"> Click Me </Button>
</template>
```

### `withProps` for Default Props

Apply default props to your component.

```vue
<script setup lang="ts">
import tw from "@styled-cva/vue";

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
</script>

<template>
  <PrimaryButton>Click Me</PrimaryButton>
</template>
```

### Polymorphic `$as` Prop

Render a different element or component.

```vue
<script setup lang="ts">
import tw from "@styled-cva/vue";

const Button = tw.button.cva("font-bold py-2 px-4 rounded", {
  variants: {
    $variant: {
      primary: "bg-blue-500 text-white",
      secondary: "bg-gray-500 text-white",
    },
  },
});
</script>

<template>
  <!-- Renders as an anchor tag -->
  <Button $as="a" href="/some/url" :$variant="'primary'"> I'm a link! </Button>
</template>
```

### Styling Custom Components

Create a styled component from a custom component that accepts a `class` prop.

```vue
<script setup lang="ts">
import tw from "@styled-cva/vue";

const MyButton = defineComponent({
  props: { class: { type: String, default: "" } },
  setup(props) {
    return () => h("button", { class: props.class }, "Hello");
  },
});

const StyledButton = tw(MyButton)`text-red-500`;
</script>

<template>
  <StyledButton />
</template>
```

### Extending CVA Components

Add extra classes to a CVA component; variant props stay typed and available.

```vue
<script setup lang="ts">
import tw from "@styled-cva/vue";

const Button = tw.button.cva("font-bold py-2 px-4 rounded", {
  variants: {
    $variant: { primary: "bg-blue-500", secondary: "bg-gray-500" },
    $size: { small: "text-sm", large: "text-lg" },
  },
});

const StyledButton = tw(Button)`text-red-500`;
</script>

<template>
  <!-- $size and $variant are still available -->
  <StyledButton :$size="'large'" :$variant="'primary'"> foo </StyledButton>
</template>
```

## VSCode intellisense

For tailwindcss extension support, add this to your vscode [settings.json](/.vscode/settings.json)

```json
  // tailwindcss intelisense settings
  "tailwindCSS.emmetCompletions": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "vue": "html"
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
