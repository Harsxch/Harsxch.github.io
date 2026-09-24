# Technical Handover & Production Deployment Guide

**Application:** Influencer Partnership & Sales Management Platform
**Repository:** `Harsxch/Harsxch.github.io` (`main`, merged from branch `claude/influencer-sales-platform-q6bot0`)
**Audit date:** 2026-09-24 (third revision — see the note below)
**Audited by:** direct inspection of the codebase (package files, schema, routes, auth, business logic) — not a description from memory. Anything not verifiable in code is explicitly marked **REQUIRES TECH TEAM CONFIRMATION**.

> Read this if you are the engineer or team taking this application from "built by Claude Code" to "running in production." It documents what exists today, what's mock vs. real, what's missing, and exactly what you need to do/provide to go live.

**What changed across the three revisions of this document:**
1. Original build: 5 roles, ~20 nav pages across admin and influencer.
2. Simplified to **2 roles (Admin, Influencer)** with a 3-item admin nav (Dashboard, Influencers, Sales Tracking) and a 1-item influencer nav (Sales Tracking) — everything else unlinked from nav but still present in the codebase.
3. **This revision:** the unlinked pages with no dependents were **actually deleted** (not just hidden) — Admin Earnings/Payouts/Audit Logs, and Influencer Campaigns/Coupons/Courses/Earnings/Goals/Links/Notifications/Payouts/Profile/Sales. A smaller set — Courses, Coupons, Tracking Links, Commercial Agreements, Campaigns (admin-only, unlisted) — was deliberately **kept**, because Sales Tracking's real data and filters depend on it. See §2 for the exact current breakdown.

Every section below reflects the codebase as of revision 3 — not the original broader build, and not the "everything hidden, nothing deleted" middle revision either.

---

## 1. Executive Summary

This is a deliberately lightweight web platform for running an influencer/creator partnership program for an online course business. It is **not** a general CRM — it does exactly two jobs: let an Admin manage influencers, and give both Admin and Influencer visibility into sales through one shared "Sales Tracking" concept (date range + UTM/coupon/course filters + summary and breakdown views).

**Who uses it — exactly two roles, nothing else:**
- **Admin** — manages influencers (add/edit/activate/deactivate) and sees Sales Tracking across every influencer, with a breakdown by influencer, course, UTM content, and coupon.
- **Influencer** — sees only their own Sales Tracking: the same date/UTM/coupon/course filters, scoped to their own sales only, enforced server-side.

A small slice of the earlier, broader build still exists as **unlisted admin back-office pages** (Courses, Coupons, Tracking Links, Commercial Agreements, Campaigns) — not because they're "extra," but because Sales Tracking's real data and filters read from them, and deleting them would have frozen the admin view at today's data with no way to add a new course, coupon, or influencer deal. Everything else from the earlier build (Earnings approval, Payouts, Audit Logs, Goals, Notifications, self-serve Tracking Links, and the influencer's old standalone My Sales/Courses/Coupons/Profile pages) has been **deleted outright** — not hidden, gone. See §2 for the exact breakdown of what's nav-visible, what's kept-but-unlisted, and what's deleted.

**Current scope:** A working, fully-implemented core product on top of **mock/manually-entered data** — there is no live payment gateway, LMS, or Metabase connection wired in yet (see §10). The financial calculation engine, RBAC, and data-isolation logic are real and production-grade in design; what's missing before go-live is almost entirely **integration** (real data sources, hosting, CI/CD, secrets) rather than application logic.

**Development status:** Feature-complete for the current simplified scope. No automated test suite exists beyond one manual smoke script (§23). No deployment pipeline exists yet (§15–16).

**Before production launch, the tech team must:**
1. Stand up a real Postgres database and hosting environment (§15–16).
2. Decide on and build the real Sales Tracking data source (currently mock data, §10).
3. Wire up whatever order-ingestion path (API/webhook/CSV) matches the real course platform — only manual entry exists today (§22 Known Limitations).
4. Rotate/generate all production secrets (§8) — do not reuse anything found in this environment's `.env`.
5. Add monitoring, backups, and CI (§16, §24, §25) — none exist today.

---

## 2. Product Overview

**Current nav-visible scope is deliberately narrow: two things only.**

| Nav | Items |
|---|---|
| Admin (3 items) | Dashboard, **Influencers**, **Sales Tracking** |
| Influencer (1 item) | **Sales Tracking** |

There are now three categories, not two — nav-visible, kept-but-unlisted (deliberately, because Sales Tracking depends on it), and actually deleted. The table marks each module accordingly.

| Module | Status | Notes |
|---|---|---|
| Influencer management (CRUD, profile, manager assignment) | **IMPLEMENTED — NAV-VISIBLE** | Admin-side pages + Server Actions; one of the 2 core features |
| Sales Tracking — Influencer (UTM/coupon self-serve filtering) | **PLACEHOLDER / MOCK — NAV-VISIBLE** | Fully built UI + API contract; data is synthetically generated, not from a real DB table or Metabase (§10). The influencer's only nav item. |
| Sales Tracking — Admin (all-influencer view with breakdowns) | **IMPLEMENTED — NAV-VISIBLE** | Real DB-backed (not mock). Extended from the original admin Sales page: added an Influencer filter and by-influencer/course/UTM-content/coupon breakdowns (§11.2) |
| Influencer dashboard (standalone, own performance) | **DELETED** | Folded into the Sales Tracking page's own summary cards; the old route now redirects to Sales Tracking |
| Courses (admin CRUD) | **IMPLEMENTED — KEPT, UNLISTED** | Load-bearing: "Record Sale" needs a course to exist, and it's Sales Tracking's course filter/breakdown source |
| Coupons (admin CRUD) | **IMPLEMENTED — KEPT, UNLISTED** | Load-bearing: Sales Tracking's coupon filter/breakdown source, and coupons are used in order entry |
| Tracking links (admin CRUD) | **IMPLEMENTED — KEPT, UNLISTED** | Load-bearing: Sales Tracking's UTM filters/breakdown source. The influencer's own **self-serve tracking-link creation UI was deleted** — only the admin side remains |
| Commercial agreements & versioning | **IMPLEMENTED — KEPT, UNLISTED** | Load-bearing: embedded directly in the Influencer profile page; a new influencer can't have commission terms without it, which "Record Sale" needs to calculate earnings |
| Campaigns (admin CRUD) | **IMPLEMENTED — KEPT, UNLISTED** | Kept because it's one of Sales Tracking's filter fields; lower stakes than the four above but deleting it would silently disable that one filter's ability to reference a new campaign |
| Commission/revenue-share calculation | **IMPLEMENTED** | Pure `decimal.js`-based engine, 4 model types; still runs on every "Record Sale" — this is what makes the admin Sales Tracking "Earnings" column correct |
| Refunds / reversals | **IMPLEMENTED, KEPT, UNLISTED (admin/sales)** | Proportional reversal against original earning, supports partial refunds; reachable from the admin Sales Tracking order detail page |
| Earnings approval workflow | **DELETED** | The PENDING→APPROVED admin UI and its underlying `approveTransactions()` function are both gone. Earnings computed by "Record Sale" now stay PENDING with **no in-app path to move them forward** — see §22 |
| Payouts | **DELETED** | The payout-creation UI and its underlying `createPayout()`/`markPayoutPaid()`/`markPayoutFailed()` functions are all gone. `/api/exports/payouts` still returns a CSV of whatever payout rows exist in the DB (historical/seeded only — no new ones can be created) |
| Goals | **DELETED** | Page, Server Actions, and the `listGoalsWithProgress()` data function all removed. The `Goal` DB table still exists (untouched), just nothing reads/writes it anymore |
| Notifications (list/mark-read UI) | **DELETED** | The influencer-facing list page and its data functions are gone. The **writer** (`notify()`) is still called by the order/refund pipeline as a side effect — it still inserts `Notification` rows, there's simply no UI left to read them |
| Marketing assets | **NOT IMPLEMENTED** | Never had a page; data model exists, unused |
| Audit log (viewer) | **DELETED** | The admin viewer page and `listAuditLogs()` are gone. The **writer** (`recordAudit()`) is untouched and still called throughout the kept flows — audit rows keep being written, there's just no UI to read them anymore |
| My Sales / My Courses / My Coupons / My Links / Profile (influencer) | **DELETED** | All superseded by, or out of scope of, Sales Tracking; zero remaining dependents, confirmed before deletion |
| CSV exports (sales/earnings/payouts/influencers) | **IMPLEMENTED** | All 4 endpoints still work standalone, capped at 10,000 rows. Sales/Influencers exports have "Export CSV" buttons on kept pages; Earnings/Payouts exports are now **only reachable by direct URL** since their admin pages were deleted |
| Order ingestion via real payment/LMS webhook or API | **NOT IMPLEMENTED** | Only manual entry by admin staff exists; schema has `OrderSource.API`/`WEBHOOK`/`CSV_IMPORT` values reserved for later |
| Email/WhatsApp notification delivery | **NOT IMPLEMENTED** | In-app notification writer only, and now has no UI to view it (see Notifications row above) |
| Payment gateway integration | **NOT IMPLEMENTED** | No Stripe/Razorpay/etc. anywhere in the code |
| Metabase integration | **NOT IMPLEMENTED** | See §10 |
| File upload (images/documents) | **NOT IMPLEMENTED** | No upload endpoint exists |
| Automated tests / CI | **NOT IMPLEMENTED** | One manual Playwright smoke script only, re-verified passing after both the nav simplification and the deletion pass (§23) |

