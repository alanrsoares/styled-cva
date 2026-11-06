import { fixupConfigRules } from "@eslint/compat";
import eslint from "@eslint/js";
import react from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  // eslint-plugin-react 7.x still calls context APIs that ESLint 10 removed.
  fixupConfigRules(react.configs.flat.recommended),
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
    },
    settings: { react: { version: "detect" } },
    rules: {
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Type tests declare fixtures that appear only in `typeof`, which
    // typescript-eslint v8 reports as unused.
    files: ["src/**/*.spec.{ts,tsx}"],
    rules: { "@typescript-eslint/no-unused-vars": "off" },
  },
);
