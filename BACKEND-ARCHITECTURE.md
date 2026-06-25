# Suzuki Central Motors — Backend Architecture (Phase 2)

**Status:** Design / planning · **Date:** 2026-06-25
**Scope:** Turn the current static, content-baked frontend into a database-driven application with a secure admin dashboard, lead persistence, media management, and enterprise-grade operations.
**Audience:** Backend & DevOps engineers, tech lead.

> The Phase-1 frontend already isolates all content behind `src/data/index.ts` query helpers and all forms behind `/api/*` route handlers. This backend **slots in behind those same boundaries** — pages and components do not change. That is the core architectural bet.

---

## 1. Goals & non-goals

### Goals
- Replace static `src/data/*` modules with a **PostgreSQL** database via **Prisma**.
- Provide a **self-service admin dashboard** (`/admin/*`) so non-technical staff manage products, prices, team, news, jobs, media, settings — no developer needed.
- **Persist all lead submissions** (contact / inquiry / appointment) with status tracking + email notification.
- **Media uploads** to object storage with optimisation.
- Enterprise concerns: **RBAC, auth, rate limiting, audit logging, observability, backups, CI/CD, caching/ISR, horizontal scalability**.

### Non-goals (this phase)
- E-commerce / online payment / deposit booking.
- Customer-facing accounts / login.
- Live DMS / Pak Suzuki inventory sync.
- Multi-language (data model stays i18n-ready; UI is English).

---

## 2. Architecture overview

A single Next.js application serves the public site **and** the admin dashboard. There is no separate API service — **Route Handlers** (public, `fetch`-callable) and **Server Actions** (admin, form-bound) are the backend. State lives in PostgreSQL; media in object storage; transactional email via a provider.

```
                ┌────────────────────────────────────────────┐
   Visitors ───►│            Next.js 14 (App Router)          │
   Admins  ────►│                                             │
                │  (site) routes  ·  /admin routes            │
                │  Route Handlers ·  Server Actions           │
                │  middleware.ts (auth gate for /admin)       │
                │  lib: db · auth · rbac · rate-limit · mail   │
                └───┬───────────────┬──────────────┬──────────┘
                    │ Prisma        │ S3 SDK       │ SMTP/Resend
            ┌───────▼──────┐ ┌──────▼──────┐ ┌─────▼───────┐
            │ PostgreSQL   │ │ Object store│ │ Email        │
            │ (Neon/RDS)   │ │ (R2/S3)+CDN │ │ (Resend)     │
            └──────┬───────┘ └─────────────┘ └─────────────┘
                   │ read replica (optional)
            ┌──────▼───────┐   ┌──────────────┐   ┌─────────────┐
            │ Backups/PITR │   │ Redis/KV     │   │ Sentry/logs │
            │              │   │ (rate-limit, │   │ uptime      │
            │              │   │  cache, jobs)│   │             │
            └──────────────┘   └──────────────┘   └─────────────┘
```

### Layered design (inside the app)
| Layer | Responsibility | Lives in |
|-------|----------------|----------|
| **Presentation** | Pages, components (unchanged from Phase 1) | `src/app`, `src/components` |
| **Application / API** | Route Handlers + Server Actions; validation, authz, orchestration | `src/app/api`, `src/app/admin/**/actions.ts` |
| **Domain services** | Business logic, reusable operations (e.g. `productService`, `leadService`) | `src/server/services` |
| **Data access** | Prisma repositories; the **only** place Prisma is called | `src/server/repositories` |
| **Infrastructure** | db client, auth, rbac, mailer, storage, rate-limit, cache, logger | `src/server/lib` |

> Rule: pages/components call **services** (or the existing `src/data` facade, now backed by services) — never Prisma directly. Keeps the swap from Phase 1 clean and testable.

---

## 3. Technology stack