---

## 3. User Roles & Access

Roles (`Role` enum): **`ADMIN`, `INFLUENCER` — exactly two, by design.** This is a real database-level change, not a UI relabeling: a migration (`20260924000000_simplify_roles_to_admin_influencer`, §9) collapsed the original 5-role model (`SUPER_ADMIN`, `FINANCE`, `INFLUENCER_MANAGER`, `ANALYST`, `INFLUENCER`) down to these 2, casting every former admin-tier role to `ADMIN` and leaving `INFLUENCER` unchanged. The old distinctions between finance/management/analyst back-office functions no longer exist anywhere in the app — one Admin account does everything on the back-office side.

The `Resource` permission list itself shrank in the deletion pass — `assets`, `goals`, and `auditLogs` were removed from `rbac.ts` entirely since nothing checks them anymore (confirmed via grep before removing).

| Role | Can access | Can create/edit | Cannot access |
|---|---|---|---|
| ADMIN | Influencers, courses, campaigns, coupons, tracking links, agreements, orders, refunds, transactions (ledger, read-only now — no approval action exists), payouts (CSV export only — no creation UI/function exists), staff `users`, exports | Influencers, courses, campaigns, coupons, tracking links, agreements, orders (Record Sale), refunds | Staff `users` beyond CRUD scope shown; there is no more earnings-approval or payout-creation action to restrict, since neither exists anymore |
| INFLUENCER | Only their **own** data: own profile (view only — Profile page was deleted, no self-edit UI remains), own assigned courses, own coupons, own orders (PII-stripped), own ledger (read-only), own Sales Tracking | Nothing — the influencer's self-serve tracking-link creation page was deleted in this pass; `trackingLinks: INFLUENCER: ["read","write"]` still exists in the RBAC matrix as dead permission (no UI calls it) | Any other influencer's data, all admin resources, staff users |

**Influencer data isolation — how it's enforced (this is the critical security property of the app, and it did not change or weaken in the role simplification):**

There are **two independent, server-side layers**, both must pass on every request — the frontend never enforces this alone:

1. **Resource-level RBAC** — `src/lib/auth/rbac.ts`. `assertCan(role, resource, action)` throws a `ForbiddenError` (→ HTTP 403) if the role lacks permission for that resource/action at all.
2. **Row-level scoping** — `src/lib/auth/session.ts`:
   - `resolveInfluencerScope(sessionUser, requestedInfluencerId)` — if the caller's role is `INFLUENCER`, this **always** returns the session's own `influencerId` and silently ignores whatever id was requested.
   - `assertOwnInfluencerScope(sessionUser, requestedInfluencerId)` — throws `ForbiddenError("Cannot access another influencer's data")` if an `INFLUENCER` caller's session id doesn't match the requested id.

