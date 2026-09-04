import { spawnSync } from "node:child_process";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "bun:test";

const PKG_DIR = resolve(import.meta.dirname, "..");

const biome = (...args: string[]) =>
  spawnSync("bunx", ["@biomejs/biome", ...args], {
    cwd: PKG_DIR,
    encoding: "utf8",
  });

interface Diagnostic {
  message?: string;
  category?: string;
  severity?: string;
  location?: { path?: string };
}

interface Report {
  diagnostics?: Diagnostic[];
}

function diagnosticsFor(target: string): Diagnostic[] {
  const { stdout } = biome("lint", "--reporter=json", target);
  const jsonStart = (stdout ?? "").indexOf("{");
  if (jsonStart === -1) return [];
  const report = JSON.parse((stdout ?? "").slice(jsonStart)) as Report;
  return report.diagnostics ?? [];
}

const messageOf = (d: Diagnostic) => d.message ?? "";

const countMatching = (target: string, substring: string) =>
  diagnosticsFor(target).filter((d) => messageOf(d).includes(substring)).length;

/**
 * Write `source` to a throwaway fixture, run `biome lint --write` over it and
 * return the result. Fixes are re-applied by Biome until no rule rewrites, so
 * the returned text is the fixpoint, not the result of a single pass.
 */
function writeAndFix(name: string, source: string) {
  const relative = `fixtures/invalid/${name}`;
  const absolute = resolve(PKG_DIR, relative);
  try {
    writeFileSync(absolute, source);
    const { status } = biome("lint", "--write", relative);
    return { exitCode: status ?? -1, text: readFileSync(absolute, "utf8") };
  } finally {
    try {
      unlinkSync(absolute);
    } catch {}
  }
}

describe("normalize-tw-classes", () => {
  test("flags whitespace runs in tw.div template", () => {
    expect(
      countMatching(
        "fixtures/invalid/whitespace-run.ts",
        "irregular whitespace",
      ),
    ).toBeGreaterThan(0);
  });

  test("flags whitespace runs in tw(Component) wrapper", () => {
    expect(
      countMatching("fixtures/invalid/tw-wrapper.ts", "irregular whitespace"),
    ).toBeGreaterThan(0);
  });

  test("autofixes irregular whitespace with --write", () => {
    const { exitCode, text } = writeAndFix(
      "temp-autofix.ts",
      "const A = tw.div`  flex   items-center  gap-2  `;\nconst B = tw(Button)`   px-4 \t py-2   `;\n",
    );
    expect(exitCode).toBe(0);
    expect(text).toBe(
      "const A = tw.div`flex items-center gap-2`;\nconst B = tw(Button)`px-4 py-2`;\n",
    );
  });

  test("converges on a whitespace run longer than any single arm", () => {
    const { text } = writeAndFix(
      "temp-long-run.ts",
      `const A = tw.div\`flex${" ".repeat(64)}gap-2\`;\n`,
    );
    expect(text).toBe("const A = tw.div`flex gap-2`;\n");
  });
});

describe("multiline-long-tw", () => {
  test("flags single-line tw.div template longer than 80 chars", () => {
    expect(
      countMatching("fixtures/invalid/long-inline.ts", "exceeds 80 chars"),
    ).toBeGreaterThan(0);
  });

  test("wraps a long class list to lines within the budget", () => {
    const { exitCode, text } = writeAndFix(
      "temp-wrap.ts",
      "const A = tw.div`-mx-4 flex flex-col gap-4 border-b border-border/90 px-4 pt-3 pb-7 sm:-mx-6 sm:flex-row sm:items-end sm:justify-between sm:px-6`;\n",
    );
    expect(exitCode).toBe(0);
    expect(text).toBe(
      "const A = tw.div`\n" +
        "  -mx-4 flex flex-col gap-4 border-b border-border/90 px-4 pt-3 pb-7\n" +
        "  sm:-mx-6 sm:flex-row sm:items-end sm:justify-between sm:px-6\n" +
        "`;\n",
    );
  });

  test("leaves a template already inside the budget alone", () => {
    const source =
      "const A = tw.div`flex items-center justify-between gap-2 rounded-lg`;\n";
    expect(writeAndFix("temp-short.ts", source).text).toBe(source);
  });
});

