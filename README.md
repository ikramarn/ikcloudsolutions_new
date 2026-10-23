# IK Cloud Solutions website

The website for IK Cloud Solutions (ikcloudsolutions.com): cloud, DevOps and FinOps consultancy
pages, the AI Front Desk section (an AI receptionist for UK businesses, sold as a service), a demo
Academy, and the legal pages.

Built with Next.js 16 (App Router, static pages first), React 19, TypeScript, Tailwind CSS 4, Radix
UI, Zod, Vitest and Playwright. UK English, GBP only, UK market only.

## Setup

Requirements: Node 24 (`.nvmrc` says `24`) and npm 11.

```powershell
npm ci
npx playwright install chromium   # only needed for the end-to-end tests and Lighthouse
npm run dev                         # http://localhost:3000
```

Copy `.env.example` to `.env.local` and fill in what you need. Every variable is optional for local
development. Never commit `.env.local`.

## Scripts

| Script                 | What it does                                                                                        |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `npm run dev`          | Development server                                                                                  |
| `npm run build`        | Production build                                                                                    |
| `npm run start`        | Serve the production build (`npm run start -- -p 3100` to pick a port)                              |
| `npm run typecheck`    | `next typegen` then `tsc --noEmit`                                                                  |
| `npm run lint`         | ESLint, no warnings allowed                                                                         |
| `npm run format`       | Prettier, write                                                                                     |
| `npm run format:check` | Prettier, check only                                                                                |
| `npm test`             | Vitest (unit and component tests)                                                                   |
| `npm run knip`         | Unused files, exports and dependencies                                                              |
| `npm run check`        | The gate: typecheck, lint, format check, tests and knip. Run it before every commit                 |
| `npm run test:e2e`     | Playwright end-to-end suite (builds the site, starts a stand-in mail service, runs desktop, mobile) |
| `npm run lighthouse`   | Lighthouse scores for `/` and `/ai-agents` (start the built site on port 3100 first)                |

## Environment variables

Names only live in `.env.example`.

| Variable                         | Scope  | Purpose                                                                                                       |
| -------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| `RESEND_API_KEY`                 | server | Sends lead emails through Resend. In production the forms return an error without it                          |
| `LEAD_TO_EMAIL`                  | server | Where leads are delivered                                                                                     |
| `LEAD_FROM_EMAIL`                | server | Verified sender, for example `IK Leads <leads@send.example.com>`                                              |
| `TURNSTILE_SECRET_KEY`           | server | Cloudflare Turnstile secret. When set, every lead needs a valid token                                         |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public | Turnstile widget key. Needed whenever the secret is set                                                       |
| `NEXT_PUBLIC_SITE_URL`           | public | Canonical origin. Required for a Production build; Preview falls back to `VERCEL_URL`                         |
| `NEXT_PUBLIC_APP_URL`            | public | Customer app address. Leave empty until the app exists; the call-to-action then uses the on-site request form |

`NEXT_PUBLIC_*` values are inlined when the site is built.

## Project layout

- `src/app` routes, the lead API (`/api/lead`), sitemap, robots, manifest, icons and the
  Open Graph image route (`/og/[card]`).
- `src/config` site facts, the route registry (`routes.ts`), navigation, the single pricing source
  (`pricing.ts`), redirects and the deployment tier (`tier.ts`).
- `src/content` typed page copy. Prices, allowances and VAT wording are never typed into copy;
  they come from `src/config/pricing.ts` and `src/lib/money.ts`.
- `src/lib/server` server-only lead handling: origin check, rate limit, Turnstile, email.
- `src/data/_unverified-content.ts` an archive of removed claims. Nothing may import it.
- `tests/unit`, `tests/components`, `tests/e2e` Vitest and Playwright.
- `docs` deployment guide, accessibility checklist, dependency notes and the removed-content report.

## Testing

- `npm test` runs the unit and component tests, including the claims guard
  (`tests/unit/claims-guard.*`), which scans the source for banned claims such as invented metrics,
  US dollar prices, card or password inputs and hand-typed prices.
- `npm run test:e2e` runs Playwright against a production build. It starts three things: a small
  stand-in for the Resend API on port 3199, the site on port 3100, and a second build of the site on
  port 3101 that has a Turnstile site key (used only by `tests/e2e/turnstile.spec.ts`). The second
  build writes to `.next-turnstile`. Specs import `test` from `./helpers`, which gives every test a
  fresh client address so the lead rate limiter never leaks between tests.
- The end-to-end suite also runs axe on the main pages and a built-HTML claims-guard pass.
- Not automated: real email delivery, a real Turnstile challenge, screen readers and browsers other
  than Chromium. See `docs/accessibility-checklist.md`.

## Releasing

**Merge to `main` only. Never "Promote" a Preview deployment to Production.** A promoted Preview
keeps its preview settings (`noindex` and a preview canonical URL). The full deployment and DNS
cutover plan, including the order of steps that keep email working, is in
`docs/deploy-vercel-and-dns-cutover.md`.

## Continuous integration

Run `npm run check` on a clean checkout, with `.next` and `next-env.d.ts` removed, so the typed
route definitions are generated from scratch. `typecheck` does this itself with `next typegen`.

## Credentials

The previous site shipped a hard-coded founder password in its public JavaScript. Treat that
password as compromised and rotate it wherever it was reused. See `docs/content-removed-report.md`.
