/**
 * Bumps patch version in package.json for packages under packages/.
 * Usage: bun run scripts/bump-patch.ts [package-name-or-path]
 *   No args: bump all packages in packages/
 *   e.g. bump-patch.ts @styled-cva/core  or  bump-patch.ts packages/react
 */

import { join, resolve, isAbsolute } from "node:path";
import { readdirSync, statSync } from "node:fs";

const repoRoot = resolve(import.meta.dir, "..");
const packagesDir = join(repoRoot, "packages");

function bumpPatch(version: string): string {
  const parts = version.split(".");
  const last = parts.length - 1;
  const num = parseInt(parts[last], 10);
  if (Number.isNaN(num)) return version;
  parts[last] = String(num + 1);
  return parts.join(".");
}

interface PackageJson {
  name?: string;
  version?: string;
  [key: string]: unknown;
}

interface BumpResult {
  name: string;
  from: string;
  to: string;
}

function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const regex =
    "^" +
    escaped.replace(/\\\*/g, ".*").replace(/\\\?/g, ".") +
    "$";
  return new RegExp(regex);
}

function getAllPackageDirs(): string[] {
  return readdirSync(packagesDir)
    .map((name) => join(packagesDir, name))
    .filter((p) => statSync(p).isDirectory());
}

async function bumpPackageJson(pkgPath: string): Promise<BumpResult | null> {
  const jsonPath = join(pkgPath, "package.json");
  const file = Bun.file(jsonPath);
  if (!(await file.exists())) return null;

  const pkg = (await file.json()) as PackageJson;
  if (pkg.version == null) return null;

  const from = pkg.version;
  const to = bumpPatch(from);
  pkg.version = to;

  await Bun.write(jsonPath, JSON.stringify(pkg, null, 2) + "\n");
  return { name: pkg.name ?? pkgPath, from, to };
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  let dirs: string[] = [];

  if (arg) {
    if (arg.includes("*") || arg.includes("?")) {
      const pattern = globToRegExp(arg);
      for (const dir of getAllPackageDirs()) {
        const file = Bun.file(join(dir, "package.json"));
        if (!(await file.exists())) continue;
        const pkg = (await file.json()) as PackageJson;
        const name = pkg.name ?? dir;
        if (pattern.test(name)) dirs.push(dir);
      }
      if (dirs.length === 0) {
        console.error("No packages matched filter:", arg);
        process.exit(1);
      }
    } else if (arg.startsWith("@styled-cva/")) {
      const slug = arg.replace("@styled-cva/", "");
      const pkgPath = join(packagesDir, slug);
      if (await Bun.file(join(pkgPath, "package.json")).exists()) dirs = [pkgPath];
      else {
        console.error("Package not found:", arg);
        process.exit(1);
      }
    } else if (isAbsolute(arg) || arg.startsWith("packages/")) {
      const pkgPath = isAbsolute(arg) ? arg : join(repoRoot, arg);
      if (await Bun.file(join(pkgPath, "package.json")).exists()) dirs = [pkgPath];
      else {
        console.error("Path not found:", arg);
        process.exit(1);
      }
    } else {
      const pkgPath = join(packagesDir, arg);
      if (await Bun.file(join(pkgPath, "package.json")).exists()) dirs = [pkgPath];
      else {
        console.error("Package not found:", arg);
        process.exit(1);
      }
    }
  } else {
    dirs = getAllPackageDirs();
  }

  const results: BumpResult[] = [];
  for (const dir of dirs) {
    const result = await bumpPackageJson(dir);
    if (result) results.push(result);
  }

  if (results.length === 0) {
    console.log("No package.json with version found.");
    return;
  }
  for (const r of results) {
    console.log(`${r.name}: ${r.from} → ${r.to}`);
  }
}

main();
