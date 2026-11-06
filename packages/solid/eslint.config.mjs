import eslint from "@eslint/js";
import solid from "eslint-plugin-solid";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  solid.configs["flat/typescript"],
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
    },
  },
  {
    // Type tests declare fixtures that appear only in `typeof`, which
    // typescript-eslint v8 reports as unused.
    files: ["src/**/*.spec.{ts,tsx}"],
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
);
