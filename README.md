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

```tsx
import tw from "styled-cva";

const Button = tw.button.cva("btn-base-class", {
  variants: {
    // variant keys start with $ will not be sent to the DOM,
    // this avoids extraneous props warning
    $variant: {
      primary: "btn-primary-class",
      secondary: "btn-secondary-class",
    },
  },
});

const myButton = <Button $variant="primary">Click Me</Button>;
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
