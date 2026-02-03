<p align="center">
  <img src="docs/public/styled-cva.svg" alt="styled-cva logo" width="128" height="128" />
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

> ⚠️ styled-cva 0.5.x only supports React ≥19.x. If you're on React 18, use the latest 0.3.x ⚠️

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

### Quick example

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
bun install
bun run build
bun run test
bun run lint
bun run dev
```

## Scripts

| Script                          | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| `bun run build`                 | Build all packages (core, react, solid, vue, eslint-plugin) and docs |
| `bun run dev`                   | Start docs site (Next.js)                                            |
| `bun run test`                  | Run tests in packages that have a test script                        |
| `bun run lint`                  | Lint packages                                                        |
| `bun run format`                | Format with Prettier                                                 |
| `bun run clean`                 | Remove build output for all packages                                 |
| `bun run bump:patch`            | Bump patch version(s) for package(s) (supports glob filter)          |
| `bun run changeset`             | Add a changeset (describe a release)                                 |
| `bun run version`               | Bump versions and update CHANGELOGs from changesets                  |
| `bun run release`               | Build and publish all versioned packages                             |
| `bun run release:react`         | Build and publish @styled-cva/react                                  |
| `bun run release:solid`         | Build and publish @styled-cva/solid                                  |
| `bun run release:vue`           | Build and publish @styled-cva/vue                                    |
| `bun run release:eslint-plugin` | Build and publish @styled-cva/eslint-plugin                          |

Versioning uses [Changesets](https://github.com/changesets/changesets). See [RELEASING.md](RELEASING.md) for the full workflow.

## License

Apache-2.0. See [packages/react/LICENSE](packages/react/LICENSE).
