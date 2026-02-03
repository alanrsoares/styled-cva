# Releasing

**@styled-cva/react** and **@styled-cva/eslint-plugin** are published to npm. **@styled-cva/docs** is private. This repo uses [Changesets](https://github.com/changesets/changesets) for versioning and changelogs.

## One-time setup

1. **npm scope:** Create an organization `styled-cva` on [npmjs.com](https://www.npmjs.com) if needed.
2. **Log in:** `npm login` (or `bun login`).

## Workflow with Changesets

### 1. Add a changeset when you make a releasable change

```bash
bun run changeset
```

- Choose which package(s) to bump: `@styled-cva/react`, `@styled-cva/eslint-plugin`, or both.
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
git push && git push --follow-tags   # If you tag in version step
```

`bun run release` runs `bun run build` then `changeset publish`, which publishes only packages that had their version bumped.

### 3. Optional: tag the release

If you want a git tag per release, run after `bun run version`:

```bash
git tag "v$(node -p "require('./packages/react/package.json').version")"
```

(Adjust the path if you prefer to tag from another package’s version.)

## Manual release (without changesets)

To bump and publish a single package without using changesets:

```bash
bun run bump:patch -- "@styled-cva/react"
bun run release:react
# or
bun run bump:patch -- "@styled-cva/eslint-plugin"
bun run release:eslint-plugin
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
