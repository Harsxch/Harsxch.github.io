# Architecture

## 1. Stack

- **Next.js 16 (App Router, TypeScript)** — one deployable unit for UI + server logic. Server Components read data directly (no client-callable REST layer to guard for most reads); Server Actions handle writes. Both execute exclusively on the server, so there is no API surface for a malicious client to feed a forged influencer ID into — the two REST-style exceptions (CSV exports, the tracking-link redirect, `/api/auth/*`) are documented below.
- **PostgreSQL 16 via Prisma 7** — real transactions, constraints and indexes for money. `prisma/schema.prisma` is the single source of truth for the data model.
- **Auth.js v5 (NextAuth), credentials provider, JWT sessions** — no session table needed; the session JWT carries `role` and `influencerId`. Split into `auth.config.ts` (edge-safe, used by `middleware.ts`) and `auth.ts` (full config with the Prisma/bcrypt-backed `authorize()`, used everywhere else) because Next.js Edge Middleware cannot load Prisma's generated client (it needs `node:path`/`node:url`).
- **Tailwind CSS + Recharts** for a clean, data-focused SaaS UI.

## 2. Core relationship (spec section 2)

```
Influencer → CommercialAgreement (→ versions) → Campaign / Platform
  → TrackingLink / Coupon → Course → Order → OrderAttribution
  → FinancialTransaction (eligible revenue, influencer/company split)
  → Payout
```

Nothing is computed inline in a UI component. `src/lib/financial/` is the
only place money is calculated; `src/lib/attribution/` is the only place
attribution is resolved.

## 3. Commercial agreements & versioning

`CommercialAgreement` is a stable per-influencer identity; it never holds
terms. `CommercialAgreementVersion` rows hold the actual terms and are
**append-only** — `addAgreementVersion()` (`src/lib/financial/agreements.ts`)
never updates an existing version's terms. When a new version is added with
the same scope (same course/campaign set) as an existing `ACTIVE` version,
that old version is marked `SUPERSEDED` with `effectiveUntil` set to the day
before the new version's `effectiveFrom` — both rows remain forever.

**Scope resolution** (`src/lib/financial/resolve-agreement.ts`), highest
priority first:
1. An agreement version explicitly linked to the coupon used (`Coupon.agreementVersionId`).
2. A version scoped to the attributed campaign.
3. A version scoped to the order's course.
4. The influencer's general version (no course/campaign scope).

## 4. Financial calculation (spec sections 6–8, 18)

`src/lib/financial/calculate.ts` is a pure function: `(order money,
agreement terms) -> { eligibleRevenue, influencerAmount, companyAmount }`.
It has zero dependency on Prisma or Next.js, uses `decimal.js` throughout
(never floating-point `number` for money), and is unit-testable in
isolation.

**Eligible revenue default: `DISCOUNTED`** (the final amount the customer
paid, after any coupon discount, before refunds) — configurable per
agreement version via `eligibleRevenueBasis` (`GROSS` | `DISCOUNTED` |
`NET_OF_REFUND`), but `DISCOUNTED` is what new agreements default to. This
matches the spec's own worked example exactly (₹10,000 price, ₹2,000
discount, ₹8,000 paid → eligible revenue ₹8,000).

**Rounding**: influencer amount is rounded to 2dp (`ROUND_HALF_UP`);
company amount is always the *remainder* (`eligibleRevenue -
influencerAmount`), never computed independently — this guarantees the two
always sum exactly to eligible revenue, with no stray rounding cents.
`companySharePct` on a `REVENUE_SHARE` agreement is stored for display/audit
only and is not used in the calculation.

**Hybrid model limitation**: Phase 1 implements `HYBRID` as base
(revenue-share or commission %) + a flat bonus applied unconditionally.
Threshold-based bonuses ("+₹500 after 50 sales") need stateful evaluation
against cumulative sales at calculation time and are out of scope for this
pass — the schema does not block adding it later.

**Snapshotting**: every `FinancialTransaction` copies the agreement
version's terms into its own `*Snapshot` columns at calculation time. Later
agreement edits (i.e. new versions) never alter historical transactions —
verified by the seed data and `scripts/e2e-smoke.mjs`.

## 5. Refunds (spec section 8)

`createRefund()` (`src/lib/orders/process-order.ts`) never mutates the
original `EARNING` transaction's calculation fields. It:
1. Creates a `Refund` row (supports partial refunds; validates against the
   cumulative refunded amount so far).
2. Computes a proportional reversal (`src/lib/financial/reversal.ts`):
   `ratio = refundAmount / order.finalAmount`, applied to the *original*
   eligible revenue / influencer amount / company amount.
3. Creates a `REVERSAL`-type `FinancialTransaction` with **negative**
   amounts, linked to the original via `relatedTransactionId`.
4. On a *full* refund only, flips the original `EARNING` row's `status` to
   `REVERSED` (a partial refund leaves the original's lifecycle status
   alone — some of it is still legitimately owed).

Storing reversal amounts as negative numbers means a plain `SUM
(influencerAmount)` grouped by status gives the correct net balance
everywhere (dashboards, the ledger, payout eligibility) without any
type-aware sign branching scattered through the codebase.

## 6. Attribution (spec section 16)

