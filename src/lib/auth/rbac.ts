import { Role } from "@/generated/prisma/enums";

export { Role };

export type Resource =
  | "influencers"
  | "courses"
  | "campaigns"
  | "trackingLinks"
  | "coupons"
  | "agreements"
  | "orders"
  | "refunds"
  | "transactions"
  | "payouts"
  | "assets"
  | "goals"
  | "analytics"
  | "auditLogs"
  | "users"
  | "exports";

type Action = "read" | "write";

/**
 * Resource-level permission matrix. This is the first gate. It does NOT
 * cover row-level scoping (e.g. an INFLUENCER must only ever see their own
 * rows) - that is enforced separately by requireOwnInfluencerScope() and by
 * every data-access function filtering on the caller's influencerId. Never
 * trust an ID that arrives from the client for an INFLUENCER-role caller.
 *
 * Only two roles exist: ADMIN (full access - the former SUPER_ADMIN,
 * FINANCE, INFLUENCER_MANAGER, and ANALYST roles were collapsed into this
 * one role, since the product no longer distinguishes back-office
 * functions) and INFLUENCER (restricted to their own data, row-scoped).
 */
const MATRIX: Record<Resource, Partial<Record<Role, Action[]>>> = {
  influencers: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read"], // own record only
  },
  courses: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read"], // assigned courses only
  },
  campaigns: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read"],
  },
  trackingLinks: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read", "write"], // self-serve: can create/view own links only, enforced in createTrackingLink
  },
  coupons: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read"], // own coupons only
  },
  agreements: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read"], // own agreement only
  },
  orders: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read"], // own attributed orders only, PII stripped
  },
  refunds: {
    ADMIN: ["read", "write"],
  },
  transactions: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read"], // own ledger only
  },
  payouts: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read"], // own payouts only
  },
  assets: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read"], // assigned assets only
  },
  goals: {
    ADMIN: ["read", "write"],
    INFLUENCER: ["read"], // own goals only
  },
  analytics: {
    ADMIN: ["read"],
    INFLUENCER: ["read"], // own dashboard only - row scoping enforced in getInfluencerDashboard
  },
  auditLogs: {
    ADMIN: ["read"],
  },
  users: {
    ADMIN: ["read", "write"],
  },
  exports: {
    ADMIN: ["read"],
  },
};

export function can(role: Role, resource: Resource, action: Action): boolean {
  const actions = MATRIX[resource]?.[role];
  return actions ? actions.includes(action) : false;
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export function assertCan(role: Role, resource: Resource, action: Action) {
  if (!can(role, resource, action)) {
    throw new ForbiddenError(`Role ${role} cannot ${action} ${resource}`);
  }
}
