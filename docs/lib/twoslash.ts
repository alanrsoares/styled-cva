import { resolve } from "node:path";
import ts from "typescript";

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

export const twoslashCompilerOptions = {
  baseUrl: repoRoot,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  module: ts.ModuleKind.ESNext,
  target: ts.ScriptTarget.ES2022,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true,
  paths: {
    "@styled-cva/core": ["packages/core/src/index.ts"],
    "@styled-cva/core/*": ["packages/core/src/*"],
    "@styled-cva/react": ["packages/react/src/index.ts"],
    "@styled-cva/solid": ["packages/solid/src/index.ts"],
    "@styled-cva/vue": ["packages/vue/src/index.ts"],
    "react": ["node_modules/@types/react"],
    "react/jsx-runtime": ["node_modules/@types/react/jsx-runtime"],
  },
};
