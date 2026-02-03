/// <reference types="vitest" />

import { resolve } from "path";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: resolve(__dirname, "vitest.setup.ts"),
  },
  resolve: {
    conditions: ["development", "browser"],
  },
});
