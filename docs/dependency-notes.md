# Dependency notes

All 40 pinned packages from the design manifest were checked with `npm view <name>@<version> version` on 2026-10-23 (peer dependencies and `engines` read at the same time). Every pin exists, `npm install` completed without `ERESOLVE`, and no `--force` or `--legacy-peer-deps` is used. `package.json` contains no `^` or `~` (`.npmrc` sets `save-exact=true`).

## Substitutions

| Name | Planned | Actual | Reason |
| ---- | ------- | ------ | ------ |
| (none) | | | Every planned version exists and satisfies its peer and engine ranges. |

## Deliberate version holds

| Package | Held at | Why |
| ------- | ------- | --- |
| typescript | 6.0.3 | `typescript-eslint` (via `eslint-config-next`) requires `<6.1.0`; the registry `latest` (7.x) is not supported yet. |
| eslint | 9.39.5 | `eslint-plugin-react` and `eslint-plugin-jsx-a11y` only declare support up to ESLint 9. npm prints a deprecation notice for 9.x; it is expected until those plugins support ESLint 10. |
| jsdom | 29.1.1 | jsdom 30 needs Node `^24.15`; the dev machine runs 24.12.0. |
| @types/node | 24.19.2 | Major version matches the Node 24 runtime. |

## Engines checked

- next 16.4.2: Node `>=20.9`
- vitest 5.0.5: Node `^22.12 || ^24 || >=26`, `vite ^6.4 || ^7 || ^8` (vite 8.3.5 is pinned)
- @vitejs/plugin-react 6.1.2: `vite ^8`
- lighthouse 13.5.0: Node `>=22.19`
- eslint-config-next 16.4.2: `eslint >=9`, `typescript >=3.3.1`

## CI note

Run `npm run check` with `.next` and `next-env.d.ts` deleted. `typecheck` runs `next typegen` first so typed-route definitions exist on a fresh checkout.
