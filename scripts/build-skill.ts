#!/usr/bin/env bun
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { $ } from "bun";

const REPO_ROOT = resolve(import.meta.dirname, "..");
const SKILL_SRC = resolve(REPO_ROOT, ".claude/skills/styled-cva");
const OUT_DIR = resolve(REPO_ROOT, "dist/skill");
const PACKAGER = resolve(
  process.env.HOME ?? "",
  ".claude/skills/skill-creator/scripts/package_skill.py",
);

mkdirSync(OUT_DIR, { recursive: true });

await $`python3 ${PACKAGER} ${SKILL_SRC} ${OUT_DIR}`;

console.log(`\nSkill artifact written to ${OUT_DIR}/styled-cva.skill`);
console.log("Install for an end-user with one of:");
console.log("  - copy dist/skill/styled-cva.skill into the user's ~/.claude/skills/");
console.log("  - publish the .skill via a Claude Code plugin marketplace");
