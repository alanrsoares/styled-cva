import { describe, expect, test } from "bun:test";

import {
  formatClassQuasi,
  getIndentBefore,
  makeIndent,
  normalizeClasses,
  tokenizeClasses,
  wrapClassesToWidth,
} from "./class-string";

describe("tokenizeClasses", () => {
  test("splits on any whitespace", () => {
    expect(tokenizeClasses("a  b\tc\nd")).toEqual(["a", "b", "c", "d"]);
  });

  test("drops empties", () => {
    expect(tokenizeClasses("  ")).toEqual([]);
    expect(tokenizeClasses("")).toEqual([]);
  });
});

describe("normalizeClasses", () => {
  test("joins with single space", () => {
    expect(normalizeClasses("  a   b  c  ")).toBe("a b c");
  });
});

describe("getIndentBefore", () => {
  test("counts spaces at start of line", () => {
    const text = "abc\n    foo";
    const offset = text.indexOf("foo");
    expect(getIndentBefore(text, offset)).toBe(4);
  });

  test("counts mixed tabs as one each", () => {
    const text = "\n\t\tfoo";
    const offset = text.indexOf("foo");
    expect(getIndentBefore(text, offset)).toBe(2);
  });

  test("zero when at line start", () => {
    expect(getIndentBefore("foo", 0)).toBe(0);
  });
});

describe("wrapClassesToWidth", () => {
  test("packs greedily under width", () => {
    expect(wrapClassesToWidth(["aaa", "bbb", "ccc", "ddd"], 7)).toEqual([
      "aaa bbb",
      "ccc ddd",
    ]);
  });

  test("single class per line when wider than width", () => {
    expect(wrapClassesToWidth(["hover:bg-blue-500", "rounded"], 5)).toEqual([
      "hover:bg-blue-500",
      "rounded",
    ]);
  });

  test("returns empty for empty input", () => {
    expect(wrapClassesToWidth([], 10)).toEqual([]);
  });
});

describe("makeIndent", () => {
  test("spaces when not using tabs", () => {
    expect(makeIndent(4, false, 2)).toBe("    ");
  });

  test("tabs + remainder spaces when using tabs", () => {
    expect(makeIndent(5, true, 2)).toBe("\t\t ");
  });
});

describe("formatClassQuasi", () => {
  const opts = { printWidth: 80, tabWidth: 2, useTabs: false };

  test("keeps single line when fits", () => {
    const r = formatClassQuasi("flex items-center gap-2", 0, 7, opts);
    expect(r.text).toBe("flex items-center gap-2");
  });

  test("collapses extra whitespace", () => {
    const r = formatClassQuasi("flex   items-center", 0, 7, opts);
    expect(r.changed).toBe(true);
    expect(r.text).toBe("flex items-center");
  });

  test("multiline when single line exceeds printWidth", () => {
    const long = Array.from({ length: 12 }, (_, i) => `class-${i}`).join(" ");
    const r = formatClassQuasi(long, 0, 7, { ...opts, printWidth: 40 });
    expect(r.text).toContain("\n");
    expect(r.text.endsWith("\n")).toBe(true);
  });

  test("indents inner lines by tabWidth", () => {
    const long = Array.from({ length: 12 }, (_, i) => `class-${i}`).join(" ");
    const r = formatClassQuasi(long, 0, 7, { ...opts, printWidth: 40 });
    const lines = r.text.split("\n");
    expect(lines[1]?.startsWith("  ")).toBe(true);
  });
});