| Concern | Choice | Rationale |
|---------|--------|-----------|
| Runtime/framework | Next.js 14 (App Router), Node 20 | Already in use; SSR/ISR + Server Actions |
| Language | TypeScript (strict) | Type safety end-to-end |
| ORM | **Prisma** | Type-safe queries, migrations, great DX |
| Database | **PostgreSQL 15+** (Neon / Supabase / RDS) | Robust, hosted, read-replica capable |
| Auth | **JWT in httpOnly cookie** (`jose`) + `bcryptjs`; upgradeable to Auth.js | Lightweight, no vendor lock-in |
| Object storage | **Cloudflare R2 / AWS S3** + CDN | Durable media, stateless app servers |
| Cache / rate-limit / queue | **Redis** (Upstash) or Vercel KV | Rate limiting, hot-data cache, light job queue |
| Email | **Resend** (or SMTP via Nodemailer) | Transactional lead notifications |
| Validation | **Zod** | One schema → types + runtime validation, shared client/server |
| Background jobs | Upstash QStash / Vercel Cron / BullMQ | Email retries, CSV export, image post-processing |
| Observability | **Sentry** + structured logs + Better Stack uptime | Errors, traces, alerts |
| CI/CD | GitHub Actions → Vercel (or VPS + PM2) | Lint, typecheck, test, migrate, deploy |
| Testing | Vitest (unit/integration) + Playwright (e2e) | Already have Playwright for scraping/QA |

---

## 4. Modules

Each module = a domain area with its schema, repository, service, admin UI, and API/actions.

| # | Module | Public surface | Admin surface | Key entities |
|---|--------|----------------|---------------|--------------|
| M1 | **Auth & Users** | login/logout | user mgmt, roles, password change | `User`, `Session`(optional) |
| M2 | **Catalogue — Products** | `/products`, `/product/[slug]` | full CRUD, variants, features, images, reorder, publish | `Product`, `Variant`, `Feature`, `ProductImage` |
| M3 | **Categories** | category labels | CRUD, ordering | `Category` |
| M4 | **Team / Management** | `/management` | CRUD, grouping, reorder | `TeamMember` |
| M5 | **News** | `/news/[slug]` | CRUD, publish, schedule | `NewsPost` |
| M6 | **Careers / Jobs** | `/careers`, `/careers/[slug]` | CRUD, publish; view applications | `Job`, `JobApplication` |
| M7 | **Media / Albums** | `/media-center` | CRUD albums, upload photos, set cover | `Album`, `AlbumPhoto` |
| M8 | **Leads / Submissions** | `POST /api/{contact\|inquiry\|appointment}` | inbox, filter, status, detail, CSV export | `Submission` |
| M9 | **Settings** | header/footer/contact | edit site-wide settings | `Setting` (key/value) |
| M10 | **Media uploads** | — | upload → storage → URL | (storage, signed URLs) |
| M11 | **Audit & Ops** | — | audit log view (admin) | `AuditLog` |

---

## 5. Database schema

PostgreSQL via Prisma. IDs are `cuid()`. Money is **integer PKR** (no decimals). Timestamps `DateTime`. Soft-delete via `deletedAt` where data is business-critical (products, submissions).

### 5.1 ER overview

```
User ─┬─< AuditLog
      └─< Session (optional)

Category 1───N Product 1─┬─N Variant
                         ├─N Feature
                         └─N ProductImage

Album 1───N AlbumPhoto
TeamMember · NewsPost · Job 1───N JobApplication · Submission · Setting   (standalone)
```

### 5.2 Prisma schema (authoritative)

