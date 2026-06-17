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
- `/admin` — Internal dashboard (auth-protected)

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Hosting | Cloudflare Pages via `@cloudflare/next-on-pages` |
| Database | Cloudflare D1 (SQLite) |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Styling | Tailwind CSS v4 with custom design tokens |
| Font | Lexend (Google Fonts) |

## Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
```

The app runs at `http://localhost:3000`. The AI Program Builder requires an `ANTHROPIC_API_KEY` environment variable (see below).

### Environment Variables

Create a `.env.local` file:

```env
ANTHROPIC_API_KEY=sk-ant-...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
```

> **Never commit `.env.local` or any file containing secrets.**

## Cloudflare Deployment

### 1. Create the D1 database

```bash
npx wrangler d1 create empower-db
```

Copy the returned `database_id` into `wrangler.toml`.

### 2. Run the migration

```bash
npx wrangler d1 migrations apply empower-db
```

### 3. Set secrets

```bash
npx wrangler pages secret put ANTHROPIC_API_KEY
npx wrangler pages secret put ADMIN_USERNAME
npx wrangler pages secret put ADMIN_PASSWORD
```

### 4. Deploy

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

## Admin Dashboard

The `/admin` route is protected by session-based auth. Credentials are set via environment variables (`ADMIN_USERNAME`, `ADMIN_PASSWORD`). **Do not hardcode credentials.**

Features:
- Client list with status
- View linked intakes and generated plans
- Copy/download plans as markdown

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
- Admin auth via session cookies (credentials from env vars, never committed)
- No individual student data (PII) is collected — school-level aggregate only
