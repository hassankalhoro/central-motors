# Suzuki Central Motors — Website 
 
Public website for Suzuki Central Motors (Authorised 3S Suzuki Dealer, Rawalpindi).
Static public site backed by a lightweight backend: form submissions persist to a
database and media is stored on a CDN. No admin panel yet.

## Stack
- **Next.js 14** (App Router) · **TypeScript** (strict) · **Tailwind CSS**
- Fonts via `next/font`: **Space Grotesk** (display) + **Hanken Grotesk** (body)
- Brand tokens (refined from the live site): red `#E11622` · navy `#06245C` · blue `#1E55A8`
- **Database:** PostgreSQL (Neon, free tier) via **Prisma**
- **Media storage:** Cloudinary (free tier) — image/file upload + optimization
- **Email:** Nodemailer over SMTP (Titan)

## Getting started
```bash
npm install
cp .env.example .env          # then fill in DATABASE_URL, DIRECT_URL, CLOUDINARY_URL, SMTP_*
npx prisma migrate deploy     # create DB tables (or `npm run db:migrate`)
npm run dev                   # http://localhost:3000
```

## Scripts
| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint |
| `npm run db:migrate` | Apply database migrations (`prisma migrate deploy`) |
| `npm run db:studio` / `npm run leads` | Open Prisma Studio to browse submissions |

## Structure
```
prisma/
  schema.prisma  # DB models (Submission) + datasource
  migrations/    # generated SQL migrations
src/
  app/         # routes, layout, globals.css; api/ route handlers
  components/  # UI + site components
  data/        # static typed content (products, team, settings…)
  lib/         # helpers + backend: db.ts (Prisma), cloudinary.ts, email.ts, leads.ts
public/        # images, brochures, static assets
```

---

## Backend

The site is mostly static content, plus a small backend for the three public lead
forms (**contact**, **inquiry**, **appointment**) and media storage.

- **Lead persistence** — every form POST is saved to the DB *before* email is sent,
  so a submission is never lost to a mail outage. Shared handler: `src/lib/leads.ts`.
  Route handlers: `src/app/api/{contact,inquiry,appointment}/route.ts`.
- **Database** — PostgreSQL via Prisma. Client singleton: `src/lib/db.ts`.
  Schema/model: `prisma/schema.prisma` (`Submission` table).
- **Media** — Cloudinary upload + optimization helpers: `src/lib/cloudinary.ts`
  (`uploadImage`, `optimizedUrl`, `deleteImage`). Uploads are server-side only so the
  API secret never reaches the browser; store the returned CDN URL in the DB.
- **Email** — Nodemailer over SMTP: `src/lib/email.ts`.

### Environment variables
Copy `.env.example` → `.env` and fill in:

| Var | Used for | Notes |
|-----|----------|-------|
| `DATABASE_URL` | App runtime DB connection | Neon **pooled** URL (host contains `-pooler`) |
| `DIRECT_URL` | `prisma migrate` | Neon **direct** URL (no `-pooler`) |
| `CLOUDINARY_URL` | Media storage | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` |
| `SMTP_*`, `MAIL_FROM`, `MAIL_TO` | Email notifications | see `.env.example` |
| `NEXT_PUBLIC_SITE_URL` | SEO/OG metadata | canonical site URL |

> `.env` is git-ignored. Never commit real secrets. When deploying, set the same vars
> in your host's environment settings.

### Browsing submissions
`npm run leads` opens Prisma Studio — a local UI to view/filter/update saved leads.

---

## Swapping providers

The backend is isolated behind two small modules, so changing provider is a localized edit.

### Change the database (e.g. Neon → Supabase / Postgres elsewhere)
Both are PostgreSQL, so this is just configuration:
1. Update `DATABASE_URL` (+ `DIRECT_URL`) in `.env` to the new connection strings.
2. Run `npx prisma migrate deploy` against the new DB to create the tables.
3. (Optional) Copy existing rows over with a SQL dump/restore.
No code changes — `src/lib/db.ts` and queries stay the same.

**Switching to a non-Postgres engine** (MySQL, SQLite, etc.):
1. Change `datasource db { provider = "..." }` in `prisma/schema.prisma`
   (`postgresql` → `mysql` / `sqlite`), and adjust the URL.
2. For SQLite, change `payload Json` in the `Submission` model to `payload String`
   (SQLite has no JSON type) and store JSON via `JSON.stringify` in `src/lib/leads.ts`.
3. Re-create the migration: `npx prisma migrate dev --name init`.

**Switching to a non-Prisma store** (e.g. Firebase/Firestore — NoSQL):
- Rewrite `src/lib/db.ts` + the `saveSubmission()` call in `src/lib/leads.ts` against the
  new SDK, and remove Prisma. This is a larger change (different data model).

### Change media storage (e.g. Cloudinary → Cloudflare R2 / S3 / Supabase Storage)
All upload logic lives in **`src/lib/cloudinary.ts`** — that's the only file to touch.
1. Install the new SDK (e.g. `@aws-sdk/client-s3` for R2/S3) and remove `cloudinary`.
2. Reimplement the same three exports so callers don't change:
   `uploadImage(source) → { url, publicId, ... }`, `deleteImage(publicId)`,
   `optimizedUrl(publicId, opts)`.
3. Swap the `CLOUDINARY_URL` env var for the new provider's credentials
   (update `.env` and `.env.example`).
> Keeping the same function signatures means no other file needs editing.

---

## Status
✅ Public site + lead persistence (DB) + media storage (CDN) + email wired up.
⬜ Next: `/admin` panel (auth + content/lead management + image uploads via UI).
