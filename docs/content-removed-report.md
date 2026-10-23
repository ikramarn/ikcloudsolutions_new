# Removed and unverified content

This report lists everything taken out of the old Vite site and the OmniAgent prototype because it
could not be shown as fact. It is written by hand from `src/data/_unverified-content.ts`, a typed
archive that no module imports (ESLint and the claims-guard test enforce that). Each item has an
`id` and a `kind`; the archive also holds the verbatim original text, the reason and the evidence
needed to bring it back.

To reinstate a claim, supply the evidence named in the archive entry's `neededToReinstate` field.
Until then it stays out. Nothing in the new site's copy, metadata or structured data repeats these
claims, and `tests/unit/claims-guard.rules.ts` fails the build if they reappear.

## Security notice: rotate the founder password

The old site shipped a hard-coded founder login, including a plaintext password, inside its public
JavaScript bundle (`DEFAULT_ACCOUNTS`, with a "fill demo credentials" button in the sign-in dialog).
Anyone who opened the browser developer tools could read it. The archive redacts the password, but
redaction does not remove it from history: it remains in the original commit of this repository
and in any copy of the old bundle that was cached or crawled.

**Treat that password as compromised.** Rotate it everywhere it was ever reused: the Hostinger
account and mailbox, the hosting panel, GitHub, Cloudflare, Resend, and any other account that
shared it. Rewriting git history is not part of this work and needs the owner's explicit
agreement. The new site has no accounts, no sign-in and no password inputs; a test checks every
page, dialog and wizard step for `input[type="password"]`.

## Summary

| Kind                | Items |
| ------------------- | ----- |
| telemetry           | 4     |
| metric              | 15    |
| sla-claim           | 3     |
| case-study          | 3     |
| testimonial         | 3     |
| team-member         | 5     |
| social-proof        | 4     |
| certification-claim | 5     |
| logo                | 1     |
| form-field          | 3     |
| other               | 6     |
| **Total**           | 52    |

Four of the 52 are prototype claims that were rejected rather than ported; they are repeated in
the last section.
The `source` paths in the archive point at the old Vite files. During the migration they sat under
`legacy/`; that folder has since been deleted, and the files remain in git history (the original
commit and the commit that moved them).

## Replacement copy in the new site

| Old content                                      | What the new site says instead                                                                                                                             |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Telemetry ticker, live health card, status badge | Removed. The home page shows an "Illustrative example" card, "How a GitOps flow works", captioned as a simplified view, not a live system.                  |
| Statistics bar and hero trust chips              | Neutral capability chips only: Terraform, Kubernetes, ArgoCD, FinOps, DevSecOps. No result is claimed.                                                     |
| Per-service metrics                              | Removed from every service card. Services describe the work, not outcomes.                                                                                 |
| Support SLA and four-hour response               | "We reply to enquiries by email." No response time is promised.                                                                                            |
| Simulator benchmark percentages                  | The FinOps estimator uses a saving percentage the visitor chooses. Its caption says it is an illustration, not a quote or a benchmark.                     |
| Blueprint download button                        | A "Request a cloud cost review" button that opens the consultation form.                                                                                   |
| Case studies, testimonials, client logos         | None shown. There is no testimonial slot, so nothing needs filling until a real customer agrees to be named.                                               |
| Team members Aisha Rahman and Priya Menon        | Removed. The About page presents the founder, Ikram Ullah, with a neutral bio and a list of specialties.                                                   |
| Founder bio reach claims                         | "Ikram Ullah founded IK Cloud Solutions. His work covers multi-cloud infrastructure, Kubernetes, Terraform, FinOps and GitOps with ArgoCD."               |
| Mission and vision superlatives                  | A plain mission and vision on the About page.                                                                                                              |
| Academy ratings, enrolments, badges, trainers    | None. The Academy is labelled "Demo: sample content, nothing here is a paid course." Course durations are computed from the lessons.                       |
| Trainer analytics tab                            | Removed.                                                                                                                                                   |
| Course certification labels                      | Removed. The demo makes no accreditation claim.                                                                                                            |
| Security and compliance slogans                  | DevSecOps copy describes evidence collection and policy-as-code. The security page states plainly which certifications the company does not hold.         |
| Founder login, sign-up and avatar service        | No accounts. The Academy progress lives in the visitor's own browser and is only written after an action.                                                  |
| "Global Headquarters", "Physical Office" labels  | "Address": 35 Napier Road, Glenrothes KY6 1DS. The map loads only when the visitor asks for it.                                                            |
| "Transmission Dispatched" success state          | The form shows success only when the server confirms delivery, with a reference. On failure it shows an error and an email address, and keeps the values. |

## Items by kind

### telemetry

| Id                          | What it was                                        |
| --------------------------- | -------------------------------------------------- |
| `navbar-system-telemetry`   | Top ticker presented as a live status feed         |
| `hero-live-cloud-telemetry` | Hero card with invented cluster health and nodes   |
| `hero-terminal-block`       | Scripted terminal output presented as live         |
| `footer-operational-tag`    | Fixed "operational" badge with no status behind it |

### metric

