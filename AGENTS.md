# AGENTS.md

Guide for AI coding agents working in this repo. Human-facing docs are in
[`README.md`](./README.md) and [`RELEASING.md`](./RELEASING.md); read those
too if you need user-context.

## Layout

Bun workspace. Each package is independently published except where noted.

| Path                       | Package                       | Notes                                   |
| -------------------------- | ----------------------------- | --------------------------------------- |
| `packages/core`            | `@styled-cva/core`            | Shared `cva`, `cn`, helpers; no UI deps. Subpath `@styled-cva/core/formatting` exports pure class-string utilities for tooling. |
| `packages/react`           | `@styled-cva/react`           | Primary published package               |
| `packages/solid`           | `@styled-cva/solid`           | Solid port                              |
| `packages/vue`             | `@styled-cva/vue`             | Vue port                                |
| `packages/eslint-plugin`   | `@styled-cva/eslint-plugin`   | Rule that extracts classes to `tw…`     |
| `packages/prettier-plugin` | `@styled-cva/prettier-plugin` | Prettier preprocess that normalizes / multilines `tw\`…\`` and `cva()` strings |
| `packages/biome-plugin`    | `@styled-cva/biome-plugin`    | Biome GritQL diagnostics for `tw\`…\`` (lint-only; no fix) |
| `examples/{react,solid,vue}` | `@styled-cva/examples-*`    | Private; consumer smoke tests           |
| `docs`                     | `@styled-cva/docs`            | Private; Nextra site                    |

The three framework packages share a near-identical type architecture
(`types.ts` + `styled-cva.{ts,tsx}`). When you change one, mirror to the
others — discrepancies in this layer are bugs.

The tooling packages (`prettier-plugin`, `biome-plugin`) share class-string
formatting logic via `@styled-cva/core/formatting`. When extending that
logic, put pure helpers in core and re-export from the consumers; do not
duplicate. `eslint-plugin` predates this hoist and still keeps its own
`countClasses` / `normalizeClasses` helpers — fine, but new shared logic
goes in `core/formatting`.

A Claude Code skill lives at `.claude/skills/styled-cva/` — committed and
versioned with the library. It loads automatically when working in this
repo. To publish an updated artifact for downstream users, run
`bun run skill:build`; the resulting `dist/skill/styled-cva.skill` can be
distributed via Claude Code plugin marketplaces or attached to GitHub
releases. Keep SKILL.md in sync when consumer-facing API changes — that
includes the intrinsic CVA shorthand surface, plugin recipes, and Preact
compat instructions.

## Commands

From repo root:

| Command         | What it does                                          |
| --------------- | ----------------------------------------------------- |
| `bun install`   | Install workspace deps                                |
| `bun run build` | Build all publishable packages + docs                 |
| `bun run test`  | All packages' test suites (vitest for framework adapters, `bun:test` for core / eslint-plugin / prettier-plugin / biome-plugin) |
| `bun run lint`  | All packages' eslint                                  |
| `bun run format`| Prettier across the repo                              |

Per-package (run from the package directory):

| Command           | What it does                                       |
| ----------------- | -------------------------------------------------- |
| `bun run compile` | Typecheck only — uses `tsconfig.build.json` (excludes specs) |
| `bun run test`    | Vitest                                             |
| `bun run lint`    | ESLint                                             |
| `bun run bundle`  | tsup → `dist/`                                     |
| `bun run build`   | `compile && bundle`                                |

`compile` is the fast path used by CI/build. Specs are typechecked by
vitest at test time and by the IDE via `tsconfig.json`.

## Type-system landmines

These are the non-obvious things that have broken before — read before
editing `types.ts` or `styled-cva.{ts,tsx}`.

### Don't replace `{}` with `Record<string, never>` or `Record<string, unknown>`

`Record<string, *>` introduces an index signature. Inside
`TailwindPropHelper<P, O>`'s `Pick<M, keyof M>` flatten, `keyof` then
widens to `string | number` and the `Pick` collapses to the index
signature only — silently dropping every literal-union variant prop
(`$variant: "primary" | "secondary"` → `string`) at JSX call sites.

If a lint rule complains about empty `{}`, use `object` (no index
signature, satisfies `no-empty-object-type`). Do **not** "fix" with
`Record<…>`. Locked in by the regression test in
`packages/solid/src/lib/styled-cva/styled-cva.spec.tsx` —
`should preserve $variant union at the JSX call site`.

