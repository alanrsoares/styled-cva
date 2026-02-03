import { solidPlugin } from "esbuild-plugin-solid";
import { defineConfig } from "tsup";

import { baseTsupOptions } from "../../tsup.base";

export default defineConfig((options) => ({
  ...baseTsupOptions,
  format: ["cjs", "esm"],
  splitting: false,
  treeshake: true,
  minify: !options.watch,
  external: ["solid-js", "solid-js/web"],
  esbuildPlugins: [solidPlugin()],
}));
