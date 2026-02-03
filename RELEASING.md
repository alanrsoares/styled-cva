# Releasing namespaced packages

**@styled-cva/react** and **@styled-cva/eslint-plugin** are published to npm. **@styled-cva/docs** is private.

## One-time setup

1. **Create the npm scope** (if needed): On [npmjs.com](https://www.npmjs.com), create an organization named `styled-cva`, or ensure the scope is available under your user.
2. **Log in:** `npm login` (or `bun login` if using Bun’s registry commands).
3. **Publish access:** Both packages have `"publishConfig": { "access": "public" }` so they publish as public.

## Release @styled-cva/react

```bash
npm version patch -w @styled-cva/react
bun run release:react
```

Or: `npm version patch -w @styled-cva/react && bun run build && npm publish -w @styled-cva/react`

Dry run: `npm publish -w @styled-cva/react --dry-run`

## Release @styled-cva/eslint-plugin

```bash
npm version patch -w @styled-cva/eslint-plugin
bun run release:eslint-plugin
```

Or: `npm version patch -w @styled-cva/eslint-plugin && bun run build && npm publish -w @styled-cva/eslint-plugin`

Dry run: `npm publish -w @styled-cva/eslint-plugin --dry-run`

## From package directory

```bash
cd packages/react
npm version patch && npm publish
# or
cd packages/eslint-plugin
npm version patch && bun run build && npm publish
```

## Version consistency

To sync root version with a package and tag:

```bash
npm version patch -w @styled-cva/react
npm version $(node -p "require('./packages/react/package.json').version") --no-git-tag-version
git add package.json packages/react/package.json
git commit -m "chore(release): @styled-cva/react v0.5.1"
git tag "v0.5.1"
```