| Id                             | What it was                                                    |
| ------------------------------ | -------------------------------------------------------------- |
| `home-stats-modernisations`    | Stats bar: number of cloud modernisations                      |
| `home-stats-finops-reduction`  | Stats bar: average FinOps reduction                            |
| `home-stats-engineers-trained` | Stats bar: number of engineers trained                         |
| `hero-trust-chips`             | Outcome chips in the hero                                      |
| `services-metrics-devops`      | DevOps and GitOps card metrics                                 |
| `services-metrics-agentic-ai`  | Agentic AI card metrics                                        |
| `services-metrics-migration`   | Cloud migration card metrics                                   |
| `services-metrics-finops`      | FinOps card savings range                                      |
| `services-metrics-devsecops`   | DevSecOps card absolute claims                                 |
| `services-metrics-staffing`    | Staffing card ranking and matching time                        |
| `simulator-benchmark-savings`  | Hard-coded savings percentages in the simulator                |
| `simulator-deploy-multiplier`  | Invented speed-up multipliers and recovery time                |
| `academy-uptime-lesson`        | Lesson text with a guaranteed uptime figure                    |
| `trainer-analytics-tab`        | Fabricated analytics in the trainer editor                     |
| `prototype-performance-claims` | Prototype latency, uptime, call volume and isolation figures   |

### sla-claim

| Id                    | What it was                              |
| --------------------- | ---------------------------------------- |
| `home-stats-gitops-sla` | Availability SLA that was never offered |
| `contact-support-sla`   | Round-the-clock on-call promise         |
| `contact-response-time` | Four-hour response promise              |

### case-study

| Id                       | What it was                                       |
| ------------------------ | ------------------------------------------------- |
| `case-study-fintech`     | Unnamed banking client, dollar figures, PCI claim |
| `case-study-logistics`   | Unnamed logistics client, dollar savings          |
| `case-study-healthcare`  | Unnamed healthcare client, availability claim     |

### testimonial

| Id                          | What it was                      |
| --------------------------- | -------------------------------- |
| `testimonial-marcus-vance`  | Fictional VP of Engineering      |
| `testimonial-elena-rostova` | Fictional CTO                    |
| `testimonial-david-macleod` | Fictional head of infrastructure |

### team-member

| Id                      | What it was                                          |
| ----------------------- | ---------------------------------------------------- |
| `team-aisha-rahman`     | Principal architect with a stock portrait            |
| `team-priya-menon`      | Head of data and AI with a placeholder illustration  |
| `founder-bio-phrases`   | Reach claims in the founder bio                      |
| `academy-trainer-aisha` | Trainer attached to a demo course                    |
| `academy-trainer-priya` | Trainer attached to a demo course                    |

### social-proof

| Id                         | What it was                                |
| -------------------------- | ------------------------------------------ |
| `academy-ratings`          | Star ratings and review counts             |
| `academy-enrolment-counts` | Enrolment numbers and popularity badges    |
| `academy-masterclass-hours`| "Over 80+ hours" of masterclasses          |
| `academy-durations`        | Hard-coded course durations                |

### certification-claim

| Id                           | What it was                                  |
| ---------------------------- | -------------------------------------------- |
| `cert-compliance-automation` | Four compliance frameworks named as outcomes |
| `cert-military-grade`        | "Military-grade" security slogan             |
| `cert-pci-dss`               | PCI compliance claim in a case study         |
| `cert-labels-courses`        | Certification labels on demo courses         |
| `prototype-security-claim`   | Prototype payment-security level             |

### logo

| Id                    | What it was                              |
| --------------------- | ---------------------------------------- |
| `prototype-fake-logos`| Five fictional customer logos            |

### form-field

| Id                       | What it was                                              |
| ------------------------ | -------------------------------------------------------- |
| `default-founder-account`| Hard-coded founder login (password redacted, see above)  |
| `fill-demo-credentials`  | Button that pre-filled the founder login for any visitor |
| `prototype-card-fields`  | Card number, expiry and security code inputs             |

### other

| Id                           | What it was                                      |
| ---------------------------- | ------------------------------------------------ |
| `simulator-blueprint-download` | Download button that only showed a toast       |
| `dicebear-avatar-call`       | Visitor names sent to a third-party avatar API   |
| `contact-labels`             | Inflated headings and a false success state      |
| `trainer-space-link`         | Footer link to a sign-in-only trainer area       |
| `footer-measurable-impact`   | Outcome claim with no measurements               |
| `mission-vision-superlatives`| Reach and superlative wording                    |

## Prototype claims rejected (never ported)

The prototype in `callagents` (OmniAgent AI) was used for layout inspiration only. None of its
claims were ported. These are listed so they are not reintroduced by accident.

- Performance and volume: 24ms latency, 99.98% uptime, 4.8M+ calls handled, "0% hallucination
  boundary", "100% white-label isolation" (archive id `prototype-performance-claims`).
- Security level: "PCI-Level 1 Enclave" (`prototype-security-claim`).
- Customer logos: Apex Dynamics, Kinetix, Hyperion, Vektor, Lumina (`prototype-fake-logos`).
- Card number, expiry and CVC inputs (`prototype-card-fields`).
- Pricing in US dollars and pricing for non-UK markets. The new site is UK only and GBP only.

If any of these become true later, add the evidence first, then update the copy, the claims-guard
rules and this report together.
