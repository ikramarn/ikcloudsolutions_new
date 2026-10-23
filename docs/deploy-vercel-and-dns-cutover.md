# Deploy to Vercel and cut DNS over from Hostinger

This guide moves ikcloudsolutions.com from the old Vite site on Hostinger to this Next.js site on
Vercel, without touching email. Nothing in this repository deploys anything or changes DNS. Every
step below is done by the owner, in the Vercel, Resend, Cloudflare and Hostinger dashboards.

The rule that keeps email safe: **change only the web records (the apex `A`/`AAAA` and `www`).
Never move nameservers to Vercel and never edit `MX`, SPF, DKIM or DMARC records.**

## Decisions still needed from the owner

These block launch. The code treats all of them as configuration.

| Id  | Question                                                                                                                                | Default used in the code                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Q1  | Approve the final GBP prices (`src/config/pricing.ts`).                                                                                 | The proposed Starter, Pro and Premium monthly prices, excluding VAT.                                               |
| Q2  | Is IK Cloud Solutions VAT registered?                                                                                                   | VAT shown as a separate "plus VAT" note (`vat.mode: 'exclusive'`, 20%). If not registered, set `'not-registered'`. |
| Q3  | Legal entity: is it a limited company? Registered name, Companies House number, registered office, ICO registration number, VAT number. | All optional in `src/config/site.ts` and shown only when set. The site does not say "Ltd" until confirmed.         |
| Q11 | Vercel plan.                                                                                                                            | Vercel Pro. Check Vercel's current terms: the free Hobby plan is for non-commercial use.                           |
| Q12 | Where is DNS authoritative, and where do the mailboxes live?                                                                            | Hostinger DNS and Hostinger mailboxes. Step 0 confirms it.                                                         |

Also before launch: a solicitor must review the seven draft legal pages, then set
`legalReviewed: true` in `src/config/site.ts`. That one flag removes the DRAFT banners and makes the
legal pages indexable.

## Vercel project

- Import the GitHub repository (run `git remote -v` in the repository to confirm its name). The
  Next.js preset is detected automatically; no `vercel.json` is needed. Install command `npm ci`,
  build command `next build`, Node 24.x (from `engines` in `package.json`).
- Production branch: `main`. Merge `feat/nextjs-ai-agents` through a pull request. Every other
  branch gets a Preview deployment, which is `noindex` by design.
- Project Settings, Functions: set the default region to London (`lhr1`) for lower latency to UK
  visitors.
- Domains: add `ikcloudsolutions.com` (primary) and `www.ikcloudsolutions.com` (redirects to the
  apex with a 308).
- Firewall: add a rate-limit rule on `POST /api/lead` (for example 10 a minute per IP). It backs up
  the in-memory limiter, which is per server instance.
- Deployment Protection: switch it on for Preview deployments.
- Cloudflare Turnstile: create a Managed widget in your Cloudflare account (free) with hostnames
  `ikcloudsolutions.com` and `localhost`.

### Environment variables by scope

Production variables are not available to Preview deployments, and Vercel previews run with
`NODE_ENV=production`. A preview without mail keys therefore answers `503 email_not_configured`.
Set both scopes. Never commit secrets: `.env.example` holds names only.

| Variable                         | Production                                                            | Preview                                                                  |
| -------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`           | `https://ikcloudsolutions.com` (required; the build fails without it) | Unset. The site falls back to `https://${VERCEL_URL}`.                   |
| `RESEND_API_KEY`                 | Production key                                                        | A separate Resend key, or the same key restricted by sending domain      |
| `LEAD_TO_EMAIL`                  | `admin@ikcloudsolutions.com`                                          | A test inbox you own. Never a customer address.                          |
| `LEAD_FROM_EMAIL`                | `IK Leads <leads@send.ikcloudsolutions.com>`                          | The same verified sender                                                 |
| `TURNSTILE_SECRET_KEY`           | Real widget secret                                                    | Cloudflare's published always-pass test secret                           |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Real widget site key                                                  | Cloudflare's published always-pass test site key (works on any hostname) |
| `NEXT_PUBLIC_APP_URL`            | Unset until the customer app exists                                   | Unset                                                                    |

