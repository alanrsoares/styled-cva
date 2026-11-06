import { resolve } from "node:path";

const repoRoot = resolve(process.cwd(), "..");

export const processHoverDocs = (docs: string): string =>
  docs
    .replace(
      /[ \t]*\n*[ \t]*\{@link\s+([^}]*?)\s*\}[ \t]*\n*[ \t]*/g,
      (_match, name: string) => ` \`${name.trim()}\` `,
    )
    .replace(/[ \t]+([,.;:)])/g, "$1")
    .replace(/(\()[ \t]+/g, "$1")
    .trim();

const fromRoot = (path: string) => resolve(repoRoot, path);

// fumadocs-twoslash 4 runs on the TypeScript 7 API: options are in
// tsconfig.json form, and `baseUrl` is gone, so `paths` are absolute.
export const twoslashCompilerOptions = {
  moduleResolution: "bundler",
  module: "esnext",
  target: "es2022",
  jsx: "react-jsx",
  strict: true,
  paths: {
    "@styled-cva/core": [fromRoot("packages/core/src/index.ts")],
    "@styled-cva/core/*": [fromRoot("packages/core/src/*")],
    "@styled-cva/react": [fromRoot("packages/react/src/index.ts")],
    "@styled-cva/solid": [fromRoot("packages/solid/src/index.ts")],
    "@styled-cva/vue": [fromRoot("packages/vue/src/index.ts")],
    // Bun links @types/react into docs/node_modules, not the repo root.
    react: [fromRoot("docs/node_modules/@types/react")],
    "react/jsx-runtime": [
      fromRoot("docs/node_modules/@types/react/jsx-runtime"),
    ],
  },
};
