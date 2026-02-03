import { defineConfig } from "tsup";

import { baseTsupOptions } from "../../tsup.base";

export default defineConfig((options) => ({
  ...baseTsupOptions,
  format: ["cjs", "esm"],
  splitting: false,
  treeshake: true,
  minify: !options.watch,
  external: ["vue"],
}));
