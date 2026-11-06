import { describe, expect, it } from "bun:test";
import { Linter } from "eslint";

import rule from "./prefer-styled-cva";

const CLASSES = "a1 a2 a3 a4 a5 a6";

const fix = (code: string): string => {
  const linter = new Linter({ configType: "flat" });
  return linter.verifyAndFix(
    code,
    {
      files: ["**/*.jsx"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parserOptions: { ecmaFeatures: { jsx: true } },
      },
      plugins: { "styled-cva": { rules: { "prefer-styled-cva": rule } } },
      rules: { "styled-cva/prefer-styled-cva": "warn" },
    },
    "file.jsx",
  ).output;
};

/** True when the `tw` declaration starts a line, so it is not in a function body. */
const declaredAtTopLevel = (output: string, name: string) =>
  new RegExp(`^const ${name} = tw\\.`, "m").test(output);

describe("prefer-styled-cva autofix", () => {
  it.each([
    [
      "a function declaration",
      `import React from "react";
function Form() {
  return <input className="${CLASSES}" />;
}`,
    ],
    [
      "an exported arrow component",
      `import React from "react";
export const Form = () => <input className="${CLASSES}" />;`,
    ],
    [
      "a local render helper in a function declaration",
      `import React from "react";
function Form() {
  const renderInput = () => <input className="${CLASSES}" />;
  return <form>{renderInput()}</form>;
}`,
    ],
    [
      "a nested function declaration helper",
      `import React from "react";
export default function Form() {
  function renderInput() {
    return <input className="${CLASSES}" />;
  }
  return <form>{renderInput()}</form>;
}`,
    ],
    [
      "a map callback in an arrow component",
      `import React from "react";
const List = ({ items }) => (
  <ul>{items.map((i) => <li key={i} className="${CLASSES}">{i}</li>)}</ul>
);`,
    ],
  ])("declares the styled component at module scope for %s", (_, code) => {
    const output = fix(code);
    const name = output.match(/const (\w+) = tw\./)?.[1];
    expect(name).toBeDefined();
    // column 0 means the declaration is not inside a function body
    expect(declaredAtTopLevel(output, name!)).toBe(true);
    // it must come before the component that uses it
    expect(output.indexOf(`const ${name} = tw.`)).toBeLessThan(
      output.indexOf(`<${name}`),
    );
  });
});
