import eslint from "@eslint/js";
import vue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  vue.configs["flat/recommended"],
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "vue/one-component-per-file": "off",
    },
  },
  {
    // Type tests declare fixtures that appear only in `typeof`, which
    // typescript-eslint v8 reports as unused.
    files: ["src/**/*.spec.{ts,tsx}", "src/**/*.consumer-types.ts"],
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
);
