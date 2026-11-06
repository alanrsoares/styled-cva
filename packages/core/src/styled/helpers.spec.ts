import { describe, expect, it } from "bun:test";

import {
  cleanTemplate,
  createTemplateClassResolver,
  mergeArrays,
} from "./helpers";

const tag = (
  strings: TemplateStringsArray,
  ...fns: Array<(p: { $on?: boolean }) => string | undefined>
) => ({ strings, fns });

const legacy = (
  { strings, fns }: ReturnType<typeof tag>,
  props: { $on?: boolean },
  inherited?: string,
) =>
  cleanTemplate(
    mergeArrays(
      strings,
      fns.map((f) => f(props)),
    ),
    inherited,
  );

describe("createTemplateClassResolver", () => {
  const staticCases = [
    ["no inherited classes", undefined],
    ["empty inherited classes", ""],
    ["extra inherited classes", "shadow-sm"],
    ["conflicting inherited classes", "p-2 text-blue-500"],
  ] as const;

  it.each(staticCases)(
    "matches cleanTemplate for a static template with %s",
    (_, inherited) => {
      const t = tag`
        p-4 rounded-lg
        text-red-500   border
      `;
      const resolve = createTemplateClassResolver(t.strings, t.fns);
      expect(resolve({}, inherited)).toBe(legacy(t, {}, inherited));
    },
  );

  it("returns the same static string on each call", () => {
    const t = tag`p-4 p-2 border`;
    const resolve = createTemplateClassResolver(t.strings, t.fns);
    expect(resolve({})).toBe("p-2 border");
    expect(resolve({})).toBe(resolve({}));
  });

  it("returns an empty string for an empty template", () => {
    const t = tag``;
    const resolve = createTemplateClassResolver(t.strings, t.fns);
    expect(resolve({})).toBe("");
    expect(resolve({}, "px-1")).toBe("px-1");
  });

  it.each([
    [{ $on: true }, undefined],
    [{ $on: false }, undefined],
    [{ $on: true }, "p-8"],
  ])(
    "keeps interpolation order for props %p and inherited %p",
    (props, inherited) => {
      // the static `p-1` after the interpolation must win over `p-4`
      const t = tag`border ${(p) => (p.$on ? "p-4" : undefined)} p-1`;
      const resolve = createTemplateClassResolver(t.strings, t.fns);
      expect(resolve(props, inherited)).toBe(legacy(t, props, inherited));
    },
  );
});