`NEXT_PUBLIC_*` values are inlined at build time, so changing one needs a new deployment.

### Resend sending domain

Add the domain `send.ikcloudsolutions.com` in Resend and copy **exactly** the records the dashboard
shows into DNS. For a subdomain they are expected under `send.` (bounce `MX` and SPF `TXT`) and at
`resend._domainkey.send` (DKIM), but the dashboard is the authority, not this document. None sit at
the apex, so Hostinger's mail records are not edited. This is step 2b below.

## Release rule

**Production deployments come from a merge to `main`, built as Production. Never "Promote" a
Preview deployment to Production.** A promoted Preview keeps its baked-in `VERCEL_ENV=preview`, so
it would keep `noindex` and a preview canonical URL. `src/config/tier.ts` is the only place that
reads `VERCEL_ENV`.

## DNS cutover

| Step | Action                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Find where DNS is authoritative: `Resolve-DnsName -Type NS ikcloudsolutions.com`. Note whether DNSSEC is on (`Resolve-DnsName -Type DS ikcloudsolutions.com`, and the registrar setting). If the nameservers are Hostinger's, edit in hPanel, DNS Zone. If they are elsewhere (for example Cloudflare), edit there. Do not move nameservers to Vercel.                                                                                                                                                                                                                                                                                        |
| 1    | Take the BEFORE snapshot: `scripts/dns-snapshot.ps1 -Domain ikcloudsolutions.com -Out dns-before.txt`. Also export or screenshot the whole zone from the DNS panel. Store both outside git.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2    | List the records that must stay untouched: `MX`, SPF `TXT` at the apex, DKIM at `*._domainkey`, `_dmarc` `TXT`, `autodiscover` and `autoconfig` CNAMEs, `mail`, `smtp`, `imap` and `pop` hosts, any verification `TXT` records, `CAA`. Whatever exists is the source of truth.                                                                                                                                                                                                                                                                                                                                                                |
| 2b   | **Additive DNS for the sending domain.** In Resend add `send.ikcloudsolutions.com`. Create exactly the records Resend displays (values copied verbatim, nothing at the apex, no existing record edited or deleted). Click Verify and wait until the domain shows **Verified**. Then run `scripts/dns-snapshot.ps1 -Domain ikcloudsolutions.com -Out dns-after-resend.txt` and compare it with `dns-before.txt` using `fc dns-before.txt dns-after-resend.txt`. The only permitted differences are the new Resend hosts. Anything else is a stop-and-fix. Stage A needs this step done, because Resend rejects mail from an unverified domain. |
| 3    | 24 to 48 hours before the cutover, lower the TTL of the apex `A`/`AAAA` and `www` records to 300 seconds, so a rollback is quick.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 4    | **Stage A (Preview deployment only).** Deploy the branch as a Preview. Check: every route loads; security headers and the CSP are present; `robots.txt` disallows everything and `X-Robots-Tag: noindex` is sent; the contact form and the AI Front Desk request form both deliver to the test inbox using the Preview-scoped variables. The real production Turnstile widget, the Turnstile hostname check and the apex origin cannot be tested here. They are Stage B.                                                                                                                                                                      |
| 5    | Add both domains in the Vercel project. Read the exact DNS values Vercel shows. Historically the apex was `A 76.76.21.21` and `www` was `CNAME cname.vercel-dns.com`, but Vercel is moving to project-specific values, so use what the dashboard shows.                                                                                                                                                                                                                                                                                                                                                                                       |
| 6    | Change **only** the apex `A` (replacing the Hostinger address; delete any apex `AAAA` that points at Hostinger) and `www` (a `CNAME` to the Vercel target, replacing the existing `www` record). Everything else stays.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 7    | If a `CAA` record exists it must allow `letsencrypt.org`, because Vercel issues certificates through it. Add it if needed, otherwise certificate issuance fails.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 8    | Wait for Vercel to show "Valid Configuration" and issue the certificate. Open `https://ikcloudsolutions.com` and `https://www.ikcloudsolutions.com` (it should 308 to the apex).                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 9    | Take the AFTER snapshot (`-Out dns-after.txt`) and compare it with `dns-after-resend.txt`: `fc dns-after-resend.txt dns-after.txt`. The only expected differences are the apex `A`/`AAAA` and the `www` record. Any difference in `MX`, the apex or `_dmarc` `TXT`, DKIM names, `autodiscover`, `autoconfig` or `CAA` (other than the optional `letsencrypt.org` entry) is a stop-and-fix. Then send a test mail from an outside account to `admin@`, reply from the mailbox and check the headers show SPF and DKIM `pass`.                                                                                                                  |
| 10   | **Stage B (production, the first real test).** Before you start, tick the checklist item below. Submit a real contact message and a real AI Front Desk request from `https://ikcloudsolutions.com`. Confirm both arrive with the right Reply-To, that the Turnstile widget renders and that the origin check accepts the apex. This is also the only live test of the Turnstile hostname check: record in your cutover log that a submission with a valid token succeeded. The deployment must come from a merge to `main` (see the release rule).                                                                                            |
| 11   | Search Console: add the domain property (a DNS `TXT` record, which is an additional record), submit `sitemap.xml`, and inspect `/` and `/ai-agents`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 12   | Keep the Hostinger hosting plan unchanged for at least 14 days (this is your rollback). Before deleting the old site files, download `contact_submissions.log` from the old web root, review it for unanswered leads, keep it only as long as needed, then delete it from the server because it holds personal data.                                                                                                                                                                                                                                                                                                                          |
| 13   | Raise the TTLs back to normal. After a stable fortnight you may cancel only the web-hosting part of the Hostinger plan, and only if mailboxes are billed separately. Do not cancel anything that hosts the mailboxes or DNS.                                                                                                                                                                                                                                                                                                                                                                                                                  |