```prisma
// schema.prisma  (datasource: postgresql)

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  name         String
  passwordHash String
  role         Role      @default(EDITOR)
  isActive     Boolean   @default(true)
  lastLoginAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  auditLogs    AuditLog[]
}

enum Role { SUPER_ADMIN ADMIN EDITOR VIEWER }

model Category {
  id        String    @id @default(cuid())
  slug      String    @unique
  name      String
  glyph     String    @default("A")
  blurb     String?
  order     Int       @default(0)
  products  Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Product {
  id          String         @id @default(cuid())
  slug        String         @unique
  name        String
  categoryId  String
  category    Category       @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  tag         String?        // "Hatchback", "SUV", "Van"
  description String?
  startPrice  Int            @default(0)   // derived = min(variant price); cached
  brochureUrl String?
  featured    Boolean        @default(false)
  published   Boolean        @default(true)
  order       Int            @default(0)
  features    Feature[]
  variants    Variant[]
  images      ProductImage[]
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  deletedAt   DateTime?
  @@index([categoryId, published, order])
}

model Variant {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  name      String
  price     Int
  order     Int     @default(0)
}

model Feature {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  label     String
  order     Int     @default(0)
}

model ProductImage {
  id        String  @id @default(cuid())
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  url       String
  blurData  String? // base64 blur placeholder
  alt       String?
  order     Int     @default(0)
}

model TeamMember {
  id        String   @id @default(cuid())
  name      String
  title     String
  group     TeamGroup
  phone     String?
  photoUrl  String?
  order     Int      @default(0)
  published Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
enum TeamGroup { TOP_MANAGEMENT GENERAL_MANAGERS MANAGERS }

model NewsPost {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  excerpt     String?
  body        String?
  imageUrl    String?
  published   Boolean   @default(true)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  @@index([published, publishedAt])
}

model Job {
  id           String           @id @default(cuid())
  slug         String           @unique
  title        String
  location     String           @default("Rawalpindi")
  type         String           @default("Permanent")
  description  String?
  published    Boolean          @default(true)
  createdAt    DateTime         @default(now())
  updatedAt    DateTime         @updatedAt
  applications JobApplication[]
}

model JobApplication {
  id        String   @id @default(cuid())
  jobId     String
  job       Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  name      String
  email     String?
  phone     String?
  cvUrl     String?
  message   String?
  status    String   @default("new")
  createdAt DateTime @default(now())
}

model Album {
  id        String       @id @default(cuid())
  title     String
  coverUrl  String?
  order     Int          @default(0)
  published Boolean      @default(true)
  photos    AlbumPhoto[]
  createdAt DateTime     @default(now())
}

model AlbumPhoto {
  id      String @id @default(cuid())
  albumId String
  album   Album  @relation(fields: [albumId], references: [id], onDelete: Cascade)
  url     String
  alt     String?
  order   Int    @default(0)
}

model Submission {
  id        String           @id @default(cuid())
  kind      SubmissionKind
  name      String
  email     String?
  phone     String?
  message   String?
  payload   Json?            // kind-specific fields (cnic, ntn, product, vehicle, date…)
  status    SubmissionStatus @default(NEW)
  source    String?          // page / utm
  ipHash    String?          // hashed, for abuse — never raw IP
  createdAt DateTime         @default(now())
  handledAt DateTime?
  @@index([kind, status, createdAt])
}
enum SubmissionKind { CONTACT INQUIRY APPOINTMENT }
enum SubmissionStatus { NEW READ DONE ARCHIVED }

model Setting {
  key       String   @id          // siteName, address, uan, tel, fax, email, facebook…
  value     String
  updatedAt DateTime @updatedAt
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action    String   // "product.update", "submission.status", "auth.login"
  entity    String?  // "Product:cuid"
  meta      Json?
  ip        String?
  createdAt DateTime @default(now())
  @@index([entity, createdAt])
}
```

### 5.3 Indexing & integrity
- Unique: `User.email`, `Category.slug`, `Product.slug`, `NewsPost.slug`, `Job.slug`, `Setting.key`.
- Composite: `Product(categoryId, published, order)`, `Submission(kind, status, createdAt)`, `NewsPost(published, publishedAt)`.
- `onDelete: Cascade` on all product/album children; `Restrict` on `Product.category` (block deleting a category with products).
- `startPrice` is denormalised (= min variant price) and recomputed in the product service on variant writes.

---

## 6. API & Server-Action specification

Two patterns:
1. **Route Handlers** (`src/app/api/*`) — public form intake + auth; JSON, `fetch`-callable.
2. **Server Actions** (`src/app/admin/**/actions.ts`) — authenticated admin mutations; form-bound, progressive-enhancement.

**Shared contract:** `{ ok: true, data? }` or `{ error: string, fields?: Record<string,string> }`. HTTP: `200/201` ok · `400` validation · `401` unauth · `403` forbidden · `404` not found · `409` conflict · `429` rate-limited · `500` server. All inputs validated with **Zod** at the boundary. No stack traces to clients.

### 6.1 Public Route Handlers
| Method | Path | Auth | Body (Zod) | Effect |
|--------|------|------|-----------|--------|
| POST | `/api/contact` | none, rate-limited | firstName*, lastName*, email*, phone*, method, intent, message | create `Submission{CONTACT}` + email |
| POST | `/api/inquiry` | none, rate-limited | name*, phone*, product*, email, cnic, ntn, address, message | create `Submission{INQUIRY}` + email |
| POST | `/api/appointment` | none, rate-limited | name*, phone*, model*, email, registration, date, serviceType, notes | create `Submission{APPOINTMENT}` + email |
| POST | `/api/careers/apply` | none, rate-limited | jobSlug*, name*, phone, email, cvUrl, message | create `JobApplication` |

> Persistence must succeed even if email fails (email is fire-and-forget with retry). Honeypot + per-IP rate limit on all four.

