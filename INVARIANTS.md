# Invariants

Rules every change to the demo environment (`/demo`) must keep. Each demo PR states which invariants it touched and how it verified them.

1. **No real people.** The demo contains no real student, parent or staff data. All demo data comes from committed fixtures (`src/demo/fixtures/`), and every name is fictional: a given name plus a last initial. Parent contacts use 555-01xx phone numbers and example.com addresses. Checked by `tests/unit/fixtures.test.ts`.
2. **No D1, and nothing typed leaves the browser.** Demo screens never read from or write to D1, and never send typed user input to any external service. In-session edits live in `sessionStorage` only. There are two exceptions:
   - The demo notification sender (Workstream 5) sends only fixture-generated content, and only to allow-listed recipients.
   - The optional AI goal draft, if it is ever approved, sends only fixture context.
3. **Banner and noindex.** Every demo page shows the "fictional data" banner and is noindex: robots metadata on the page, an `X-Robots-Tag` header and `Disallow: /demo` in `robots.txt`.
4. **No pricing.** No Empower pricing, rates or fees exist anywhere in the site, the fixtures or the bundle. The value calculator shows only the school's own figures.
5. **The existing site is unchanged.** The existing public routes, the Program Builder, the contact form and `/admin` behave exactly as before the demo work. Checked by `tests/e2e/smoke.spec.ts` on every PR.
6. **No database changes.** Demo work leaves the existing D1 tables and migrations untouched.
7. **One child for parents.** The Parent role can only ever see one child (`PARENT_CHILD_ID`), whatever the URL. The demo enforces this in the client, which is acceptable only because all demo data is fictional; the production product must enforce it on the server. Checked by `tests/unit/views.test.ts` and `tests/e2e/demo.spec.ts`.
8. **The client school is a name only.** The client school appears only as the configured client name in `src/demo/config/school.ts`. No school logo, photos, staff names or student information are used without written permission from the school. Checked by `tests/unit/whitelabel.test.ts`.
9. **Ontario IEP template.** IEP screens follow the section order of the Ontario IEP template. The 30 school day completion rule, the transition plan required at 14 and the student signature required at 16 are enforced by tested code.
10. **Allow-listed sends.** Real SMS and email from the demo go only to recipients on `DEMO_NOTIFY_ALLOWLIST`, and the server enforces this.
11. **Capacity.** The program cohort never exceeds the configured capacity (20 by default).
12. **Secrets stay server-side.** `ANTHROPIC_API_KEY`, the `ADMIN_` credentials, `DEMO_ACCESS_CODE`, `DEMO_NOTIFY_ALLOWLIST` and the SMS and email provider keys are server-side only and never committed.
