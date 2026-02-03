# styled-cva

A typesafe, [class-variance-authority](https://github.com/joe-bell/cva)-based, styled-components-like library for authoring React components with Tailwind CSS.

[![npm version](https://img.shields.io/npm/v/@styled-cva/react.svg)](https://www.npmjs.com/package/@styled-cva/react)
[![License](https://img.shields.io/github/license/alanrsoares/styled-cva)](https://github.com/alanrsoares/styled-cva)

## Install

```bash
npm install @styled-cva/react
# or
bun add @styled-cva/react
```

> React 19.x required. For React 18, use the latest 0.3.x.

## Quick example

```tsx
import tw from "@styled-cva/react";

const Button = tw.button`bg-blue-500 text-white font-bold py-2 px-4 rounded`;
<Button>Click me</Button>;
```

[Full documentation →](https://github.com/alanrsoares/styled-cva/tree/main/docs)

## Monorepo

| Package                                          | Description                                                                                     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| [packages/react](packages/react)                 | **@styled-cva/react** – core library (published)                                                |
| [packages/eslint-plugin](packages/eslint-plugin) | **@styled-cva/eslint-plugin** – ESLint rule to extract classes to styled components (published) |
| [docs](docs)                                     | **@styled-cva/docs** – Nextra documentation site (private)                                      |

## Development

**Requirements:** [Bun](https://bun.sh) (or Node ≥20), recommended via `packageManager` in root `package.json`.

```bash
# Install dependencies
bun install

# Build all packages and docs
bun run build

# Run tests
bun run test

# Lint
bun run lint

# Start docs dev server
bun run dev
```

## Scripts

| Script                          | Description                                   |
| ------------------------------- | --------------------------------------------- |
| `bun run build`                 | Build eslint-plugin, react, and docs          |
| `bun run dev`                   | Start docs site (Next.js)                     |
| `bun run test`                  | Run tests in packages that have a test script |
| `bun run lint`                  | Lint packages                                 |
| `bun run format`                | Format with Prettier                          |
| `bun run clean`                 | Remove build output (eslint-plugin, react)    |
| `bun run release:react`         | Build and publish @styled-cva/react           |
| `bun run release:eslint-plugin` | Build and publish @styled-cva/eslint-plugin   |

See [RELEASING.md](RELEASING.md) for versioning and publish steps.

## License

Apache-2.0. See [packages/react/LICENSE](packages/react/LICENSE).