### 6.2 Auth Route Handlers
| Method | Path | Effect |
|--------|------|--------|
| POST | `/api/auth/login` | verify bcrypt → set signed `cm_session` httpOnly cookie (7d) → `{ok}`; generic error on fail (no enumeration) |
| POST | `/api/auth/logout` | clear cookie |

### 6.3 Admin Server Actions (auth + RBAC enforced)
Every action: `requireSession()` → `requireRole(...)` → Zod validate → service call → `revalidatePath(...)` → audit log → typed result.

| Module | Actions |
|--------|---------|
| Products | `createProduct`, `updateProduct`, `deleteProduct` (soft), `setVariants`, `setFeatures`, `setImages` (reorder), `toggleFlag(published\|featured)` |
| Categories | `createCategory`, `updateCategory`, `deleteCategory` (blocked if products) |
| Team | `createMember`, `updateMember`, `deleteMember`, `reorderTeam` |
| News | `createNews`, `updateNews`, `deleteNews`, `togglePublish` |
| Jobs | `createJob`, `updateJob`, `deleteJob`, `togglePublish`; `listApplications`, `setApplicationStatus` |
| Albums | `createAlbum`, `updateAlbum`, `deleteAlbum`, `setPhotos`, `setCover` |
| Submissions | `setStatus(NEW\|READ\|DONE\|ARCHIVED)`, `exportCsv(filter)`, `deleteSubmission` (SUPER_ADMIN only) |
| Settings | `updateSettings(map)`, `changePassword` |
| Uploads | `getUploadUrl(type, contentType)` → signed PUT URL; client uploads direct to storage |
| Users | `createUser`, `updateUser`, `deactivateUser`, `setRole` (SUPER_ADMIN) |

### 6.4 Read path (public pages)
Pages keep calling `src/data/index.ts` helpers (`getProducts`, `getProductBySlug`, …). Those now delegate to **services → repositories → Prisma**, with caching (§9). **Zero page/component changes** vs Phase 1.

---

## 7. Authentication & authorization

- **Login:** `authenticate(email, password)` → bcrypt compare (cost ≥ 12) → session payload `{ sub, role }`.
- **Session:** JWT (HS256, `jose`), httpOnly + sameSite=lax + `secure` in prod, 7-day expiry; signed with `AUTH_SECRET` (≥ 48 chars).
- **Gate:** `src/middleware.ts` runs on `/admin/:path*`; verifies cookie (edge-safe, no DB) → redirect unauth to `/admin/login?from=…`.
- **Defence in depth:** every Server Action re-reads `getSession()` and checks role — never trust the middleware alone.

### RBAC matrix
| Capability | SUPER_ADMIN | ADMIN | EDITOR | VIEWER |
|------------|:----------:|:-----:|:------:|:------:|
| View admin / submissions | ✓ | ✓ | ✓ | ✓ |
| Edit content (products, news…) | ✓ | ✓ | ✓ | — |
| Manage settings | ✓ | ✓ | — | — |
| Manage users & roles | ✓ | — | — | — |
| Delete (hard) / export PII | ✓ | — | — | — |

Hardening backlog: account lockout / exponential backoff after N failed logins, optional 2FA (TOTP) for ADMIN+, password-reset via email.

---

## 8. Security (enterprise)

| Area | Control |
|------|---------|
| Passwords | bcrypt cost ≥ 12; never logged |
| Sessions | signed httpOnly/secure/sameSite cookies; rotate `AUTH_SECRET` on suspicion |
| Input | Zod validation + coercion at every boundary; Prisma parameterised queries (no raw SQL) |
| XSS | React escaping; sanitise any rich text (DOMPurify) server-side before store/render |
| Uploads | validate MIME (jpg/png/webp/pdf) + size (≤ 5 MB img / ≤ 15 MB pdf); store in object storage, random keys, never executable paths |
| Rate limiting | per-IP on auth + all public forms (e.g. 5/min) via Redis sliding window; honeypot field |
| PII | inquiry collects **CNIC/NTN** → restrict to ADMIN+, encrypt at rest (DB/provider), never log full payloads, hash IPs, data-minimise (make CNIC/NTN optional) |
| Headers | HSTS, CSP (start report-only), X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy (already set in `next.config.mjs`) |
| Secrets | env only / host secret manager; `.env` git-ignored; separate per environment |
| Dependencies | `npm audit` + Dependabot in CI; pinned versions |
| Audit | every admin mutation → `AuditLog` (who/what/when/ip) |
| OWASP Top-10 | covered: access control (RBAC + middleware), crypto (TLS/bcrypt), injection (Prisma/Zod), misconfig (headers, no default creds), auth failures (rate-limit, generic errors), logging (Sentry + audit) |

