# Changesets

When you make a change that should be released, add a changeset:

```bash
bun run changeset
```

Choose the package(s) to bump (`@styled-cva/react`, `@styled-cva/eslint-plugin`, or both), the bump type (patch/minor/major), and write a short summary. The summary will appear in the package CHANGELOG.

When releasing, run from the repo root:

```bash
bun run version    # Consume changesets, bump versions, update CHANGELOGs
bun install        # Update lockfile
bun run release    # Build and publish all versioned packages
```

See [RELEASING.md](../RELEASING.md) for the full workflow.
