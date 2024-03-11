![styled-cva banner](https://raw.githubusercontent.com/alanrsoares/styled-cva/main/assets/styled-cva.svg)

# styled-cva

[![npm version](https://badge.fury.io/js/styled-cva.svg)](https://badge.fury.io/js/styled-cva)

A typesafe, [class-variance-authority-based](https://github.com/joe-bell/cva), styled-components-like library for authoring React components

## Installation

npm

```bash
npm i --save styled-cva
```

pnpm

```bash
pnpm add styled-cva
```

bun

```bash
bun add styled-cva
```

## Usage

basic

```tsx
import tw from "styled-cva";

const StaticButton = tw.button`
  bg-primary rounded-xl cursor-pointer
`;

// ...
<StaticButton>Click Me</StaticButton>;
```

variants

```tsx
import tw from "styled-cva";

const VariantButton = tw.button.cva("btn-base-class", {
  variants: {
    // variant keys starting with $ will not be sent to the DOM,
    // this avoids extraneous props warning
    $variant: {
      primary: "btn-primary-class",
      secondary: "btn-secondary-class",
    },
  },
});

// ...

// $variant is infered to 'primary' | 'secondary'
<VariantButton $variant="primary">Click Me</VariantButton>;
```

proxy

```tsx
import Link from "next/link";

const Button = tw.button.cva("btn", {
  variants: {
    $variant: {
      primary: "btn-primary",
      secondary: "btn-secondary",
    },
  },
});

// ...

// works with known jsx elements

<Button $as="a" href="/some/url">
  I'm a link that looks like a button
</Button>;

// also with custom components

<Button $as={Link} href="/some/url">
  I'm a link that looks like a button
</Button>;
```

## VSCode intellisense

For tailwindcss extension support, add this to your vscode [settings.json](/.vscode/settings.json)

```json
  // tailwindcss intelisense settings
  "tailwindCSS.emmetCompletions": true,
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript", // if you are using typescript
    "typescriptreact": "javascript" // if you are using typescript with react
  },
  "tailwindCSS.experimental.classRegex": [
    "tw`([^`]*)", // tw`...`
    "tw\\.[^`]+`([^`]*)`", // tw.xxx<xxx>`...`
    "tw\\(.*?\\).*?`([^`]*)", // tw(Component)<xxx>`...`
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ],
  "editor.quickSuggestions": {
    "strings": true // forces VS Code to trigger completions when editing "string" content
  },
```

### Acknowledgements

- [Tailwind-Styled-Components](https://github.com/MathiasGilson/Tailwind-Styled-Component)

- [CVA](https://github.com/joe-bell/cva)

- [CLSX](https://github.com/lukeed/clsx)

- [tailwind-merge](https://github.com/dcastil/tailwind-merge)

####

License - [UNLICENSE](/LICENSE)