The **Sales Tracking** feature (the newest, and the one this handover's manager-facing sibling document focuses on) goes one step further: `src/lib/sales-tracking/service.ts` derives the influencer's identity **exclusively** from the server session and does not accept an influencer/user id as an input parameter **at all** — there is no field for a client to tamper with in the first place. This was a specific, explicit security requirement during development and was verified: a logged-in influencer hitting `/api/influencer/sales-tracking` cannot pass any parameter to see another influencer's data; a non-INFLUENCER role gets a 403.

**Status: this enforcement is server-side, not just frontend-hidden.** No security issue was found in this area during the audit. The one general caveat: `assertCan`/`assertOwnInfluencerScope` usage was verified directly in the sales-tracking, dashboard, and ledger data-access functions; it was **not independently re-verified line-by-line in every single `actions.ts` file** across the whole admin/influencer tree in this pass — recommend the tech team grep for any `src/lib/data/*.ts` or `actions.ts` function that queries by an id **without** first calling `resolveInfluencerScope`/`assertOwnInfluencerScope` as part of their own pre-launch security pass (§16).

---

## 4. Application Architecture

```mermaid
flowchart TD
    U[User: Admin / Influencer] --> FE[Next.js App Router - Server + Client Components]
    FE --> MW[Edge Middleware - src/middleware.ts<br/>coarse route gate by role]
    MW --> AUTH[Auth.js v5 - JWT session<br/>Credentials provider, bcrypt]
    AUTH --> RSC[Server Components / Server Actions]
    RSC --> RBAC[RBAC layer - rbac.ts<br/>assertCan]
    RBAC --> SCOPE[Row-level scoping - session.ts<br/>resolveInfluencerScope / assertOwnInfluencerScope]
    SCOPE --> LIB[Business logic - src/lib<br/>financial, attribution, orders, coupons]
    LIB --> PRISMA[Prisma 7 Client + adapter-pg]
    PRISMA --> PG[(PostgreSQL 16)]

    FE -.5 read-only API routes.-> API[src/app/api/**]
    API --> RBAC

    subgraph Sales Tracking specifically
      ST[Influencer Sales Tracking page] --> STAPI[/api/influencer/sales-tracking/]
      STAPI --> STSVC[sales-tracking/service.ts<br/>identity from session ONLY]
      STSVC --> STADAPTER[SalesTrackingAdapter interface]
      STADAPTER --> MOCK[MockSalesTrackingAdapter<br/>CURRENT: synthetic in-memory data]
      STADAPTER -.NOT YET BUILT.-> METABASE[(Metabase / real data source)]
    end
```

- **Frontend & Backend**: same Next.js 16 App Router app — Server Components render pages, Server Actions handle almost all writes, a small set of route handlers (`src/app/api/**`) handle reads that need to be called from client-side `fetch` or return CSV.
- **Database**: single PostgreSQL 16 instance, accessed only through Prisma.
- **External services**: none currently (§9, §10).
- **Storage**: none — no file upload capability exists.
- **Background processes**: none — no cron/queue/worker of any kind.

---

## 5. Technology Stack

| Technology | Version | Purpose | Notes |
|---|---|---|---|
| Next.js | 16.3.5 | Full-stack framework (App Router, Server Components/Actions, Turbopack) | |
| React / React DOM | 19.2.8 | UI runtime | |
| TypeScript | 5.9.3 | Language | |
| PostgreSQL | 16 | Primary database | Confirmed via local dev cluster (`pg_lsclusters`); production version **REQUIRES TECH TEAM CONFIRMATION** |
| Prisma | 7.10.0 (`prisma` + `@prisma/client`) | ORM / schema / migrations | Uses the newer `prisma-client` generator with a custom output path `src/generated/prisma` (not the legacy `prisma-client-js`) |
| @prisma/adapter-pg | ^7.10.0 | Driver adapter required by Prisma 7's new client engine | Wraps `pg` |
| pg | ^8.23.0 | Postgres driver | |
| next-auth (Auth.js) | 5.0.0-beta.32 | Authentication, JWT sessions | Beta version — see §14 |
| bcryptjs | ^3.0.3 | Password hashing | |
| Tailwind CSS | ^4 (resolved 4.3.3) | Styling | |
| decimal.js | ^10.6.0 | Arbitrary-precision decimal math for all money calculations | Never floating point |
| zod | ^4.6.5 | Runtime input validation (Server Action / order schemas) | |
| lucide-react | ^1.47.0 | Icon set | |
| recharts | ^3.10.1 | Charts (dashboard revenue/earnings graphs) | |
| Playwright | ^1.63.0 (dev dependency) | Browser automation | Used only for one ad hoc smoke script, not a configured test runner (§23) |
| tsx | ^4.23.15 (dev) | Run TypeScript scripts directly (seed script) | |
| ESLint | ^9 + eslint-config-next 16.3.5 (dev) | Linting | |
| npm | — | Package manager | `package-lock.json` present; no pnpm/yarn lockfile |

No file storage/CDN library, no payment SDK, no email/SMS SDK, no error-tracking SDK (e.g. Sentry), and no logging library are present in the dependency tree.

---

## 6. Project Structure

Everything lives under `src/` (no top-level `/app`). Path alias `@/*` → `./src/*`.

```
/
├── .env.example              # committed, placeholders only
├── README.md                 # quickstart + stack summary
├── docs/
│   ├── ARCHITECTURE.md       # design rationale, referenced by section number to an external spec
│   ├── TECHNICAL_HANDOVER.md # this document
│   └── screenshots/          # screenshots referenced by this document
├── prisma.config.ts          # Prisma 7 CLI config (schema/migrations paths, DATABASE_URL)
├── prisma/
│   ├── schema.prisma         # full data model (§9) — Role enum is now just ADMIN | INFLUENCER
│   ├── seed.ts                # dev/demo data generator — npm run db:seed
│   └── migrations/            # 3 migrations to date, the 3rd collapses the role model
├── scripts/
│   └── e2e-smoke.mjs         # manual Playwright smoke script (§23)
├── legacy-portfolio/          # UNRELATED — leftover static portfolio site from this repo's origin as a personal GitHub Pages site. Confirm with the team whether it can be deleted.
└── src/
    ├── middleware.ts          # coarse role-based route gate (role !== "ADMIN" / !== "INFLUENCER")
    ├── generated/prisma/      # Prisma Client output (generated; not hand-edited)
    ├── app/
    │   ├── login/              # login page + Server Action
    │   ├── api/                # the ONLY 5 route handlers in the app (§12)
    │   │   ├── auth/[...nextauth]/route.ts
    │   │   ├── exports/{earnings,influencers,payouts,sales}/route.ts
    │   │   └── influencer/sales-tracking/route.ts
    │   ├── r/[code]/route.ts   # public tracking-link redirect (not under /api)
    │   ├── admin/               # staff-facing pages + colocated Server Actions - nav.ts links Dashboard, Influencers, Sales Tracking (3 items). Courses/Campaigns/Tracking-Links/Coupons/Agreements exist as routes, unlinked but load-bearing (§2). Earnings/Payouts/Audit-Logs pages are GONE (deleted, not just unlinked)
    │   └── influencer/          # influencer-facing pages + colocated Server Actions - nav.ts links only Sales Tracking (1 item); the old dashboard route redirects there. Every other influencer page (Campaigns/Coupons/Courses/Earnings/Goals/Links/Notifications/Payouts/Profile/Sales) is GONE (deleted)
    ├── components/
    │   ├── charts/               # Recharts wrappers
    │   ├── filters/               # shared sales filter bar (now used by both admin and influencer Sales Tracking, with an added Influencer dropdown on the admin side)
    │   ├── layout/                # app-shell (sidebar/nav), sign-out button
    │   └── ui/                    # badge, button, card, table, stat-card, etc.
    └── lib/                      # ALL business logic — the only place that talks to Prisma
        ├── auth/                  # auth.config.ts, auth.ts, auth-edge.ts, rbac.ts, session.ts - rbac.ts's matrix now has exactly 2 roles and 3 fewer resource types (assets/goals/auditLogs removed as dead)
        ├── financial/             # calculation engine, agreements, reversal - payouts.ts and transactions.ts (approval workflow) were DELETED, fully orphaned once their pages went
        ├── attribution/           # coupon/tracking-link attribution strategies
        ├── orders/                # order + refund ingestion pipeline (manual-entry only); also where the admin Sales Tracking aggregate query lives
        ├── sales-tracking/        # the influencer Sales Tracking feature (§10–11)
        ├── data/                  # per-domain read queries (each enforces RBAC + scoping) - goals.ts, audit.ts, notifications.ts were DELETED (their only callers were the deleted pages); payouts.ts and ledger.ts were KEPT (still read by the CSV export routes and, for ledger.ts, the kept Influencer profile page)
        ├── coupons/, audit/log.ts (still called by kept flows - only its VIEWER page was deleted), notifications/create.ts (still called by kept flows - only its LIST page was deleted), api/, csv.ts, format.ts, date-range.ts, prisma.ts
```

A new engineer mainly needs: `src/lib/auth/` (how identity/permissions work — now a 2-role matrix), `src/lib/financial/` (how money is calculated), `src/lib/sales-tracking/` (the influencer feature needing real data), `src/lib/data/orders.ts` (the admin Sales Tracking aggregate), `prisma/schema.prisma` (the data model), and the relevant `src/app/**` folder for whatever page they're changing.

---

## 7. Local Development Setup

Exact steps, taken from `package.json` and `README.md` (no invented commands):

```bash
# 1. Prerequisites
#    - Node.js (v22.x confirmed working in this environment; exact minimum REQUIRES TECH TEAM CONFIRMATION — no `engines` field is set)
#    - PostgreSQL 16 reachable locally
#    - npm

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
#    then fill in real values (see §8)

# 4. Apply database schema
npx prisma migrate deploy

# 5. (Optional) seed demo/dev data
npm run db:seed

# 6. Run the dev server
npm run dev              # http://localhost:3000

# 7. Build for production
npm run build
npm start

# 8. Lint
npm run lint

# 9. Manual smoke test (requires steps 4–6 already done)
npm run e2e:smoke
```

There is **no `npm test` script** and **no automated unit/integration test command** (§23).

Seeded demo logins (from `prisma/seed.ts`, password `Passw0rd!` for all) — only 2 roles now:

| Email | Role |
|---|---|
| admin@platform.dev | ADMIN |
| rahul@creator.dev / priya@creator.dev / amina@creator.dev | INFLUENCER |

---

## 8. Environment Variables

| Variable | Purpose | Required? | Example/Format | Used in | Production Notes |
|---|---|---|---|---|---|
| `DATABASE_URL` | Postgres connection string for Prisma | **Yes** | `postgresql://user:YOUR_SECRET_HERE@host:5432/dbname?schema=public` | `src/lib/prisma.ts`, `prisma/seed.ts`, `prisma.config.ts` | Must point at the production Postgres instance; use a pooled connection string if the host requires one (e.g. pgbouncer) — **REQUIRES TECH TEAM CONFIRMATION** on the chosen host's pooling requirements |
| `AUTH_SECRET` | JWT signing secret for Auth.js sessions | **Yes** | `YOUR_SECRET_HERE` (generate via `openssl rand -base64 32`) | Read implicitly by NextAuth v5 internals | Must be a fresh, random value in production — never reuse a dev value |
| `NEXTAUTH_URL` | Canonical app URL, used by Auth.js for callback construction | **Yes** | `https://your-production-domain.com` | Read implicitly by NextAuth v5 internals | Must exactly match the production domain (including protocol) |
| `NODE_ENV` | Standard Node environment flag | Set automatically by `next build`/`next start` | `production` | `src/lib/prisma.ts` (guards the dev-only hot-reload PrismaClient caching pattern) | No action needed — Next.js sets this |
| `BASE_URL` | Target URL for the manual smoke script only | No (defaults to `http://localhost:3000`) | `https://staging.your-domain.com` | `scripts/e2e-smoke.mjs` | Not needed at runtime, only if the tech team runs the smoke script against a deployed environment |
| `PLAYWRIGHT_EXECUTABLE_PATH` | Optional Chromium path override for the smoke script | No | path to a Chromium binary | `scripts/e2e-smoke.mjs` | Only relevant in sandboxed CI environments where Playwright can't download its own browser |

**No frontend-exposed (`NEXT_PUBLIC_*`) variables exist.** No Metabase, payment, email/SMS, or storage-related environment variables exist because those integrations are not implemented (§2, §10).

**Security note found during this audit:** a real `.env` file with live-looking `DATABASE_URL`/`AUTH_SECRET`/`NEXTAUTH_URL` values exists on disk in the development environment this app was built in. It is correctly excluded via `.gitignore` and was **not** committed to the repository (verified with `git ls-files` / `git check-ignore`). Treat any values in that file as compromised for a shared/dev database — generate fresh secrets for every new environment (dev, staging, production) rather than copying it forward.

---

## 9. Database / Data Architecture

**Type:** PostgreSQL 16, accessed only through Prisma 7 (`@prisma/adapter-pg` driver adapter). Schema at `prisma/schema.prisma` (3 migrations applied to date: `20260922134735_init`, `20260922155721_tracking_link_utm_term_and_coupon`, `20260924000000_simplify_roles_to_admin_influencer` — the third collapses the 5-role model down to `ADMIN`/`INFLUENCER` with a safe data cast, verified to replay cleanly against a fresh database).

All money fields are `Decimal(12,2)` (Postgres `NUMERIC`) — never floating point — matching the `decimal.js`-based calculation engine.

### Core relationship chain

```mermaid
flowchart LR
    User -->|1:1| Influencer
    Influencer -->|has many, versioned| CommercialAgreement
    CommercialAgreement -->|has many, immutable| CommercialAgreementVersion
    Influencer --> TrackingLink
    Influencer --> Coupon
    Campaign --> TrackingLink
    Campaign --> Coupon
    Course --> TrackingLink
    Course --> Coupon
    TrackingLink -.attribution.-> OrderAttribution
    Coupon -.attribution.-> OrderAttribution
    Order -->|1:1| OrderAttribution
    Order --> FinancialTransaction
    CommercialAgreementVersion -.snapshotted into.-> FinancialTransaction
    FinancialTransaction --> Payout
    Order --> Refund
    Refund -.creates REVERSAL.-> FinancialTransaction
```

### Key entities (selected — full model list is in `prisma/schema.prisma`)

| Entity | Key fields | Notable constraints |
|---|---|---|
| `User` | email, passwordHash, role, isActive | `email` unique; `@@index([role])` |
| `Influencer` | userId (1:1), managerId → User, status | `email` unique; indexed on status, managerId |
| `CommercialAgreement` / `CommercialAgreementVersion` | modelType, shares/commission/fixedAmount, effectiveFrom/Until, status | Versions are immutable and append-only; `@@unique([agreementId, version])` |
| `TrackingLink` | code (unique), influencerId, courseId, utmSource/Medium/Campaign/Content/Term, couponId | Indexed on influencerId, courseId, status |
| `Coupon` | code (unique), influencerId, discountType/Value, agreementVersionId (override), usageLimit/currentUsage | Indexed on influencerId, status |
| `Customer` | email (unique), name, phone | Deliberately minimal — "influencers must never see customer PII" (schema comment, line ~497) |
| `Order` | orderNumber (unique), customerId, courseId, couponId, originalPrice/discountAmount/finalAmount | Indexed on courseId, status, placedAt, couponId |
| `OrderAttribution` | orderId (1:1, unique), influencerId, trackingLinkId, couponId, source | Indexed on influencerId, trackingLinkId, couponId |
| `FinancialTransaction` | type, status, immutable snapshot fields of the agreement terms used, eligibleRevenue/influencerAmount/companyAmount | Indexed on `[influencerId, status]`, orderId, payoutId; self-relation for REVERSAL→EARNING linkage |
| `Payout` | influencerId, amount, status, reference, method | Indexed on `[influencerId, status]`. **No UI or function creates new rows anymore** (deleted in the latest revision) — only readable via `/api/exports/payouts` |
| `AuditLog` | action, entityType/Id, previousValue/newValue (JSON) | Append-only by application-layer convention. The writer (`recordAudit()`) is still called throughout the kept flows, so rows keep being written — the admin **viewer page was deleted**, so there's no UI to read them anymore |
| `Goal` | influencerId, metric, targetValue, periodStart/End | **No UI or function reads/writes this table anymore** (deleted in the latest revision) |
| `Notification` | userId, type, title, body, isRead | The writer (`notify()`) is still called throughout the kept order/refund flows, so rows keep being written — the influencer-facing list page was **deleted**, so there's no UI to read them anymore |

The database schema itself was **not** touched in this deletion pass — only application code (pages, Server Actions, and the lib-layer functions with zero remaining callers) was removed. Every table above still exists and is still reachable via Prisma if the tech team wants to query it directly or rebuild a UI on top of it later.

Full enum list: `Role`, `InfluencerStatus`, `AgreementModelType`, `EligibleRevenueBasis`, `AgreementStatus`, `CourseStatus`, `CampaignStatus`, `TrackingLinkStatus`, `CouponDiscountType`, `CouponStatus`, `OrderStatus`, `OrderSource`, `AttributionSource`, `TransactionType`, `TransactionStatus`, `PayoutStatus`, `GoalMetric`, `AssetType`, `NotificationType`.

---

## 10. Metabase / Data Source Integration

**Metabase integration is not currently implemented in the application.** A repo-wide case-insensitive search for "metabase" returns matches only inside code comments in `src/lib/sales-tracking/` describing it as a **future** integration point — there is no Metabase SDK dependency, no API base URL, no connection string, and no HTTP call to Metabase anywhere in the code.

### CURRENT IMPLEMENTATION (Sales Tracking data)

The Sales Tracking feature is built against a clean adapter interface specifically so a real data source can be dropped in later without touching the UI or API route:

```ts
// src/lib/sales-tracking/adapter.ts
export interface SalesTrackingAdapter {
  getFilterOptions(identity: InfluencerIdentity): Promise<SalesFilterOptions>;
  getSales(identity: InfluencerIdentity, filters: SalesFilters): Promise<InfluencerSalesResponse>;
}

// src/lib/sales-tracking/index.ts  <-- THE SINGLE SWAP POINT
export const salesTrackingAdapter: SalesTrackingAdapter = new MockSalesTrackingAdapter();
```

Today, `MockSalesTrackingAdapter` (`src/lib/sales-tracking/mock-adapter.ts`) generates **deterministic synthetic data in memory** (`mock-data.ts` — seeded per-influencer-id PRNG, 35–54 fake sales rows from fixed course/UTM/coupon vocab lists, cached per server process). There is no database table backing it and no real order data is read.

### EXPECTED PRODUCTION DATA INTEGRATION

To go live, the tech team implements a new class satisfying the same `SalesTrackingAdapter` interface (e.g. `MetabaseSalesTrackingAdapter`) and changes the one export in `index.ts`. Nothing else in the app needs to change.

**API endpoint the frontend calls:** `GET /api/influencer/sales-tracking`

**Query parameters (all optional; absence = no filter applied):**

| Param | Type | Example |
|---|---|---|
| `startDate` | ISO date string | `2026-06-01` |
| `endDate` | ISO date string | `2026-09-30` |
| `utmSource` | string | `youtube` |
| `utmMedium` | string | `influencer` |
| `utmCampaign` | string | `dedicated` |
| `utmContent` | string | `sf` |
| `utmTerm` | string | `HarshPriyam` |
| `couponCode` | string | `HPDSPAPP` |
| `courseName` | string | `Python + DSA Mastery` |

Note: identity (which influencer) is **never** a parameter — it comes only from the server-side session (§3).

**Response shape (`InfluencerSalesResponse`):**

```json
{
  "summary": {
    "totalSales": 51,
    "totalRevenue": 597800,
    "coursesSold": 3
  },
  "courseBreakdown": [
    { "courseName": "AI Mastery", "sales": 16, "revenue": 232500 }
  ],
  "utmBreakdown": [
    { "utmContent": "sf", "sales": 13, "revenue": 155050 }
  ],
  "sales": [
    {
      "orderId": "ORD-MUDJS9YP-WC28",
      "date": "2026-09-18",
      "courseName": "Python + DSA Mastery",
      "utmSource": "storefront",
      "utmMedium": "V_Upskill_Academy",
      "utmCampaign": "Dedicated",
      "utmContent": "sf",
      "utmTerm": "HarshPriyam",
      "couponCode": "HPDSPAPP",
      "userId": "usr_9f2ab1",
      "saleAmount": 10000,
      "saleStatus": "PAID"
    }
  ]
}
```

Required fields per sale row: `orderId`, `date`, `courseName`, `userId`, `saleAmount`, `saleStatus`. Optional/nullable: `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`, `couponCode`. `saleStatus` is one of `"PAID" | "PENDING" | "REFUNDED" | "CANCELLED"`.

---

## 11. Sales Tracking Feature (Influencer + Admin)

Sales Tracking is now the platform's core function for both roles — this is intentional, per the simplified product direction. It's two separate pages built on shared underlying data (`Order`/`OrderAttribution`), not one shared page: the influencer sees only their own sales, the admin sees everyone's with an added influencer breakdown.

### 11.1 Influencer Sales Tracking

**Access:** Influencer logs in → lands directly on "Sales Tracking," their only nav item.

**Flow:**

```mermaid
flowchart LR
    A[Logged-in Influencer] --> B[Sales Tracking page loads<br/>empty state - no fetch yet]
    B --> C[Pick date range + optional UTM/coupon/course filters]
    C --> D[Click Apply Filters]
    D --> E[GET /api/influencer/sales-tracking]
    E --> F[service.ts resolves identity from session ONLY]
    F --> G[salesTrackingAdapter.getSales]
    G --> H[Mock adapter today / Metabase adapter later]
    H --> I[Summary cards + course breakdown + UTM breakdown + detail table]
```

- **Filters:** Start Date & End Date (both required before any fetch happens), UTM Source, UTM Medium, UTM Campaign, UTM Content, UTM Term, Coupon Code, Course Name (all optional, populated dynamically per-influencer from `getFilterOptions`).
- **States:** idle (default — "select a date range," no data loaded), loading (spinner), error ("unable to load, retry" button), loaded-empty ("no sales found for the selected filters"), loaded-with-data.
- **Data shown on success:** 3 summary cards (Total Sales, Total Revenue, Courses Sold), a course-wise breakdown table, a UTM-content breakdown table, and a full sales detail table (date, course, all UTM fields, coupon, opaque User ID, order ID, amount, status).
- **Reset:** "Clear Filters" resets all filters and returns to the idle state.
- **Pagination: NOT IMPLEMENTED** — the detail table renders all matching rows at once. **Export: NOT IMPLEMENTED** for this specific feature (the separate `/api/exports/sales` admin-only CSV export is unrelated and not influencer-facing).
- Runs on mock data — see §10 for the real-data integration path. Unlike the admin view below, this one is not backed by the real database at all yet.

### 11.2 Admin Sales Tracking

**Access:** Admin logs in → "Sales Tracking" in the 3-item nav (`/admin/sales`, extended from the original admin Sales page rather than built new).

Unlike the influencer view, this one **is** backed by real database data (the `Order`/`OrderAttribution`/`FinancialTransaction` tables) — it's the same order data the manual-entry pipeline (§13, §20) writes to.

- **Filters:** Start Date, End Date, Course, Campaign, **Influencer** (new — a dropdown of all influencers), Coupon Code, Status, UTM Source, UTM Medium, UTM Campaign, UTM Content, UTM Term. Same shared `SalesFilterBar` component the influencer page uses, with the Influencer dropdown added only on this side.
- **Data shown:** Total Sales / Total Revenue summary cards, four breakdown tables — **by influencer**, by course, by UTM content, by coupon (each: count + revenue, sorted by revenue descending) — and the existing paginated order detail table below (unchanged from the original build: order ID, date, course, influencer, coupon, UTM fields, amount, earnings, status).
- **Implementation:** `getSalesTrackingSummary()` in `src/lib/data/orders.ts`, sharing its `where`-clause builder with the existing `listOrders()` so the breakdowns and the detail table are always filtering the exact same set of orders. Aggregation is done in application code over up to 10,000 matching orders (same cap as the CSV exports) — not a SQL `GROUP BY` — acceptable at current data volumes but worth revisiting if order volume grows large (§22).
- **Pagination:** the detail table is paginated (25/page) as before; the summary cards and breakdown tables are not (they aggregate across every matching order, not just the current page).
- **Export:** the existing "Export CSV" button (`/api/exports/sales`) still works and respects the same filters, including the new influencer filter.

**Screenshots** for both views are in §19.

---

## 12. API Documentation

All 5 route handlers in the app, verbatim from `src/app/api/**/route.ts`. Everything else (agreements, campaigns, coupons, courses, orders, payouts, tracking-links CRUD) is implemented as **Server Actions**, not REST endpoints — there is no separate JSON API for those.

### `GET/POST /api/auth/[...nextauth]`
NextAuth's own internal machinery (signin/callback/session/csrf). Not hand-written; no custom logic to document.

### `GET /api/influencer/sales-tracking`
- **Auth:** session required; role must be `INFLUENCER` with a resolved `influencerId`, or 403.
- **Authorization:** identity comes only from the session — no id parameter accepted.
- **Query params / response:** see §10 (Metabase / Data Source Integration) above.
- **Errors:** `401` not authenticated, `403` wrong role, `500` unexpected error (all via the shared `apiHandler` wrapper).

### `GET /api/exports/earnings`
- **Auth:** session + `assertCan(role, "exports", "read")` — `ADMIN` only (the only role that can hold this permission now).
- **Query params:** `status` (transaction status filter — passed through without runtime validation against the enum).
- **Response:** CSV file (`earnings.csv`).
- **Note:** no row-level influencer scoping is applied — any permitted role receives ALL influencers' earnings.
- **Orphaned endpoint:** the admin Earnings page that used to link here was deleted. This route still works, but only if someone hits the URL directly — there's no button anywhere pointing at it anymore.

### `GET /api/exports/influencers`
- **Auth:** same `assertCan` pattern.
- **Query params:** none.
- **Response:** CSV (`influencers.csv`), capped at 10,000 rows.

### `GET /api/exports/payouts`
- **Auth:** same pattern. **Query params:** none. **Response:** CSV (`payouts.csv`).
- **Orphaned endpoint, same as earnings above** — the admin Payouts page was deleted, and so was the ability to create a new payout at all (§22). This will only ever export whatever `Payout` rows already exist (historical/seeded).

### `GET /api/exports/sales`
- **Auth:** same pattern.
- **Query params:** `status`, `courseId`, `campaignId`, `influencerId`, `couponCode`, `utmSource`, `utmMedium`, `utmCampaign`, `utmContent`, `utmTerm`, `from`, `to` — all forwarded to `listOrders()`.
- **Response:** CSV (`sales.csv`).

### `GET /r/[code]` (public, not under `/api`)
- **Auth:** none — intentionally public.
- **Purpose:** tracking-link redirect. Looks up the `TrackingLink` by `code`; if missing/inactive, redirects to `/`; otherwise increments the click counter and 302-redirects to the course URL with the link's full UTM parameters and coupon code appended.

---

## 13. Authentication

- **Login flow:** single email+password Credentials provider (Auth.js v5 / NextAuth). `authorize()` (`src/lib/auth/auth.ts`) looks up the user by lowercased/trimmed email, rejects inactive users, compares the password with `bcrypt.compare`, updates `lastLoginAt`, and returns `{ id, email, name, role, influencerId }`.
- **Session management:** JWT strategy (no database session table). Role and `influencerId` are copied onto the JWT at sign-in and exposed on `session.user` via the session callback.
- **Token management:** handled entirely by Auth.js's own JWT encode/decode using `AUTH_SECRET`; no custom token logic.
- **Password handling:** bcryptjs hash, never stored/logged in plaintext.
- **Identifying the logged-in influencer:** every server-side function calls `requireSession()` (`src/lib/auth/session.ts`) which is the sole source of truth for "who is calling"; `session.user.influencerId` is what ties a request to a specific `Influencer` row — never a client-supplied parameter.
- **Logout:** standard Auth.js sign-out (`SignOutButton` component).
- **Session expiration:** governed by Auth.js's default JWT session settings — no custom `maxAge`/rotation was found configured; **exact expiry duration REQUIRES TECH TEAM CONFIRMATION** if a specific policy is needed.
- **Password reset:** **NOT IMPLEMENTED** — no reset-flow pages, tokens, or email sending exist.
- **Edge/Node split:** Next.js Edge Middleware can't load the generated Prisma client, so auth is split into `auth.config.ts` (edge-safe, stub `authorize`), `auth.ts` (full config with the real Prisma/bcrypt `authorize`, used everywhere except middleware), and `auth-edge.ts` (edge-safe `auth()` used only by `middleware.ts`).

---

## 14. Security Review

| Area | Finding |
|---|---|
| Exposed secrets / hardcoded credentials | None found in source. A real `.env` exists on disk in this dev environment (correctly git-ignored) — rotate before any shared use (§8, §10). |
| Unsafe API endpoints | All 5 route handlers are wrapped in `apiHandler` with explicit auth checks; none found unauthenticated except the intentionally-public `/r/[code]` redirect. |
| Missing authorization | Not found in the paths independently verified (sales-tracking, dashboard, ledger). **Not exhaustively re-verified across every Server Action** — recommend a full grep pass before launch (§3). |
| Client-side-only access control | **None found** — the influencer data-isolation property is enforced server-side in two independent layers (§3), not just hidden in the UI. |
| SQL injection | Low risk — all queries go through Prisma's parameterized query builder; no raw SQL string concatenation was found. |
| XSS | Low risk — standard React/JSX escaping throughout; no `dangerouslySetInnerHTML` usage found. |
| CSRF | Handled by Auth.js's built-in CSRF protection for its own endpoints; Server Actions get Next.js's built-in Origin-header protection. Not independently penetration-tested. |
| Insecure direct object references (IDOR) | Sales Tracking specifically has **no id parameter to tamper with at all** (identity is session-derived). Admin export routes (`/api/exports/sales` etc.) accept an `influencerId` filter, but access to those routes is already gated to admin-tier roles by RBAC — not a per-influencer IDOR risk since influencers can't reach them. |
| Excessive API responses | Admin-only CSV exports return full unfiltered rows (capped at 10,000) to any role with `exports` permission — by design, those roles are meant to see all data. |
| Unsafe file uploads | N/A — no upload functionality exists. |
| Debug endpoints / dev credentials | `prisma/seed.ts` creates known dev credentials (`Passw0rd!` for all seeded accounts) — **must not be run against production**, or if it is for initial setup, all seeded passwords must be rotated immediately. |
| CORS | No custom CORS configuration found in `next.config.ts` (default/empty config) — Next.js's same-origin defaults apply. |
| Production configuration issues | No environment-specific config split was found beyond `NODE_ENV`; `next-auth` is on a **beta** version (`5.0.0-beta.32`) — confirm this is an acceptable production dependency before launch. |

### CRITICAL BEFORE PRODUCTION
- [ ] Rotate every secret found in this development environment's `.env` — do not carry any of them into staging/production.
- [ ] Run a full grep for every `src/lib/data/*.ts` function and admin/influencer `actions.ts` file to confirm `assertOwnInfluencerScope`/`resolveInfluencerScope` is called before any influencer-scoped query (only a sample was independently re-verified in this audit).
- [ ] Decide whether to pin `next-auth` off its current beta version before production, or explicitly accept the beta as final for launch.
- [ ] Ensure `npm run db:seed` (which creates known dev passwords) is never run against the production database, or that all seeded accounts have their passwords rotated immediately if it is used for initial data setup.

---

## 15. Deployment Architecture

### CURRENT CONFIGURATION
- `next.config.ts` is empty/default — no custom rewrites, headers, image domains, or output mode set.
- No `vercel.json`, no `Dockerfile`, no `docker-compose.yml`, no `.github/workflows/` — **no deployment or CI configuration of any kind exists in the repo.**
- README explicitly states the app **cannot** run on GitHub Pages (needs a database, server-side auth, and the financial calculation engine — none of which a static host can provide) and suggests a Node-capable host (Vercel/Railway/Render/Fly.io, unconfirmed which one this org will use) with a managed Postgres provider (Neon/Supabase/Railway/RDS, likewise unconfirmed).
- Documented (README) manual deploy steps: `npm install` → configure `.env` → `npx prisma migrate deploy` → (`npm run db:seed` optionally, dev only) → `npm run build` → `npm start`.

### RECOMMENDED PRODUCTION CONFIGURATION — REQUIRES TECH TEAM CONFIRMATION
The following all depend on decisions only the tech team can make; nothing below is inferred from the code:
- **Frontend/Backend hosting**: any Node.js-capable host (this is a single full-stack Next.js app, not a static site) — **REQUIRES TECH TEAM CONFIRMATION**.
- **Database hosting**: managed Postgres 16-compatible service — **REQUIRES TECH TEAM CONFIRMATION**.
- **Domain / SSL**: not configured anywhere in the repo — **REQUIRES TECH TEAM CONFIRMATION**.
- **Migrations on deploy**: run `npx prisma migrate deploy` as a release step before `npm start`; no automation for this exists yet.
- **Auth callback URLs**: `NEXTAUTH_URL` must be set to the real production domain.
- **CORS / webhooks / storage / CDN**: not applicable today since none of those integrations exist yet (§2, §9, §10).

---

## 16. Production Deployment Checklist

```
[ ] Production repository/branch strategy confirmed
[ ] Production hosting environment chosen and created (frontend + Node runtime)
[ ] Production PostgreSQL 16+ database provisioned
[ ] Environment variables configured (DATABASE_URL, AUTH_SECRET, NEXTAUTH_URL) — see §8
[ ] All secrets rotated from dev values (never reused from this environment)
[ ] Database migrations executed (`npx prisma migrate deploy`)
[ ] Prisma Client generated as part of the build/install step
[ ] Real Sales Tracking data adapter implemented and swapped in (§10) — or explicitly deferred with stakeholders' sign-off that mock data ships at launch
[ ] Authentication domain/callback URL configured for production
[ ] Domain configured and DNS pointed
[ ] SSL/TLS active
[ ] Application deployed and reachable
[ ] Seeded demo/dev accounts removed or passwords rotated if seed script was used for initial setup
[ ] Admin access tested end-to-end (login, Dashboard, Influencers, Sales Tracking)
[ ] Influencer access tested end-to-end (login lands on Sales Tracking directly)
[ ] Influencer data-isolation re-tested against production data (cannot access another influencer's data via any parameter)
[ ] Sales Tracking tested against whatever data source is live at launch
[ ] UTM filtering, coupon filtering, course filtering all tested individually and combined
[ ] Empty-result and error states tested
[ ] Mobile responsiveness spot-checked (already verified at 1440px/390px during development; tablet width was explicitly descoped)
[ ] A full security pass completed (see §14 Critical list)
[ ] Logging/error visibility configured beyond default stdout capture
[ ] Monitoring configured (§26 — nothing exists today)
[ ] Backup strategy confirmed for the production database (§27 — nothing exists today)
[ ] Rollback strategy confirmed for both app deploys and DB migrations (§27)
[ ] CI pipeline set up (none exists today) running at minimum `npm run lint` and `npm run build`
```

---

## 17. Information Required From Tech Team

Only items the application genuinely needs before it can go live — not a generic wishlist:

- Production `DATABASE_URL` (host, credentials, pooling requirements).
- Production `AUTH_SECRET` and confirmed production domain for `NEXTAUTH_URL`.
- Decision + implementation plan for the real Sales Tracking data source (Metabase connection details, or whatever the actual system of record is) — see §10 for the exact interface it must satisfy.
- Real order/sale data schema mapping so a real `SalesTrackingAdapter` (or the underlying order-ingestion pipeline) can be written — see §18 Data Mapping.
- Decision on which order-ingestion path (real payment/LMS API, webhook, or scheduled CSV import) will replace today's manual-entry-only flow, and access/credentials for that source.
- Hosting environment and deployment process the org wants to standardize on (nothing is currently assumed).
- Any organizational requirement for password reset, SSO, or MFA (none of these exist today — confirm whether they're needed for launch).

---

## 18. Data Mapping (Sales Tracking)

| Frontend field | API/type field | Source field (real system) | Data type | Example |
|---|---|---|---|---|
| Start Date / End Date | `startDate` / `endDate` | REQUIRES TECH TEAM CONFIRMATION (likely order placement date) | ISO date string | `2026-06-01` |
| UTM Source | `utmSource` | REQUIRES TECH TEAM CONFIRMATION (likely tracking-link/campaign UTM field in the real ad/analytics system) | string \| null | `storefront` |
| UTM Medium | `utmMedium` | REQUIRES TECH TEAM CONFIRMATION | string \| null | `V_Upskill_Academy` |
| UTM Campaign | `utmCampaign` | REQUIRES TECH TEAM CONFIRMATION | string \| null | `Dedicated` |
| UTM Content | `utmContent` | REQUIRES TECH TEAM CONFIRMATION | string \| null | `sf` |
| UTM Term | `utmTerm` | REQUIRES TECH TEAM CONFIRMATION | string \| null | `HarshPriyam` |
| Coupon Code | `couponCode` | REQUIRES TECH TEAM CONFIRMATION (likely the coupon/discount-code field on the order record) | string \| null | `HPDSPAPP` |
| Course Name | `courseName` | REQUIRES TECH TEAM CONFIRMATION (course/product name or ID in the real catalog) | string | `Python + DSA Mastery` |
| User ID | `userId` | REQUIRES TECH TEAM CONFIRMATION — must be an existing **opaque, non-PII** internal identifier; never phone/email/name | string | `usr_9f2ab1` |
| Sale Amount | `saleAmount` | REQUIRES TECH TEAM CONFIRMATION (final/net amount charged, matching whatever revenue basis the business reports on) | number | `10000` |
| Sale Status | `saleStatus` | REQUIRES TECH TEAM CONFIRMATION — must map onto `"PAID" \| "PENDING" \| "REFUNDED" \| "CANCELLED"` | enum string | `PAID` |

This app's internal `Order`/`OrderAttribution` schema (§9) already models UTM source/medium/campaign/content/term and coupon linkage for the **manual-entry** flow that exists today — if the real data source is a different system entirely (e.g. a separate storefront/LMS whose data lives in Metabase), the mapping above needs the tech team to fill in the right column/field names on their side.

---

## 19. Screenshots

All captured live from the running application (freshly-seeded demo data, post-simplification), desktop viewport (1440×900). Saved under `docs/screenshots/`. Notice how short this list is now — that's the point of the simplification.

**Login**
![Login page](screenshots/01-login.png)

**Influencer — Sales Tracking, default state.** Single nav item, sidebar-only "Sales Tracking."
![Influencer Sales Tracking default state](screenshots/02-influencer-sales-tracking-default.png)

**Influencer — Sales Tracking, with results** (summary cards, course breakdown, UTM breakdown, detail table — all scoped to this influencer only)
![Influencer Sales Tracking results](screenshots/03-influencer-sales-tracking-results.png)

**Admin Dashboard.** 3-item nav: Dashboard, Influencers, Sales Tracking.
![Admin dashboard](screenshots/04-admin-dashboard.png)

**Admin — Influencer Management**
![Admin influencers](screenshots/05-admin-influencers.png)

**Admin — Sales Tracking** (Influencer filter dropdown + 4 breakdown tables — by influencer, course, UTM content, coupon — above the existing order detail table)
![Admin Sales Tracking](screenshots/06-admin-sales-tracking.png)

No screenshots still need to be captured manually — all listed pages were reachable and captured directly from the live dev instance during this audit. Screenshots of the hidden-but-present pages (Courses, Coupons, Tracking Links, Agreements, etc.) were deliberately not included here since they're out of the current nav-visible scope — they're unchanged from before and still reachable by direct URL if needed.

---

## 20. User Flows

**Login**
```
Influencer/Admin → /login → Auth.js Credentials check → role-based redirect (/influencer or /admin)
```

**Sales Tracking — Influencer**
```
Influencer → Sales Tracking nav item (their only one) → select date range (+ optional filters) → Apply Filters
  → GET /api/influencer/sales-tracking → session-derived identity → mock adapter → results rendered
```

**Sales Tracking — Admin**
```
Admin → Sales Tracking nav item → optionally select an influencer + any filters → Apply filters
  → getSalesTrackingSummary() + listOrders() query the real Order/OrderAttribution tables
  → summary cards + 4 breakdown tables + paginated detail table rendered
```

**Order → Earnings**
```
Admin records a sale (manual entry, only path implemented today, via the admin Sales Tracking page)
  → attribution resolved (coupon takes priority over tracking link)
  → applicable CommercialAgreementVersion resolved (coupon-linked > campaign-scoped > course-scoped > general)
  → calculateSplit() computes eligible revenue + influencer/company split (decimal.js)
  → FinancialTransaction (EARNING, PENDING) created with a full immutable snapshot of the terms used
  → shows up in the admin Sales Tracking detail table's "Earnings" column and in /api/exports/earnings
```

**This flow now ends at PENDING.** The approval step (PENDING → APPROVED) and payout creation were deleted along with their UI and underlying functions (`approveTransactions()`, `createPayout()`) in the latest revision — there is currently **no way, anywhere in the app, to move a transaction past PENDING or to create a payout.** If the business needs to track disbursement again, that's rebuild work, not a hidden feature to re-link — see §22 and §26 Phase 2.

**Refund**
```
Admin records a refund against an order
  → proportional reversal calculated against the original EARNING transaction
  → a REVERSAL transaction is created, linked back to the original via relatedTransactionId
```

---

## 21. Current Status

| Feature | Status | Production Ready? | Tech Team Action Required? |
|---|---|---|---|
| Two-role model (Admin/Influencer) | Implemented — real migration, RBAC rewrite, seed data update | Yes | No — smoke-tested and rebuilt clean from scratch on a fresh DB |
| Auth / RBAC / row-level scoping | Implemented | Yes (pending secret rotation) | Rotate secrets; confirm session expiry policy |
| Influencer management | Implemented, nav-visible | Yes | No |
| Course/campaign/coupon/tracking-link management | Implemented, kept as unlisted admin back-office (load-bearing for Sales Tracking) | Yes | No |
| Commercial agreements & financial calculation engine | Implemented, kept as unlisted admin back-office (embedded in Influencer profile) | Yes | No |
| Earnings approval | **DELETED** | No — doesn't exist | Rebuild if disbursement tracking is needed (§26 Phase 2) |
| Payouts | **DELETED** | No — doesn't exist | Rebuild if disbursement tracking is needed, or confirm manual/external tracking is acceptable (§26 Phase 2) |
| Sales Tracking — Influencer | Mock data | No | Implement real `SalesTrackingAdapter` (§10) |
| Sales Tracking — Admin | Real DB data, nav-visible | Yes | No |
| Order ingestion | Manual entry only, via admin Sales Tracking | Partially | Decide/build real ingestion path if manual entry isn't sufficient at scale |
| Marketing assets | Not implemented, never had a page | N/A | Build if needed |
| CSV exports | Implemented (sales/influencers linked from UI; earnings/payouts now URL-only, orphaned) | Yes at current scale (10k row cap) | Revisit if data volume grows significantly |
| Testing | One manual smoke script | No | Requires integration/CI test coverage before launch |
| Deployment/CI | Not implemented | No | Requires integration |
| Monitoring | Not implemented | No | Requires integration |

---

## 22. Known Limitations

- **Earnings can never be approved and payouts can never be created — this is new as of the latest revision.** The UI and the underlying functions (`approveTransactions()`, `createPayout()`, `markPayoutPaid()`, `markPayoutFailed()`) were all deleted because nothing else depended on them. Every "Record Sale" still computes and stores a correct PENDING earning (the financial engine itself is untouched), it just has no in-app path forward from there. If the business needs to track influencer disbursement through this app, that's rebuild work — the `Payout`/`FinancialTransaction` schema is still there to build back on top of, but the pages, actions, and functions are gone.
- Similarly, **there's no more way to view the audit log or in-app notifications** — both writers (`recordAudit()`, `notify()`) are still active and still populating their tables from every kept flow, but their viewer pages were deleted along with the rest.
- **Influencers can no longer self-serve create their own tracking links.** Only the admin-side Tracking Links CRUD remains; if an influencer needs a new link, an admin has to create it for them now.
- Sales Tracking runs entirely on synthetic mock data — no real database table or Metabase connection exists yet.
- Order ingestion is manual-entry only; API/webhook/CSV-import paths are reserved in the schema (`OrderSource` enum) but not built.
- No payment gateway integration — payouts are recorded, not actually disbursed by the app.
- No email/WhatsApp/SMS notification delivery — notifications are in-app only.
- No file upload capability — marketing asset URLs must be supplied externally.
- No automated unit/integration test suite — one manual, DB-dependent Playwright smoke script only.
- No CI/CD pipeline.
- No monitoring/error-tracking integration (e.g. Sentry) — the only server-side logging is a single `console.error` in the shared API error handler.
- No password-reset flow, SSO, or MFA.
- `next-auth` is on a pre-1.0 beta release.
- `legacy-portfolio/` at the repo root is unrelated leftover content from this repo's origin as a personal GitHub Pages site.

---

## 23. Testing

**Existing tests:** none in the traditional sense — no Jest/Vitest/Mocha, no `*.test.ts`/`*.spec.ts` files, no `jest.config.*`/`playwright.config.*`.

**What does exist:** `scripts/e2e-smoke.mjs`, run via `npm run e2e:smoke`. A plain Node script (not the Playwright test runner) that launches Chromium directly, logs in as the seeded influencer (`rahul@creator.dev`), and walks through RBAC enforcement, the order → attribution → calculation → refund pipeline through the real UI, and the 4 CSV export endpoints. Updated in the latest revision to drop the earnings-approval/payout-creation steps it used to click through, since that UI no longer exists. Requires a running dev server and a seeded database; not wired into any CI (none exists).

**What's not covered:** no coverage of the Sales Tracking feature specifically, no admin-side UI flows beyond what the smoke script touches, no unit-level coverage of the financial calculation engine's edge cases (e.g. HYBRID model thresholds, multi-partial-refund sequences).

### Recommended pre-launch smoke-test checklist
```
[ ] Login (each role) / Logout
[ ] Role-based redirect and route gating (middleware)
[ ] Influencer cannot access another influencer's data via any UI action or direct API call
[ ] Sales Tracking: date filter, each UTM filter individually, coupon filter, course filter, combined filters
[ ] Sales Tracking: empty-result state, error state (simulate a backend failure)
[ ] Admin: create/edit an agreement, record a sale, process a refund (earnings-approval and payout-creation no longer exist to test — see §22)
[ ] CSV exports (all 4) produce correct, complete data
[ ] Mobile UI spot-check (drawer nav, filter grid reflow)
[ ] Security: attempt to pass another influencer's id/email as a parameter anywhere it's accepted client-side
```

---

## 24. Monitoring & Operations

**Not currently implemented.** No uptime monitoring, no APM, no error-tracking SDK, no structured logging — the only current error visibility is a single `console.error(err)` call inside the shared API error handler (`src/lib/api/handler.ts`), which will only reach whatever the hosting platform captures from stdout/stderr.

Recommended for the tech team to add before/at launch: application uptime monitoring, API error-rate tracking, database error/connection monitoring, auth failure tracking, and (once a real Sales Tracking adapter exists) connectivity/response-time monitoring for that data source.

---

## 25. Backup & Rollback

**Not currently defined anywhere in the codebase — REQUIRES TECH TEAM CONFIRMATION** for:
- Database backup frequency/retention strategy.
- Application deployment rollback approach (no CI/CD exists yet to define this against).
- Database migration rollback plan (Prisma migrations are forward-only by default; a rollback plan needs to be decided by the team operating the production database).

---

## 26. Handover Summary

### What is already built
A working platform scoped to exactly two roles (Admin, Influencer) and one core function (Sales Tracking) — Admin also manages influencers. The influencer-facing Sales Tracking (mock data, real UI/API) and the admin-facing Sales Tracking (real DB data, influencer/course/UTM-content/coupon breakdowns) are both nav-visible and both fully working, backed by a still-intact commercial-agreement engine and decimal-precise financial calculation (both kept as unlisted admin back-office, since Sales Tracking's real data depends on them). What's genuinely gone, not just hidden: earnings approval, payouts, the influencer's self-serve link creation, and every standalone influencer page (My Sales/Courses/Coupons/Links/Profile/Earnings/Payouts/Goals/Notifications) plus the admin Earnings/Payouts/Audit Log pages. Auth, RBAC, and row-level data isolation are unchanged throughout.

### What the tech team needs to connect
A real production Postgres database; a real Sales Tracking data source (Metabase or otherwise) behind the existing `SalesTrackingAdapter` interface; a real order-ingestion path if manual entry isn't sufficient; production secrets and a hosting/CI/CD pipeline (none exist today).

### What needs to be tested
Full RBAC/data-isolation re-verification against production data; the pre-launch smoke-test checklist (§23); a dedicated security pass (§14 Critical list).

### What needs to be configured before launch
Environment variables and secrets (§8); hosting, domain, SSL (§15); database migrations-on-deploy; monitoring and backup strategy (§24–25).

### Recommended for Phase 2
Real payment/LMS order ingestion (API or webhook); file upload for marketing assets; email/WhatsApp notification delivery; automated test suite + CI; password reset/SSO; pagination and export for the Sales Tracking detail table at scale; **if disbursement tracking turns out to still be needed, rebuilding earnings-approval and payout creation** (the schema is intact, only the pages/actions/functions were removed) rather than assuming it's still there.