describe("prefer-size-class", () => {
  test("flags identical w-n and h-n classes", () => {
    expect(
      countMatching("fixtures/invalid/size-class.ts", "Use size-n instead"),
    ).toBe(3);
  });

  test("autofixes w-n h-n classes into size-n with --write", () => {
    const { exitCode, text } = writeAndFix(
      "temp-size-autofix.ts",
      "const A = tw.div`flex w-4 h-4 text-red-500`;\nconst B = tw(Button)`h-8 w-8`;\nconst C = tw.div`md:w-12 md:h-12`;\n",
    );
    expect(exitCode).toBe(0);
    expect(text).toBe(
      "const A = tw.div`flex size-4 text-red-500`;\nconst B = tw(Button)`size-8`;\nconst C = tw.div`md:size-12`;\n",
    );
  });

  test("collapses every pair in one --write, not just the first", () => {
    const { text } = writeAndFix(
      "temp-size-many.ts",
      "const A = tw.div`w-4 h-4 gap-2 w-8 h-8`;\n",
    );
    expect(text).toBe("const A = tw.div`size-4 gap-2 size-8`;\n");
  });

  test("collapses a pair inside a wrapped multi-line template", () => {
    const { text } = writeAndFix(
      "temp-size-multiline.ts",
      "const A = tw.div`\n  flex items-center\n  w-10 h-10 rounded-full\n`;\n",
    );
    expect(text).toBe(
      "const A = tw.div`\n  flex items-center\n  size-10 rounded-full\n`;\n",
    );
  });

  test("leaves mismatched sizes and mismatched modifiers alone", () => {
    const source =
      "const A = tw.div`w-4 h-6`;\nconst B = tw.div`md:w-4 lg:h-4`;\n";
    expect(writeAndFix("temp-size-mismatch.ts", source).text).toBe(source);
  });
});

describe("normalize-cva-classes", () => {
  test("flags class strings in a cva config", () => {
    expect(
      countMatching("fixtures/invalid/cva-classes.ts", "irregular whitespace"),
    ).toBeGreaterThan(0);
  });

  test("normalizes base, variants and compoundVariants, but not other values", () => {
    const { exitCode, text } = writeAndFix(
      "temp-cva.ts",
      [
        "const Btn = tw.button.cva({",
        '  base: "inline-flex   items-center ",',
        "  variants: {",
        '    size: { sm: "h-8   px-3", "2xl": "  h-14  px-8" },',
        "  },",
        '  compoundVariants: [{ size: "sm", class: "gap-1   px-2" }],',
        '  defaultVariants: { size: "sm" },',
        "});",
        "",
      ].join("\n"),
    );
    expect(exitCode).toBe(0);
    expect(text).toBe(
      [
        "const Btn = tw.button.cva({",
        '  base: "inline-flex items-center",',
        "  variants: {",
        '    size: { sm: "h-8 px-3", "2xl": "h-14 px-8" },',
        "  },",
        '  compoundVariants: [{ size: "sm", class: "gap-1 px-2" }],',
        '  defaultVariants: { size: "sm" },',
        "});",
        "",
      ].join("\n"),
    );
  });
});

describe("binding resolution", () => {
  test("matches an aliased default import from a @styled-cva adapter", () => {
    const diags = diagnosticsFor("fixtures/invalid/aliased-import.ts");
    expect(
      diags.some((d) => messageOf(d).includes("irregular whitespace")),
    ).toBe(true);
    expect(diags.some((d) => messageOf(d).includes("Use size-n instead"))).toBe(
      true,
    );
  });

  test("ignores a tw imported from another library", () => {
    expect(diagnosticsFor("fixtures/valid/foreign-tw.ts")).toEqual([]);
  });
});

describe("exemptions", () => {
  test("normalized templates produce no diagnostics", () => {
    expect(diagnosticsFor("fixtures/valid/normalized.ts")).toEqual([]);
  });

  test("aliased but already-normalized templates produce no diagnostics", () => {
    expect(diagnosticsFor("fixtures/valid/aliased-import.ts")).toEqual([]);
  });
});
