# Empower — Special Education Program Platform

A special education consultancy website and AI Program Builder for Ontario schools and school boards. Built with Next.js (App Router), Tailwind CSS, Cloudflare Pages, D1, and the Anthropic Claude API.

## Pages

- `/` — Home (hero, problem/solution, boards served, how-it-works, CTA)
- `/how-it-works` — Four-phase engagement process
- `/services` — Service offerings
- `/program-builder` — **AI Program Builder** (intake form → Claude-generated framework)
- `/about` — Mission, team, credibility
- `/contact` — Lead capture form
- `/privacy` — Privacy policy
- `/login` — Google sign-in for staff and families
- `/portal` — Family & educator portal (see below)
- `/portal/backups` — Database backups (admins only)
- `/admin` — Leads & program-builder clients. Sign in with the `ADMIN_USERNAME`/`ADMIN_PASSWORD` login or as a portal admin via Google

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Hosting | Cloudflare Pages via `@cloudflare/next-on-pages` |
| Database | Cloudflare D1 (SQLite) |
| AI | Anthropic Claude API via `@anthropic-ai/sdk` (`claude-sonnet-4-6`) |
| Styling | Tailwind CSS v4 with custom design tokens |
| Font | Lexend (Google Fonts) |

## Local Development

```bash
# Install dependencies
npm install

# Run dev server (no database: public site, demo, and /admin with sample data)
npm run dev

# Run dev server with a local D1 database (needed for /portal)
npm run dev:d1
```

The app runs at `http://localhost:3000`. The AI Program Builder requires an `ANTHROPIC_API_KEY` environment variable (see below).

### Environment Variables

Create a `.dev.vars` file (read by the local Cloudflare platform; it is git-ignored):

```env
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=...
ADMIN_EMAILS=you@yourdomain.com
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

Before the first `npm run dev:d1`, create the local database:

```bash
npx wrangler d1 migrations apply empower-db --local
```

In `npm run dev:d1`, the login page also shows **dev sign-in links** (admin / teacher / parent) so you can try every role without Google. That route returns 404 in production builds.

> **Never commit `.env.local` or any file containing secrets.**

## Cloudflare Deployment

### 1. Create the D1 database

```bash
npx wrangler d1 create empower-db
```

Copy the returned `database_id` into `wrangler.toml`.

### 2. Run the migration

```bash
npx wrangler d1 migrations apply empower-db --remote
```

### 3. Set secrets

```bash
npx wrangler pages secret put ANTHROPIC_API_KEY
npx wrangler pages secret put GOOGLE_CLIENT_ID
npx wrangler pages secret put GOOGLE_CLIENT_SECRET
npx wrangler pages secret put ADMIN_EMAILS
npx wrangler pages secret put APP_URL   # e.g. https://empower.ca (optional; defaults to the request origin)
```

### 4. Deploy

Merges to `base` deploy automatically via `.github/workflows/deploy.yml` (lint, type-check, build, D1 migrations, `wrangler pages deploy --branch=base`). It needs the `CLOUDFLARE_API_TOKEN` (Pages + D1 edit) and `CLOUDFLARE_ACCOUNT_ID` repo secrets. Pull requests run the same checks without deploying.

Manual deploy:

```bash
npm run build
npx @cloudflare/next-on-pages
npx wrangler pages deploy .vercel/output/static
```

The site will be available at `empower.pages.dev`. Attach `empower.ca` via Cloudflare DNS later.

## Database Schema

See `migrations/0001_initial.sql` for the full schema. Tables:

- `clients` — Organizations that have used the Program Builder
- `intakes` — School profile submissions
- `program_plans` — AI-generated program frameworks
- `leads` — Contact form submissions
- `users`, `sessions` — Portal accounts (invite-only) and sign-in sessions
- `schools`, `milestones` — Partner schools and program rollout milestones
- `students`, `student_staff`, `guardians` — Student profiles and who can see them
- `updates`, `update_comments` — Progress updates and family/staff replies
- `audit_log` — Sign-ins and every create/change/delete in the portal

## Family & Educator Portal

Sign-in is **Google only** and **invite-only**: an email can sign in only after an admin or teacher has added it
(or it is listed in `ADMIN_EMAILS`, which bootstraps the first admins).

| Role | Can do |
|---|---|
| **Admin** | Everything: manage team & roles, schools and program milestones, all students, assign teachers, view leads (`/admin`) |
| **Teacher** | Add students (auto-assigned), edit their students, post updates, link families, view school milestones |
| **Family** | See their own child's profile, goals and family-visible updates, and reply |

- Updates can be **Family + staff** or **Staff only**. Families never see staff-only notes.
- Removing a person disables their access and signs them out immediately; their past posts stay.
- Student profiles hold first name + last initial, grade, school and goals only. Don't enter diagnoses,
  health details, OEN numbers, birthdates or addresses.

### Setting up Google sign-in

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create an **OAuth client ID** of type *Web application*.
2. Configure the **OAuth consent screen** (app name "Empower", support email, logo, privacy policy URL). Publish it to *In production* so any Google account can sign in.
3. Add **Authorized redirect URIs**, one per domain you use:
   - `https://YOUR-PRODUCTION-DOMAIN/api/auth/google/callback`
   - `https://empower-c9l.pages.dev/api/auth/google/callback`
   - `http://localhost:3000/api/auth/google/callback` (local dev)
