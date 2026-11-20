# Empower demo for GLA: Phase 0 report

Phase 0 of the "Empower Demo Environment for an Islamic School" spec (2026-10-22). This PR is docs only. No demo code will be written until Alex approves.

## Decisions needed (recommended default in **bold**)

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Data approach | a) fixtures + session state, b) `demo_` tables in D1, c) separate D1 | **a**. Fixtures are typed TS in the repo; edits are held in `sessionStorage`; there is a "Reset demo" button. |
| D2 | Access | access code vs public | **Access code**: `DEMO_ACCESS_CODE` secret, HMAC-signed cookie (same pattern as admin), checked in `middleware.ts` for `/demo/*`. Demo pages are noindex either way. |
| D3 | Charts | library vs hand-rolled SVG | **Hand-rolled SVG**: 0 KB of dependencies, and every chart gets a "view as table" toggle. |
| D4 | Demo app shape | one route per screen vs one client app | **One client-rendered app at `/demo`** that switches views through `?view=`. This makes "works offline once loaded" a guarantee (see R6). |
| D5 | IEP vs ILP wording | change `/private-schools` or leave it | **Leave `/private-schools` as is** in this work. The demo says IEP throughout. Alex decides on the page wording separately. |
| D6 | `?school=` override | yes/no | **Yes**, limited to an allow-list in the config file. It's cheap to add and makes renaming the demo for another school instant. |
| D7 | AI goal draft (WS3, optional) | build / defer | **Defer.** It isn't needed for the pitch, and it's the only demo feature that calls an external AI. |
| D8 | "See a live demo" link on `/private-schools` | yes/no | **No.** Direct link only until after the GLA pitch. |
| D9 | SMS / email providers | see section 9 | **Twilio** for SMS and **Resend** for email. Both need setup by Alex with some lead time (see R3, R4). |

## 1. Repo inventory (base @ `abf793a`)

- **36 tracked files.** The spec said 34; PR #7 since added `.github/workflows/deploy.yml` and `.npmrc`.
- **Installed versions** (from `node_modules`):
  - next 15.5.2
  - react 18.3.1
  - eslint-config-next 16.2.9 (a major version ahead of next; lint works today)
  - @cloudflare/next-on-pages 1.13.16
  - wrangler 4.101.0
  - tailwindcss 4.3.1
- **No Next.js docs in `node_modules`.** `node_modules/next/dist/docs/` doesn't exist in 15.5.2, because the AGENTS.md note was written for Next 16. Work will follow the Next 15 App Router docs.
- **Build:** `npx @cloudflare/next-on-pages` produces `.vercel/output/static`. Deploy is `wrangler pages deploy` to project `empower`, branch `base`. Production is https://empower-c9l.pages.dev.
- **PR #7 is merged**, not open. Every PR runs `npm ci`, lint, `tsc` and the build. Pushes to `base` also run D1 migrations and the deploy.
- **The deploy step fails** on every push because the repo has no `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` Actions secrets. Until Alex adds them, Devin deploys manually after each merge.
- **The GitHub default branch is still `devin/empower-mvp`.** It should be `base`.

## 2. Section 2 of the spec, checked

| Spec claim | Status |
|---|---|
| Stack, edge API routes, Tailwind v4, Lexend, brand tokens | Confirmed |
| next ^15.5.2 vs eslint-config-next ^16.2.9 | Confirmed. Installed next is 15.5.2. |
| D1 bound, 4 tables, nothing writes, leads lost | **Outdated.** PR #9 (merged today) writes leads, clients, intakes and program plans to D1, and `/admin` reads them. Production D1 has the schema applied. **Workstream 8 is therefore done.** |
| HMAC admin sessions | Confirmed (`src/lib/auth.ts`) |
| Program Builder streams `claude-sonnet-4-6`; per-isolate in-memory rate limit | Confirmed. Separately, a local test plan stopped mid-table at `max_tokens: 8192` (see R8). |
| PR #7 open, not merged | **Outdated.** Merged. |
| No test framework | Confirmed |
| README "No individual student data (PII) is collected" | Confirmed (README line 122). The demo keeps it true: fixtures are fictional and nothing typed into the demo is stored or sent. |
| `/private-schools` uses ILP | Confirmed: 6 mentions of ILP and 1 of IEP. Left unchanged (D5). |

## 3–5. Data, access, charts

Recommendations are D1 to D3 in the decisions table.

**Access code (D2):**
- `/demo` shows a code form. A correct code sets an `empower_demo` cookie for 7 days, signed with the HMAC of `DEMO_ACCESS_CODE`.
- `middleware.ts` (edge) guards `/demo/*`.
- Changing the secret revokes all existing access.

**Charts (D3):** the screens need two chart types:
- a line chart with baseline, aim line, phase-change marker and weekly points
- bars for tiers, screening and specialist hours

Both are about 150 lines of SVG each, and they're accessible through `role="img"`, an `aria-label` summary and a data-table toggle. An alternative such as Recharts would add about 100 KB gzipped to the bundle for no real gain.