> **Go-live blocker:** change the seeded admin password; strong unique `AUTH_SECRET`; CSP enforced; backups verified.

---

## 9. Caching, revalidation & rendering

- **Public pages:** ISR / static with **on-demand revalidation**. Admin mutations call `revalidatePath()` / `revalidateTag()` for affected routes (e.g. product save → `/`, `/products`, `/product/[slug]`).
- **Tag map:** `products`, `categories`, `team`, `news`, `jobs`, `albums`, `settings` → each mutation revalidates its tag(s).
- **Hot reads** (settings, featured products) cached in Redis with short TTL + tag-bust on write; or rely on Next data cache.
- **Images:** served from CDN; `next/image` optimisation; immutable cache headers (already configured).
- **DB:** connection pooling (PgBouncer / provider pooler) for serverless; optional read replica for heavy read traffic.

---

## 10. Media & file handling

1. Admin requests a **signed upload URL** (`getUploadUrl`) — short-lived, scoped by type/size.
2. Browser uploads **directly to object storage** (R2/S3) — app server never proxies bytes.
3. A post-process job (queue) generates **optimised variants + blur placeholder**; stores final URLs on the entity.
4. Public delivery via **CDN**; originals private, derivatives public.
- Brochures (PDF) stored the same way; linked via `Product.brochureUrl`.
- `next.config.mjs` `images.remotePatterns` whitelists the CDN domain.

---

## 11. Email & notifications

- **Provider:** Resend (or SMTP). `EMAIL_FROM`, `EMAIL_TO` (dealership inbox) from env.
- On each lead → enqueue a notification job (fire-and-forget). **Failure never fails the request** (lead is already persisted). Retry with backoff via queue.
- Templates: lead notification (to dealership), optional auto-acknowledgement (to customer).
- Future: WhatsApp lead forwarding, daily digest of new submissions.

---

## 12. Background jobs

| Job | Trigger | Purpose |
|-----|---------|---------|
| `notifyLead` | on submission | email dealership (with retry) |
| `processImage` | on upload | resize + blur + store derivatives |
| `exportSubmissionsCsv` | admin action | large CSV off-request |
| `submissionRetention` | cron (weekly) | archive/purge old leads per policy |
| `dbBackupVerify` | cron (daily) | sanity-check latest backup |

Runner: Upstash QStash / Vercel Cron (serverless) or BullMQ + Redis (VPS).

---

## 13. Observability

- **Errors:** Sentry (client + server), release-tagged, **no PII** in payloads.
- **Logs:** structured JSON (pino); request id; never log secrets or full lead payloads.
- **Metrics:** request latency, DB query time, queue depth, email success rate.
- **Uptime:** external check on `/` and `/api/health` (returns DB + storage status).
- **Alerts:** error-rate spike, downtime, failed migrations, backup failure.
- **Audit log:** admin-visible, immutable, for accountability.

---

## 14. CI/CD & environments

