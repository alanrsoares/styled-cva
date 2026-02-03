import type { ESLint } from "eslint";

import packageJson from "../package.json" with { type: "json" };
import preferStyledCva from "./rules/prefer-styled-cva.js";

const plugin: ESLint.Plugin = {
  meta: {
    name: "@styled-cva/eslint-plugin",
    version: packageJson.version,
  },
  rules: {
    "prefer-styled-cva": preferStyledCva,
  },
};

export default plugin;