`src/lib/attribution/strategies.ts` is an ordered list of strategies, each
`(input) -> match | null`, tried in order — first match wins. Default order:
**coupon before tracking link** (a coupon is explicit customer action at
checkout; a UTM parameter can be stale or shared). Reordering, adding
first-click/last-click logic, or adding a new source requires touching only
this one file, not `process-order.ts`.

### 6.1 Full UTM control and self-serve links

`TrackingLink` carries all five real-world UTM dimensions - source, medium,
campaign, content, **term** - plus an optional `couponId`. The public
redirect (`src/app/r/[code]/route.ts`) forwards every set dimension and, if
a coupon is attached, appends `couponCode` too - one shared link can both
track and auto-apply a discount at checkout, matching how these links are
actually built in production (a full UTM set + `couponCode` on a single
URL to an external checkout page).

Influencers can create their own links (`trackingLinks: INFLUENCER →
["read","write"]` in the RBAC matrix), not just admins. `createTrackingLink()`
never trusts a client-supplied `influencerId` for an INFLUENCER-role caller -
it's always overwritten with the caller's own session influencerId - and
additionally checks course access (`CourseInfluencer`) and coupon ownership
(a coupon can only be attached to a link if it belongs to that same
influencer) before creating anything. `setTrackingLinkStatus()` re-checks
row ownership on every call for the same reason.

The admin Sales Tracking page (the influencer's equivalent "My Sales" page
was removed in the later platform simplification down to two roles +
Sales Tracking) exposes a shared filter bar
(`src/components/filters/sales-filter-bar.tsx`) across course, campaign,
coupon code, date range, and every UTM dimension.
`listOrders()` only adds the `attribution.trackingLink` sub-filter when at
least one UTM param is actually requested - otherwise it would wrongly
exclude every coupon-only-attributed order, which has no tracking link at
all. The CSV export endpoint accepts and forwards the identical filter set.

## 7. RBAC & row-level scoping (spec sections 9, 34)

Two independent layers, both server-side, both required:

1. **Resource-level**: `src/lib/auth/rbac.ts` is a `{resource: {role:
   [actions]}}` matrix. `assertCan(role, resource, action)` throws
   `ForbiddenError` (→ HTTP 403 or a thrown Server Action error) if the
   role lacks the permission.
2. **Row-level**: every data function scoped to a specific influencer calls
   `resolveInfluencerScope()` or `assertOwnInfluencerScope()`
   (`src/lib/auth/session.ts`) **first**, before running any query. For an
   `INFLUENCER`-role caller, this *always* substitutes their own
   `influencerId` from the session — a client-supplied ID is never trusted.
   This is what stops an influencer from reading another influencer's data
   by editing an ID; verified by `scripts/e2e-smoke.mjs` (redirect check)
   and by the fact that no influencer-facing route takes another
   influencer's ID as a URL parameter in the first place — there is no ID
   to tamper with.

`middleware.ts` adds a coarse, fast-path gate (unauthenticated → `/login`;
wrong role for `/admin` or `/influencer` → redirect) purely as
defense-in-depth and UX; the real enforcement is the two layers above,
which run on every data access regardless of how it's reached.

## 8. Order ingestion (spec section 33)

`src/lib/orders/process-order.ts` exposes `createManualOrder()` and
`createRefund()` as the ORDER_CREATED+ORDER_PAID and ORDER_REFUNDED event
handlers. Only the manual-entry adapter (an admin form) is wired up in this
pass; a future API/webhook/CSV-import adapter would validate its payload
and call the same two functions — the attribution and financial engines are
payment-provider agnostic already.

## 9. Audit log (spec section 31)

`src/lib/audit/log.ts` is the single write path (`prisma.auditLog.create`)
used by every mutation. The Prisma model has no update/delete exposed
anywhere in the app layer — it is append-only by construction, not just by
convention.

## 10. Scalability notes (spec section 35)

- Every list query is paginated server-side (`skip`/`take`); nothing loads
  an unbounded result set into the browser.
- Dashboard aggregates use grouped SQL (`groupBy`, raw `SUM`/`COUNT`) rather
  than fetching rows and reducing in JavaScript.
- Tracking-link and coupon "sales/revenue/earnings" figures are computed via
  join/aggregate queries at read time, not denormalized counters — this
  trades a bit of read cost for eliminating an entire class of
  counter-drift bugs. `clicks` is the one genuine denormalized counter
  (incremented by the public redirect route), because it isn't derivable
  from the order/transaction tables.
- Indexes are declared on every foreign key and every field used in a
  `WHERE`/`ORDER BY` in the data-access layer (see `schema.prisma`).
- CSV exports currently fetch up to 10,000 rows per request via the normal
  Prisma query layer. At very large scale (the spec's "millions of orders"
  horizon) this should move to a background job that streams to storage and
  emails/links the result, rather than a synchronous request — flagged here
  rather than built speculatively for the 10–1,000-influencer near term the
  spec actually asks for.

## 11. What Phase 1 deliberately does not include

Marketing asset library, leaderboard, email/WhatsApp notification delivery
(in-app notifications exist and are written by every relevant mutation),
automated payout-provider integration (payouts are tracked and
status-transitioned, but no bank/UPI API is called), and a real
payment/LMS webhook (the abstraction point exists; only the manual-entry
adapter is implemented). These are all Phase 2 per the spec's own MVP plan
(section 41) and the schema does not block adding any of them.
