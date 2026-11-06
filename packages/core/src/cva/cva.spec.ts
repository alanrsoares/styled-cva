import { describe, expect, it } from "bun:test";

import { cva } from "./cva";

describe("cva boolean shorthand (issue #18)", () => {
  const frame = cva("base", {
    variants: {
      $active: "ring-2",
      $tone: { info: "bg-blue", tip: "bg-green" },
    },
    compoundVariants: [
      { $active: true, $tone: "info", class: "active-info" },
      { $active: false, $tone: "tip", class: "idle-tip" },
    ],
  });

  it.each([
    [{ $active: true }, "base ring-2"],
    [{ $active: false }, "base"],
    [{}, "base"],
    [
      { $active: true, $tone: "info" as const },
      "base ring-2 bg-blue active-info",
    ],
    [{ $active: false, $tone: "tip" as const }, "base bg-green idle-tip"],
  ])("resolves %o", (props, expected) => {
    expect(frame(props)).toBe(expected);
  });

  it("uses the default variant", () => {
    const withDefault = cva("base", {
      variants: { $active: "ring-2" },
      defaultVariants: { $active: true },
    });
    expect(withDefault()).toBe("base ring-2");
    expect(withDefault({ $active: false })).toBe("base");
  });

  it("matches the object form", () => {
    const short = cva("base", { variants: { $on: "x" } });
    const long = cva("base", { variants: { $on: { true: "x", false: "" } } });
    for (const $on of [true, false, undefined]) {
      expect(short({ $on })).toBe(long({ $on }));
    }
  });
});