### Variance markers go on interfaces, not the `TailwindComponent` alias

`TailwindComponent<P, O>` is `IsTwElement & TailwindComponentBase<P,O> & WithStyle<P,O>`.
TS rejects `in out` markers on type aliases whose body is an
intersection. Put the markers on `TailwindComponentBase`, `WithStyle`,
and `TemplateFunction` (interfaces) — they're where the variance worker
actually probes. Without markers, the worker returns `"unreliable"` and
TS falls back to slow structural relations.

### Transient prop convention

Variant prop names by convention start with `$` (e.g. `$variant`,
`$size`, `$tone`). Runtime: `removeTransientProps` strips them before
forwarding to the DOM. Types: `ExtractTransientProps<P>` (in the React
package) maps over `keyof P` and keeps only `${string}`-prefixed keys —
use this whenever you need "the variant slice" of a CVA component's
props (don't hardcode `$variant`).

### `Pick<M, keyof M>` is not redundant

`TailwindPropHelper`'s body looks like an identity but it's load-bearing
for `$as` overload resolution and for flattening hover display. Keep it.
If you need to optimize, cache `M = MergeProps<O, P>` in a default type
parameter so `keyof` and `Pick` share one instantiation — don't remove
the wrapper.

## Conventions

- **Commits**: Conventional Commits with optional scope. Common scopes:
  `(react)`, `(solid)`, `(vue)`, `(core)`, `(eslint-plugin)`,
  `(prettier-plugin)`, `(biome-plugin)`, `(types)`,
  `(docs)`. Use `feat`, `fix`, `perf`, `refactor`, `chore`, `docs`,
  `test`. One commit ≈ one logical change; per-package fixes get their
  own commit.
- **Tests** live next to the code as `*.spec.{ts,tsx}` — never in a
  separate `__tests__` directory.
- **Type tests** use `ts-expect`'s `expectType<TypeEqual<…>>(true)`
  pattern. When fixing an inference bug, add a test that exercises the
  *exact* path that broke (e.g. `Parameters<typeof X>[0]` for the JSX
  call-site path, distinct from `ComponentProps<typeof X>` which routes
  through a different overload).
- **Don't commit** `docs/next-env.d.ts` — autogenerated by Next.js,
  flips between paths depending on `next dev`/`build`.
- **Lint configs**: framework adapter packages (`react`, `solid`, `vue`)
  use their own `.eslintrc.json` (legacy ESLint 8). The newer tooling
  packages (`eslint-plugin`, `prettier-plugin`) use an `eslint.config.js`
  flat config (ESLint 9). `biome-plugin` ships no source-language code.
  Mirror the closest neighbor when adding a new package.

## Tooling

- TypeScript: `^5.9.3`, project tsconfigs extend `tsconfig.base.json`
  which uses `@tsconfig/strictest`.
- Vitest with `happy-dom` (react), `@solidjs/testing-library` (solid),
  Vue Test Utils (vue). `bun:test` for `core`, `eslint-plugin`,
  `prettier-plugin`, `biome-plugin`.
- ESLint v9 (flat config) in tooling packages; framework adapters still
  on legacy ESLint configs.
- tsup for bundling (framework adapters + prettier-plugin; `biome-plugin`
  ships `.grit` source directly with no build).
- Bun is the package manager (`packageManager` field). Don't switch to
  npm/pnpm/yarn.

## Releases

Changesets-driven. See [`RELEASING.md`](./RELEASING.md). One-liner:

```bash
bun run changeset      # add a changeset
bun run version        # consume changesets, bump versions, write CHANGELOGs
git add -A && git commit -m "chore(release): version packages"
bun run release        # build + publish to npm
bunx changeset tag     # create per-package @scope/pkg@version git tags
git push && git push --tags
```

`release:react`, `release:solid`, `release:vue`, `release:eslint-plugin`,
`release:prettier-plugin`, `release:biome-plugin`
are also available for single-package publishes (manual flow).

## When you're unsure

- Mirror an existing pattern from another package — they're aligned by
  design.
- Add the regression test before changing the type. If you can't write
  a test that fails before your change and passes after, you're not
  fixing the right thing.
- For type-perf work, capture
  `tsc --noEmit --extendedDiagnostics | grep -E 'Instantiations|Check time'`
  before and after.