## 6. Route and component plan

```
src/app/demo/layout.tsx         banner, noindex metadata, role switcher, Reset demo
src/app/demo/page.tsx           client app; view = dashboard | roster | student | pipeline | parent | notify | value
src/app/api/demo/notify/route.ts   edge; the only demo server route (WS5)
src/middleware.ts               access-code guard for /demo/*
src/demo/types.ts               all fixture types (section 7)
src/demo/config/school.ts       white-label config + allow-listed overrides
src/demo/content/islamic.ts     every 6B string (for GLA Islamic Studies review)
src/demo/content/character.ts   character & leadership strengths wording
src/demo/content/tour.ts        guided-tour stops + presenter notes
src/demo/content/messages.ts    SMS/email templates (EN + AR/UR samples)
src/demo/fixtures/*.ts          students, staff, calendar, program metrics
src/demo/lib/calendar.ts        school-day maths (Eid closures, Ramadan, reporting periods)
src/demo/lib/iep-rules.ts       30-school-day clock, transition at 14+, signature at 16+, completeness
src/demo/lib/decision-rule.ts   4 points below aim line
src/demo/lib/metrics.ts         every dashboard number, computed from fixtures
src/demo/lib/calculator.ts      value calculator maths
src/demo/state/DemoProvider.tsx role, session edits, reset
src/demo/components/*           charts, IEP sections, tiles, tour overlay
tests/unit (Vitest), tests/e2e (Playwright)
INVARIANTS.md, DEMO_RUNBOOK.md (repo root)
```

`robots.txt` gets `Disallow: /demo`, and the demo layout sets `robots: { index: false }`. There is no sitemap today, and none will be added.

## 7. IEP data model vs the Ontario template (2022 sample)

I checked the template PDF (files.ontario.ca, 2022-06-28). **Correction to spec 6A:** the template's last pages run Human resources → IEP development team → Sources consulted and Date of placement / completion → **Log** → **Principal's statement** → **Parent/student consultation and signatures**. Spec items 12–14 therefore become, in template order:

1. Reason for developing the IEP → `IepReason` (`identified_by_review` | `not_identified_requires_support`)
2. Student profile → `IepStudentProfile`: name, grade, school year, exceptionality, placement decision, last review date; OEN and DOB show "Not shown in demo"
3. Assessment data → `IepAssessment[]` (source, date, summary), plus `medicalConditions` and `healthSupport` (both in the template)
4. Strengths and needs → `IepStrengthsNeeds`. Character and leadership strengths sit here too, from `content/character.ts`.
5. Subjects/courses → `IepCourse[]`: `status: AC | MOD | ALT`, `courseCode?`, `schoolDeveloped` (Quran / Arabic / Islamic Studies). The template's exemption or substitution fields, diploma type and report format are also included.
6. Accommodations → `Accommodation[]` (`instructional | environmental | assessment`), plus `individualizedEquipment`
7. Provincial assessments → `IepProvincialAssessment`: OSSLT accommodations; EQAO defaults to "Not applicable"
8. Special education program → `IepProgram[]`, one per MOD or ALT subject: baseline, annual goal, `LearningExpectation[]` by reporting period, strategies, assessment methods
9. Transition plan → `TransitionPlan` (goals, actions, responsible, timelines)
10. Human resources → `IepService[]` (service, start, frequency, location)
11. IEP development team → `StaffMember` refs and roles
12. Sources consulted and placement → `sourcesConsulted[]`, `placementDate`, `completionDate`
13. Log of consultation and review → `ConsultationLogEntry[]`
14. Principal's statement and sign-off (demo signature)
15. Parent/student consultation → consulted / declined / received copy; student required at 16+

The UI keeps the spec's "14 sections" count by merging 10 and 12 into one "Placement and development" section, matching the spec's item 10. The print order asserted in tests is the template order above.

## 8. White-labelling

`src/demo/config/school.ts` holds a `SCHOOLS` record with `gla` as the default. Each entry has:
- name, short name, crest initials, accent colour
- grades, subjects and course codes
- calendar notes
- the classroom-configuration flag
- program capacity
- the illustrative enrolment and tuition figures

`?school=<key>` is honoured only for keys in that record and is stored in session. Renaming the demo for a new prospect means copying one entry and editing it, about 5 minutes.

## 9. Notifications

- **SMS: Twilio.** Its REST API is called with `fetch` from the edge route.
  - Canadian numbers: use a verified toll-free number for reliable delivery; Canadian long codes are filtered more heavily.
  - Cost: roughly a cent per SMS segment plus a monthly number fee. Confirm current pricing at setup.
  - Toll-free verification can take days, so start now (R3).
- **Email: Resend** (`fetch`, edge-compatible). Alex's existing Resend account is shared with Ri'aya, FaezSports and IGNYTE. Empower needs its own verified sending domain or subdomain, and **Empower has no domain yet** (R4).
  - Resend's free tier covers demo volume.
