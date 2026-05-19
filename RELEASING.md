# Releasing

These packages are published to npm: **@styled-cva/core**, **@styled-cva/react**, **@styled-cva/solid**, **@styled-cva/vue**, **@styled-cva/eslint-plugin**, **@styled-cva/prettier-plugin**, and **@styled-cva/biome-plugin**. **@styled-cva/docs** is private. This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and changelogs.

## One-time setup

1. **npm scope:** Create an organization `styled-cva` on [npmjs.com](https://www.npmjs.com) if needed.
2. **Log in:** `npm login` (or `bun login`).

## Workflow with Changesets

### 1. Add a changeset when you make a releasable change

```bash
bun run changeset
```

- Choose which package(s) to bump (any combination of publishable packages listed above).
- Choose bump type: patch / minor / major.
- Write a short summary (used in the CHANGELOG).
- Commit the new file under `.changeset/`.

### 2. Version and release

When you’re ready to release (e.g. after merging to `main`):

```bash
bun run version    # Consume changesets, bump package versions, update CHANGELOGs
bun install        # Update lockfile after version bumps
git add -A && git commit -m "chore(release): version packages"
bun run release    # Build and publish all versioned packages to npm
bunx changeset tag # Create per-package git tags (@scope/pkg@version) for what just shipped
git push && git push --tags
```

`bun run release` runs `bun run build` then `changeset publish`, which publishes only packages that had their version bumped.

### 3. Tagging

The convention in this monorepo is **one git tag per published package per release**, formatted `@styled-cva/<pkg>@<version>` (e.g. `@styled-cva/core@0.7.0`). `bunx changeset tag` reads each `packages/*/package.json` after publish and creates exactly those tags — it is idempotent, so re-running on a release that's already tagged is a no-op.

Avoid single-version "release tags" (e.g. `v0.7.0`) — they lie about every package except one, and break the npm-version-to-git-SHA mapping for the others.

### 4. Attach the agent skill to the GitHub release

After publishing, build and attach the `.skill` artifact so downstream users can install via the release page:

```bash
bun run skill:build                       # writes dist/skill/styled-cva.skill
gh release upload @styled-cva/react@<v> dist/skill/styled-cva.skill
```

The release is keyed off any one of the per-package tags (`@styled-cva/react@<v>` is a reasonable choice). Skill content is identical regardless of which package tag the release page tracks.

## Manual release (without changesets)

To bump and publish a single package without using changesets:

```bash
bun run bump:patch -- "@styled-cva/react"
bun run release:react
# or
bun run bump:patch -- "@styled-cva/eslint-plugin"
bun run release:eslint-plugin
# or
bun run release:prettier-plugin
# or
bun run release:biome-plugin
```

Dry run: `bun publish --cwd packages/react --dry-run`

## From package directory

```bash
cd packages/react
bun run build
bun publish
# or
cd packages/eslint-plugin
bun run build
bun publish
```
