# Influencer Partnership & Sales Management Platform

Replaces spreadsheets for managing a micro-influencer sales channel: versioned
commercial agreements, multi-model commission/revenue-share, order
attribution, an auditable financial ledger, refunds, payouts, and
role-scoped dashboards for admins and influencers.

This repository holds the application source. It is **not** deployed on
GitHub Pages — GitHub Pages serves static files only and cannot run a
database, authentication, or the server-side financial calculation engine
this app requires. Deploy it to a Node-capable host (Vercel, Railway,
Render, Fly.io, ...) with a managed Postgres database (Neon, Supabase,
Railway Postgres, RDS, ...). See `docs/ARCHITECTURE.md` for the full design
rationale.

## Stack

Next.js 16 (App Router, TypeScript) · PostgreSQL via Prisma 7 · Auth.js v5
(credentials + JWT sessions) · Tailwind CSS · Recharts.

## Local development

Requires Node 20+, a running PostgreSQL 16 instance, and Playwright's
Chromium (only for `npm run e2e:smoke`).

```bash
npm install

# Point DATABASE_URL at your Postgres instance (see .env.example)
cp .env.example .env
# generate a real secret: openssl rand -base64 32

npx prisma migrate deploy   # apply the schema
npm run db:seed             # seed demo data + login credentials (printed at the end)

npm run dev                 # http://localhost:3000
```

`npm run db:seed` prints working credentials for every role (Super Admin,
Finance, Influencer Manager, Analyst, and three influencers with three
different commercial models) with the shared dev password `Passw0rd!`.

## Verifying the build

```bash
npx tsc --noEmit     # type check
npm run lint          # eslint
npm run e2e:smoke     # full browser smoke test against a running dev server + seeded DB
```

`scripts/e2e-smoke.mjs` drives a real Chromium browser through: RBAC
enforcement (an influencer can never reach /admin or another influencer's
data), creating an influencer, adding a versioned commercial agreement,
creating a coupon, recording a manual sale, verifying the financial engine's
calculated commission, issuing a partial refund, approving earnings, and
creating a payout — then checks all four CSV export endpoints.

## What's implemented (Phase 1, per the product spec)

Auth + RBAC · influencer/course/campaign management · versioned commercial
agreements (revenue share, percentage commission, fixed-per-sale, hybrid) ·
tracking links with click redirect + UTM · coupons · a modular attribution
engine (coupon-priority by default) · a standalone financial calculation
service with immutable per-transaction snapshots · refunds (full + partial,
proportional reversal) · the earnings ledger · payouts · admin + influencer
dashboards with date-range filters and charts · CSV exports · an
append-only audit log.

**Not built** (explicitly Phase 2 in the spec, or intentionally scoped out
of this pass — see `docs/ARCHITECTURE.md` for what each needs): the
marketing asset library, the leaderboard, email/WhatsApp notifications
(in-app notifications exist), automated payout provider integration, and a
real payment/LMS webhook integration (the order-ingestion abstraction is in
place — `src/lib/orders/process-order.ts` — but only the manual-entry path
is wired up; API/webhook/CSV-import adapters would call the same pipeline).
