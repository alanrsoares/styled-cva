import { describe, expect, it } from "bun:test";
import { cn } from "./cn";

describe("cn", () => {
  it("merges multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("resolves Tailwind conflicts (last one wins)", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("handles conditional classes, arrays, and object dictionaries", () => {
    const isPrimary = true;
    const isDisabled = false;

    expect(
      cn(
        "btn",
        isPrimary && "btn-primary",
        isDisabled && "btn-disabled",
        ["rounded-md", "shadow"],
        { "opacity-50": isDisabled, "cursor-pointer": isPrimary },
      ),
    ).toBe("btn btn-primary rounded-md shadow cursor-pointer");
  });

  it("drops nullish, boolean, and empty values cleanly", () => {
    expect(cn("base", null, undefined, false, "", "extra")).toBe("base extra");
  });
});
