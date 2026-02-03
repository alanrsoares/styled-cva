import { readFileSync } from "node:fs";
import { join } from "node:path";

type PackageJson = {
  version?: string;
  name?: string;
  [key: string]: unknown;
};

function readPackageVersion(pathSegments: string[]): string | null {
  try {
    const pkgPath = join(process.cwd(), ...pathSegments);
    const raw = readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(raw) as PackageJson;
    return pkg.version ?? null;
  } catch {
    return null;
  }
}

export function getReactVersion(): string {
  return (
    readPackageVersion(["..", "packages", "react", "package.json"]) ??
    "0.0.0"
  );
}

export function getDocsVersion(): string {
  return readPackageVersion(["package.json"]) ?? "0.0.0";
}

