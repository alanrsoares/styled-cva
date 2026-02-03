import { defineConfig } from "tsup";

import { baseTsupOptions } from "../../tsup.base";

export default defineConfig({
  ...baseTsupOptions,
  format: ["cjs", "esm"],
  outExtension({ format }) {
    return { js: format === "cjs" ? ".cjs" : ".mjs" };
  },
  external: ["eslint"],
});
