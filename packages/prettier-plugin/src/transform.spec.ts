import { describe, expect, test } from "bun:test";
import prettier from "prettier";

import plugin from "./index.js";

const format = (source: string, printWidth = 80) =>
  prettier.format(source, {
    parser: "babel-ts",
    plugins: [plugin],
    printWidth,
  });

describe("prettier plugin: tw.tag tagged templates", () => {
  test("collapses whitespace inside tw.div template", async () => {
    const src = `const A = tw.div\`   flex   items-center   gap-2  \`;\n`;
    const out = await format(src);
    expect(out).toContain("tw.div`flex items-center gap-2`");
  });

  test("multilines long tw.div template under narrow printWidth", async () => {
    const classes = Array.from({ length: 15 }, (_, i) => `c-${i}`).join(" ");
    const src = `const A = tw.div\`${classes}\`;\n`;
    const out = await format(src, 60);
    const matches = out.match(/tw\.div`([\s\S]*?)`/);
    expect(matches).toBeTruthy();
    expect(matches![1]).toContain("\n");
  });

  test("leaves short tw.div template unchanged", async () => {
    const src = `const A = tw.div\`flex gap-2\`;\n`;
    const out = await format(src);
    expect(out).toContain("tw.div`flex gap-2`");
  });

  test("handles tw(Component) wrapper templates", async () => {
    const src = `const A = tw(Button)\`  bg-blue-500   text-white  \`;\n`;
    const out = await format(src);
    expect(out).toContain("tw(Button)`bg-blue-500 text-white`");
  });

  test("ignores templates with interpolation", async () => {
    const src = "const A = tw.div`flex ${dynamic} gap-2`;\n";
    const out = await format(src);
    expect(out).toContain("flex ${dynamic} gap-2");
  });

  test("ignores non-tw tagged templates", async () => {
    const src = "const A = css`  flex   gap-2  `;\n";
    const out = await format(src);
    expect(out).toContain("css`  flex   gap-2  `");
  });
});

describe("prettier plugin: .cva() string literals", () => {
  test("normalizes base string in tw.div.cva()", async () => {
    const src = [
      "const A = tw.div.cva({",
      '  base: "  flex   items-center  gap-2  ",',
      "  variants: {},",
      "});\n",
    ].join("\n");
    const out = await format(src);
    expect(out).toContain('base: "flex items-center gap-2"');
  });

  test("normalizes variant option strings", async () => {
    const src = [
      "const A = tw.button.cva({",
      '  base: "btn",',
      "  variants: {",
      "    $variant: {",
      '      primary: "  bg-blue-500   text-white  ",',
      '      secondary: "bg-gray-200  text-black",',
      "    },",
      "  },",
      "});\n",
    ].join("\n");
    const out = await format(src);
    expect(out).toContain('primary: "bg-blue-500 text-white"');
    expect(out).toContain('secondary: "bg-gray-200 text-black"');
  });
});
