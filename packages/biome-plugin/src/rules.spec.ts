import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, test } from "bun:test";

const PKG_DIR = resolve(import.meta.dirname, "..");

function runBiome(target: string) {
  const { stdout, status } = spawnSync(
    "bunx",
    ["@biomejs/biome", "lint", "--reporter=json", target],
    { cwd: PKG_DIR, encoding: "utf8" },
  );
  return {
    stdout: stdout ?? "",
    exitCode: status ?? -1,
  };
}

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
  const { stdout } = runBiome(target);
  const jsonStart = stdout.indexOf("{");
  if (jsonStart === -1) return [];
  const report = JSON.parse(stdout.slice(jsonStart)) as Report;
  return report.diagnostics ?? [];
}

const messageOf = (d: Diagnostic) => d.message ?? "";

describe("normalize-tw-classes", () => {
  test("flags whitespace runs in tw.div template", () => {
    const diags = diagnosticsFor("fixtures/invalid/whitespace-run.ts");
    expect(
      diags.some((d) => messageOf(d).includes("irregular whitespace")),
    ).toBe(true);
  });

  test("flags whitespace runs in tw(Component) wrapper", () => {
    const diags = diagnosticsFor("fixtures/invalid/tw-wrapper.ts");
    expect(
      diags.some((d) => messageOf(d).includes("irregular whitespace")),
    ).toBe(true);
  });

  test("autofixes irregular whitespace with --write", () => {
    const { writeFileSync, readFileSync, unlinkSync } = require("node:fs");
    const testFile = resolve(PKG_DIR, "fixtures/invalid/temp-autofix.ts");
    try {
      writeFileSync(
        testFile,
        "const A = tw.div`  flex   items-center  gap-2  `;\nconst B = tw(Button)`   px-4 \t py-2   `;\n",
      );
      const { status } = spawnSync(
        "bunx",
        [
          "@biomejs/biome",
          "lint",
          "--write",
          "fixtures/invalid/temp-autofix.ts",
        ],
        { cwd: PKG_DIR, encoding: "utf8" },
      );
      expect(status).toBe(0);
      expect(readFileSync(testFile, "utf8")).toBe(
        "const A = tw.div`flex items-center gap-2`;\nconst B = tw(Button)`px-4 py-2`;\n",
      );
    } finally {
      try {
        unlinkSync(testFile);
      } catch {}
    }
  });
});

describe("multiline-long-tw", () => {
  test("flags single-line tw.div template longer than 80 chars", () => {
    const diags = diagnosticsFor("fixtures/invalid/long-inline.ts");
    expect(diags.some((d) => messageOf(d).includes("exceeds 80 chars"))).toBe(
      true,
    );
  });
});

describe("exemptions", () => {
  test("normalized templates produce no diagnostics", () => {
    const diags = diagnosticsFor("fixtures/valid/normalized.ts");
    expect(diags).toEqual([]);
  });
});