4. Save the client ID and secret as the `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` secrets, set `ADMIN_EMAILS`, and redeploy.

## Backups

**From the admin portal:** `/portal/backups` (admins only) shows what's in the database and has a **Download backup** button. It returns a data-only `.sql` file of every table except sign-in sessions. Every download is recorded in the audit log and listed on that page.

**Nightly:** `.github/workflows/backup.yml` runs a full `wrangler d1 export` every night (07:17 UTC) and on demand (**Actions → Nightly database backup → Run workflow**). This repository is public, so each export is **encrypted with AES-256** before it is stored as a workflow artifact for 30 days. The job refuses to run without a passphrase.

| Setting (GitHub → Settings → Secrets and variables → Actions) | Purpose |
|---|---|
| `BACKUP_PASSPHRASE` secret | **Required.** Encryption passphrase. Keep a copy somewhere safe: backups can't be opened without it. |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` secrets | Already used by the deploy job. |
| `R2_BUCKET` variable + `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY` secrets | Optional. Also uploads each encrypted backup to R2 (enable R2 in the Cloudflare dashboard first). `R2_ENDPOINT` is `https://<account-id>.r2.cloudflarestorage.com`. |

Decrypt a nightly backup:

```bash
gpg --decrypt empower-backup-YYYYMMDD-HHMM.sql.gz.gpg | gunzip > backup.sql
```

**Restore** (test on a new database first; restoring overwrites data):

```bash
# Nightly export (schema + data) into a fresh, empty database:
npx wrangler d1 execute <new-db-name> --remote --file=backup.sql

# Portal download (data only) into a database that already has the migrations applied:
npx wrangler d1 execute empower-db --remote --file=empower-backup-YYYYMMDD-HHMM.sql
```

## Design System

- **Primary:** `#4B2E91` (deep violet)
- **Accent:** `#FF8A3D` (warm amber)
- **Care:** `#0E9C92` (teal)
- **Font:** Lexend, 18px base, 1.6 line-height
- **Accessibility:** WCAG 2.1 AA, keyboard nav, focus states, semantic HTML, `prefers-reduced-motion`

## Security Notes

- Anthropic API key is server-side only — never exposed to the client
- D1 queries run in server Functions only
- Forms include consent checkbox + link to privacy policy
- AI Program Builder is rate-limited per IP and per email
- Google OAuth (authorization code + PKCE); sessions are random tokens stored hashed in D1, httpOnly cookies
- Every portal page and server action re-checks the user's role and their link to the student
- The public Program Builder collects school-level aggregates only; the portal stores minimal student profiles (see above)