- **Secrets**, all Cloudflare Pages secrets and never in the client bundle:
  - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
  - `RESEND_API_KEY`, `DEMO_NOTIFY_FROM_EMAIL`
  - `DEMO_NOTIFY_ALLOWLIST`, as JSON: `[{ "label": "Marya", "phone": "+1…", "email": "…" }]`
- **Server-side enforcement:**
  - `POST /api/demo/notify` accepts only `{ studentId, type, recipientLabel, channel }`.
  - The recipient is looked up from the allow-list by label; there is no free-text phone or email field. An unknown label returns 403, and this is covered by a test.
  - The message body is rendered on the server from fixtures through the same `content/messages.ts` renderer the preview uses, so the preview and the sent message are identical, and no typed text is ever sent.
  - The route requires the demo cookie and is rate-limited.
- **Templates:** weekly summary, goal met, goal needs attention, meeting reminder, IEP review notice and a SERT message.
  - Each has an SMS version (≤320 characters, "Reply STOP to opt out") and an email version (Empower-branded with GLA's name, progress bars per goal, unsubscribe link).
  - Arabic and Urdu samples are marked "sample translation: review by a fluent speaker".
- **Send log:** kept in session state in the UI, plus a `console.log` line per send on the server. There are no D1 writes, per invariant 2.

## 10. Test plan

- **Unit tests (Vitest, new):**
  - school-day calendar and the 30-day clock, including Eid closures
  - transition plan at 14+ and signature at 16+
  - IEP section order
  - decision rule
  - dashboard metrics: tier counts, goals on track
  - calculator: defaults, zeros, investment blank vs filled
  - notify allow-list refusal
- **E2E (Playwright, new):**
  - a smoke test that loads every existing route and checks its h1
  - contact-form validation errors
  - `/admin` refuses without a session
  - demo pages: banner and noindex, the Parent role can't reach other students (including by URL), RTL rendering
  - `@axe-core/playwright` on demo pages
- **Where they run:** the E2E tests run against `next build && next start`. Both suites are added to `deploy.yml` before the deploy step, adding about 2 minutes per PR.
- The fixture PII grep (surnames, emails other than example.com, non-555 phone numbers, street addresses) also runs in CI.

## 11. Risks and open questions

- **R1 (Alex):** add the GitHub Actions secrets and switch the default branch to `base`. Until then every merge is red and is deployed by hand.
- **R2 (Alex):** the production admin password is still the temporary one. Rotate it before the demo drives traffic to the site.
- **R3 (Alex):** do you have a Twilio account, or should one be created? Toll-free verification has lead time.
- **R4 (Alex):** where should email come from? There is no Empower domain. Options:
  - a subdomain of ignyteconsulting.com (DNS in Hostinger, Alex-only)
  - buy a domain for Empower
  - for the live demo only, Resend's shared test sender, which can only deliver to the Resend account owner's address
- **R5:** parent-role isolation is enforced in the client. The fictional fixtures for all students ship in the bundle. That's acceptable for synthetic data and is stated in INVARIANTS.md, but the production product must enforce isolation on the server.
- **R6:** Next client navigation fetches RSC payloads for routes that haven't been prefetched, which would break offline use mid-demo. D4 (one client app) avoids this.
- **R7:** the Islamic-element wording, the character strengths and the Arabic and Urdu samples will be Devin-drafted. They need review by GLA Islamic Studies staff and fluent speakers before the pitch.
- **R8 (unrelated to the demo):** Program Builder output looks truncated at 8192 tokens, and generation took about 170 s in testing. Raise the limit or tighten the prompt in a separate PR?
- **R9:** the "no `$` in the bundle" check will list the tuition default ($5,000) and the calculator's outputs. These are school-side figures and are allowed by the spec. The PR will list every hit.
- **R10:** the spec's 6A order for items 12–14 doesn't match the template; corrected in section 7.

## 12. Effort and sequence

Estimates are in Devin working time.

| WS | Scope | Estimate |
|---|---|---|
| 1 | Foundations: invariants, layout and banner, access, roles, types, all 28 fixtures, calendar, content files, config, reset, Vitest + Playwright setup with smoke suite | 1 session (largest, because of the fixtures) |
| 2 | Principal dashboard | ½ session |
| 3 | Roster, profile, IEP and editor, print | 1 session |
| 4 | Pipeline and progress monitoring | ½ session |
| 5 | Parent hub and notifications | ½ to 1 session, plus provider setup by Alex |
| 6 | Value calculator and guided tour | ½ session |
| 7 | Accessibility, performance, offline, runbook | ½ session |
| 8 | Lead capture | **Done** (PR #9) |

**Re-sequencing:**
- Keep the order 1 → 7, but start WS5's provider setup (R3, R4) now so it isn't on the critical path.
- In WS1, write the four spotlight students in full first, then the other 24.
- That makes the demo story presentable after WS3 and WS4, even if WS6 slips.
