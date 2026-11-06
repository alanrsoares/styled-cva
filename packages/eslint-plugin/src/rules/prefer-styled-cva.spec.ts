import { describe, expect, it } from "bun:test";
import { Linter } from "eslint";

import rule from "./prefer-styled-cva";

const CLASSES = "a1 a2 a3 a4 a5 a6";

const languageOptions = {
  ecmaVersion: "latest",
  sourceType: "module",
  parserOptions: { ecmaFeatures: { jsx: true } },
} as const;

const fix = (code: string, options?: Record<string, unknown>): string =>
  new Linter({ configType: "flat" }).verifyAndFix(
    code,
    {
      files: ["**/*.jsx"],
      languageOptions,
      plugins: { "styled-cva": { rules: { "prefer-styled-cva": rule } } },
      rules: {
        "styled-cva/prefer-styled-cva": options ? ["warn", options] : "warn",
      },
    },
    "file.jsx",
  ).output;

/** Parse errors and redeclarations in `code`; empty when the output is valid. */
const problems = (code: string): string[] =>
  new Linter({ configType: "flat" })
    .verify(
      code,
      {
        files: ["**/*.jsx"],
        languageOptions,
        rules: { "no-redeclare": "error" },
      },
      "file.jsx",
    )
    .map((m) => m.message);

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

  describe("names", () => {
    it("does not reuse a name that a local binding shadows", () => {
      const output = fix(`import React from "react";
function A({ StyledDiv }) {
  return <section><StyledDiv /><div className="${CLASSES}" /></section>;
}`);
      expect(output).toContain("const StyledDiv1 = tw.div");
      expect(output).toContain("<StyledDiv /><StyledDiv1");
    });

    it.each([
      ["an import", `import { StyledDiv } from "./x";`],
      ["a function declaration", "function StyledDiv() { return null; }"],
      ["a class declaration", "class StyledDiv {}"],
    ])("does not redeclare a name taken by %s", (_, taken) => {
      const output = fix(`import React from "react";
${taken}
export function A() { return <div className="${CLASSES}" />; }`);
      expect(output).toContain("const StyledDiv1 = tw.div");
      expect(problems(output)).toEqual([]);
    });
  });

  describe("tw import", () => {
    it.each(["@styled-cva/solid", "@styled-cva/vue", "@styled-cva/react"])(
      "reuses an existing default import from %s",
      (pkg) => {
        const output = fix(`import tw from "${pkg}";
export function A() { return <div className="${CLASSES}" />; }`);
        expect(output.match(/^import /gm)).toHaveLength(1);
        expect(output).toContain("const StyledDiv = tw.div");
        expect(problems(output)).toEqual([]);
      },
    );

    it("uses the local name of an aliased default import", () => {
      const output = fix(`import styled from "@styled-cva/react";
export function A() { return <div className="${CLASSES}" />; }`);
      expect(output.match(/^import /gm)).toHaveLength(1);
      expect(output).toContain("const StyledDiv = styled.div");
    });

    it("picks a free name when module scope already has `tw`", () => {
      const output = fix(`import React from "react";
const tw = 1;
export function A() { return <div className="${CLASSES}" />; }`);
      expect(problems(output)).toEqual([]);
      expect(output).toMatch(/^import (\w+) from "@styled-cva\/react";$/m);
    });

    it.each([
      ["no imports", ""],
      ["imports", `import React from "react";\n`],
    ])("keeps a leading directive first in a file with %s", (_, imports) => {
      const output = fix(`"use client";
${imports}export function A() { return <div className="${CLASSES}" />; }`);
      expect(output.startsWith(`"use client";`)).toBe(true);
      expect(problems(output)).toEqual([]);
    });
  });

  describe("importSource option", () => {
    const component = `export function A() { return <div className="${CLASSES}" />; }`;

    it("defaults new imports to @styled-cva/react", () => {
      expect(fix(component)).toContain(`import tw from "@styled-cva/react";`);
    });

    it.each(["@styled-cva/solid", "~/lib/tw"])(
      "uses %s for a new import",
      (importSource) => {
        const output = fix(component, { importSource });
        expect(output).toContain(`import tw from "${importSource}";`);
        expect(output).not.toContain("@styled-cva/react");
      },
    );

    it("reuses an existing default import from a custom importSource", () => {
      const output = fix(
        `import styled from "~/lib/tw";
${component}`,
        {
          importSource: "~/lib/tw",
        },
      );
      expect(output.match(/^import /gm)).toHaveLength(1);
      expect(output).toContain("const StyledDiv = styled.div");
    });

    it("keeps the threshold option working with importSource", () => {
      const output = fix(component, {
        importSource: "@styled-cva/vue",
        threshold: 10,
      });
      expect(output).toBe(component);
    });
  });
});