| Env | Branch | DB | Notes |
|-----|--------|----|----|
| Local | feature/* | local Postgres (Docker) or Neon branch | `prisma migrate dev` |
| Preview | PR | ephemeral Neon branch | per-PR review |
| Staging | main | staging Postgres | UAT |
| Production | release tag | prod Postgres | manual approval gate |

**Pipeline (GitHub Actions):**
```
PR:      install → lint → typecheck → unit+integration tests → build
main:    above → prisma migrate deploy (staging) → deploy staging
release: prisma migrate deploy (prod, gated) → deploy prod → smoke test
```
- Migrations authored with `prisma migrate dev`, reviewed as SQL in PR, applied with `prisma migrate deploy`. Never `db push --force-reset` on shared envs.
- Secrets in host secret manager (Vercel env / VPS `.env` restricted).

---

## 15. Scalability & performance

- **Stateless app servers** → scale horizontally behind the host; sessions are stateless JWT cookies.
- **DB:** pooled connections; read replica for read-heavy growth; composite indexes on hot queries.
- **Cache:** Redis/KV for settings, featured lists, rate-limit counters.
- **Targets (carry over):** Lighthouse ≥ 90, LCP ≤ 2.5s, CLS ≤ 0.1; API p95 < 200 ms for reads.
- Designed for **hundreds of products and tens of thousands of submissions** without redesign.

---

## 16. Migration: static → database

1. Add `prisma/` + schema; provision Postgres.
2. **Seed script** (`prisma/seed.ts`) loads the current `src/data/*` content (6 products + variants + features + images/blur, settings, team, news, jobs, albums) — the Phase-1 data **is** the initial dataset.
3. Re-point `src/data/index.ts` helpers from static arrays → services/repositories. **Pages unchanged.**
4. Replace the stub `/api/{contact|inquiry|appointment}` handlers with real persistence + email (the client contract is identical → no frontend change).
5. Migrate product images/brochures from `/public/images` into object storage; update URLs.
6. Add `/admin/*` (auth, middleware, dashboard, CRUD modules).
7. Verify on staging → UAT → cut over.

---

## 17. Backup & disaster recovery

- **DB:** automated daily snapshots + **PITR**; ≥ 7-day retention; periodic restore test.
- **Storage:** object versioning / lifecycle backup for media.
- **Pre-migration safety:** export `Submission` to CSV before any risky migration.
- **Rollback:** redeploy previous release tag; reverse migration only if schema changed.
- **RPO ≤ 24h, RTO ≤ 4h** target.

---

## 18. Testing strategy

| Level | What | Tool |
|-------|------|------|
| Unit | services, validators (Zod), pricing/derivation, auth helpers | Vitest |
| Integration | Route Handlers + Server Actions against a test DB | Vitest + Prisma test schema |
| E2E | login, each form persists, product CRUD, submission status, settings drive site | Playwright |
| Security | authz matrix, rate-limit, upload validation, headers | scripted + checklist |
| Migration | seed + migrate on a throwaway DB in CI | CI job |

Exit gate: zero open Critical/High; RBAC matrix enforced; all Must-have flows pass.

---

## 19. Proposed folder structure (additions)

```
prisma/
  schema.prisma
  seed.ts
  migrations/
src/
  middleware.ts                 # admin auth gate
  server/
    lib/        db.ts · auth.ts · rbac.ts · mailer.ts · storage.ts · rateLimit.ts · cache.ts · logger.ts
    repositories/  product.repo.ts · submission.repo.ts · …   # only place Prisma is called
    services/      productService.ts · leadService.ts · authService.ts · settingsService.ts · …
    validators/    product.schema.ts · lead.schema.ts · …     # Zod
  data/index.ts                 # facade → services (signatures unchanged)
  app/
    api/ contact · inquiry · appointment · careers/apply · auth/login · auth/logout · health
    admin/
      layout.tsx · login/ · page.tsx (dashboard)
      products/ (list, new, edit/[id], actions.ts)
      categories/ team/ news/ jobs/ albums/ submissions/ settings/ users/
```

---

## 20. Delivery plan (phases)

| Stage | Deliverable | Est |
|-------|-------------|-----|
| B0 | Prisma + Postgres + schema + seed from current data; `src/data` → services | 3 pd |
| B1 | Auth (JWT cookie, bcrypt, middleware) + RBAC + admin shell | 3 pd |
| B2 | Products + Categories admin (CRUD, variants, features, images, reorder) | 4 pd |
| B3 | Team / News / Jobs / Albums admin | 4 pd |
| B4 | Submissions inbox + lead persistence + email + rate-limit/honeypot | 3 pd |
| B5 | Settings + Users + Uploads (signed URLs, optimisation) | 3 pd |
| B6 | Caching/ISR revalidation, audit log, observability, health check | 2 pd |
| B7 | Hardening, security review, backups, CI/CD, UAT, launch | 3 pd |
| **Total** | | **~25 pd** |

---

## 21. Open decisions (need sign-off)

1. **Host:** Vercel + Neon/R2 (managed, recommended) vs VPS + self-managed Postgres/PM2.
2. **Rich text** for news body: Markdown vs sanitised HTML (TipTap) editor.
3. **PII policy:** make CNIC/NTN optional; define submission retention period.
4. **2FA / SSO** for admins now or backlog.
5. **Job applications + CV upload** in scope now (M6) or later.

> All of the above is additive to Phase 1 — nothing built in the current frontend is discarded. The static site keeps working until each module is switched to the database behind its existing query helper / API boundary.
