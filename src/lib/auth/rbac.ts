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
 */
const MATRIX: Record<Resource, Partial<Record<Role, Action[]>>> = {
  influencers: {
    SUPER_ADMIN: ["read", "write"],
    INFLUENCER_MANAGER: ["read", "write"],
    FINANCE: ["read"],
    ANALYST: ["read"],
    INFLUENCER: ["read"], // own record only
  },
  courses: {
    SUPER_ADMIN: ["read", "write"],
    INFLUENCER_MANAGER: ["read", "write"],
    FINANCE: ["read"],
    ANALYST: ["read"],
    INFLUENCER: ["read"], // assigned courses only
  },
  campaigns: {
    SUPER_ADMIN: ["read", "write"],
    INFLUENCER_MANAGER: ["read", "write"],
    FINANCE: ["read"],
    ANALYST: ["read"],
    INFLUENCER: ["read"],
  },
  trackingLinks: {
    SUPER_ADMIN: ["read", "write"],
    INFLUENCER_MANAGER: ["read", "write"],
    ANALYST: ["read"],
    INFLUENCER: ["read", "write"], // self-serve: can create/view own links only, enforced in createTrackingLink
  },
  coupons: {
    SUPER_ADMIN: ["read", "write"],
    INFLUENCER_MANAGER: ["read", "write"],
    FINANCE: ["read"],
    ANALYST: ["read"],
    INFLUENCER: ["read"], // own coupons only
  },
  agreements: {
    SUPER_ADMIN: ["read", "write"],
    FINANCE: ["read", "write"],
    INFLUENCER_MANAGER: ["read"],
    ANALYST: ["read"],
    INFLUENCER: ["read"], // own agreement only
  },
  orders: {
    SUPER_ADMIN: ["read", "write"],
    FINANCE: ["read", "write"],
    INFLUENCER_MANAGER: ["read"],
    ANALYST: ["read"],
    INFLUENCER: ["read"], // own attributed orders only, PII stripped
  },
  refunds: {
    SUPER_ADMIN: ["read", "write"],
    FINANCE: ["read", "write"],
    ANALYST: ["read"],
  },
  transactions: {
    SUPER_ADMIN: ["read", "write"],
    FINANCE: ["read", "write"],
    INFLUENCER_MANAGER: ["read"],
    ANALYST: ["read"],
    INFLUENCER: ["read"], // own ledger only
  },
  payouts: {
    SUPER_ADMIN: ["read", "write"],
    FINANCE: ["read", "write"],
    ANALYST: ["read"],
    INFLUENCER: ["read"], // own payouts only
  },
  assets: {
    SUPER_ADMIN: ["read", "write"],
    INFLUENCER_MANAGER: ["read", "write"],
    ANALYST: ["read"],
    INFLUENCER: ["read"], // assigned assets only
  },
  goals: {
    SUPER_ADMIN: ["read", "write"],
    INFLUENCER_MANAGER: ["read", "write"],
    ANALYST: ["read"],
    INFLUENCER: ["read"], // own goals only
  },
  analytics: {
    SUPER_ADMIN: ["read"],
    FINANCE: ["read"],
    INFLUENCER_MANAGER: ["read"],
    ANALYST: ["read"],
    INFLUENCER: ["read"], // own dashboard only - row scoping enforced in getInfluencerDashboard
  },
  auditLogs: {
    SUPER_ADMIN: ["read"],
    FINANCE: ["read"],
  },
  users: {
    SUPER_ADMIN: ["read", "write"],
  },
  exports: {
    SUPER_ADMIN: ["read"],
    FINANCE: ["read"],
    INFLUENCER_MANAGER: ["read"],
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
