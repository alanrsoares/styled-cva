import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const PKG_DIR = resolve(import.meta.dirname, "..");

function runBiome(target: string) {
  const { stdout, status } = spawnSync(
    "bunx",
    ["@biomejs/biome", "lint", "--reporter=json", target],
    { cwd: PKG_DIR, encoding: "utf8" },
  );
  return {
    stdout: stdout ?? "",
    exitCode: status ?? -1
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
