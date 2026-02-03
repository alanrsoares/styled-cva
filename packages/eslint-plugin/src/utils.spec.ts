import { describe, expect, test } from "bun:test";
import {
  capitalize,
  countClasses,
  generateName,
  normalizeClasses,
} from "./utils";

describe("capitalize", () => {
  test("capitalizes first character", () => {
    expect(capitalize("button")).toBe("Button");
    expect(capitalize("div")).toBe("Div");
  });

  test("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  test("handles already capitalized", () => {
    expect(capitalize("Button")).toBe("Button");
  });

  test("handles empty string", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("countClasses", () => {
  test("counts distinct space-separated classes", () => {
    expect(countClasses("a b c")).toBe(3);
    expect(countClasses("btn btn-primary")).toBe(2);
  });

  test("deduplicates repeated classes", () => {
    expect(countClasses("btn btn btn")).toBe(1);
  });

  test("normalizes whitespace before counting", () => {
    expect(countClasses("  a   b   c  ")).toBe(3);
  });

  test("ignores empty segments", () => {
    expect(countClasses("a  b  c")).toBe(3);
    expect(countClasses("")).toBe(0);
  });

  test("single class", () => {
    expect(countClasses("rounded")).toBe(1);
  });
});

describe("normalizeClasses", () => {
  test("joins with single space and removes extra whitespace", () => {
    expect(normalizeClasses("a  b   c")).toBe("a b c");
    expect(normalizeClasses("  foo  bar  ")).toBe("foo bar");
  });

  test("handles single class", () => {
    expect(normalizeClasses("btn")).toBe("btn");
  });

  test("handles empty string", () => {
    expect(normalizeClasses("")).toBe("");
  });

  test("handles only whitespace", () => {
    expect(normalizeClasses("   ")).toBe("");
  });
});

describe("generateName", () => {
  test("returns Styled + capitalized element when not in set", () => {
    const existing = new Set<string>();
    expect(generateName("button", existing)).toBe("StyledButton");
    expect(existing).toEqual(new Set(["StyledButton"]));
  });

  test("adds numeric suffix when base name exists", () => {
    const existing = new Set(["StyledButton"]);
    expect(generateName("button", existing)).toBe("StyledButton1");
    expect(existing).toContain("StyledButton1");
  });

  test("increments suffix when multiple collisions", () => {
    const existing = new Set(["StyledDiv", "StyledDiv1", "StyledDiv2"]);
    expect(generateName("div", existing)).toBe("StyledDiv3");
  });

  test("mutates the passed set", () => {
    const existing = new Set<string>();
    generateName("span", existing);
    expect(existing.has("StyledSpan")).toBe(true);
    generateName("span", existing);
    expect(existing.has("StyledSpan1")).toBe(true);
  });
});