### Checklist item before step 10

- [ ] **`TURNSTILE_SECRET_KEY` is set in the Production scope** (and `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
      with the real widget key), then redeployed. A production build without the secret prints a
      warning and the forms are not protected by Turnstile.

## Rollback

Restore the step 1 values for the apex `A`/`AAAA` and for `www`. Because the TTL was lowered to 300
seconds in step 3, the old site returns within minutes. Tag the last Vite commit `pre-nextjs`
before merging so the old code can be redeployed.

**Precondition (do this during the 14-day window, not when something breaks):** confirm that HTTPS
still works on the Hostinger origin for both the apex and `www`, and that its certificate
auto-renewal is not broken by the DNS move. If the certificate cannot renew while DNS points at
Vercel, a rollback after the certificate expires would show browsers a security warning. Check the
certificate expiry date on the Hostinger side before step 6 and again before step 13.

## DMARC

Leave the existing `_dmarc` record alone. If none exists, publishing `p=none` with a reporting
mailbox is a sensible separate change for later. It is out of scope here.

## Credential rotation

The old site shipped a hard-coded founder password in its public JavaScript, and it remains in this
repository's history. Treat it as compromised and rotate it everywhere it was reused: the Hostinger
account and mailbox, GitHub, Cloudflare, Resend and Vercel. Use a new password, and turn on
two-factor authentication on each of these accounts. Details are in
`docs/content-removed-report.md`.

## Not verified by this repository

The following need a human with the real accounts: real email delivery through Resend, a real
Turnstile challenge, the Vercel project settings, DNS values and propagation, certificate issuance,
and Search Console. The automated suite covers the same paths against a stand-in mail service and
Cloudflare's test keys only.
