import { auth } from "./auth";
import { ForbiddenError } from "./rbac";

export class UnauthenticatedError extends Error {
  constructor() {
    super("Not authenticated");
    this.name = "UnauthenticatedError";
  }
}

/**
 * The ONLY source of truth for "who is calling this API route". Never trust
 * an influencerId, userId or role passed in a request body or query string -
 * always re-derive identity from the session on the server.
 */
export async function requireSession() {
  const session = await auth();
  if (!session?.user) throw new UnauthenticatedError();
  return session;
}

/**
 * Resolves which influencerId a request is allowed to read/write for.
 *
 * - INFLUENCER role: ALWAYS forced to their own influencerId, regardless of
 *   what the client requested. This is the control that stops an influencer
 *   from reading another influencer's data by editing an ID in the URL.
 * - Any other role: the requested influencerId is honoured (subject to the
 *   resource-level RBAC check happening separately).
 */
export function resolveInfluencerScope(
  sessionUser: { role: string; influencerId: string | null },
  requestedInfluencerId: string | null | undefined
): string | null {
  if (sessionUser.role === "INFLUENCER") {
    return sessionUser.influencerId;
  }
  return requestedInfluencerId ?? null;
}

/**
 * Hard gate for any function that reads/writes a specific influencer's data.
 * Throws if an INFLUENCER-role caller requests an influencerId that is not
 * their own - this is the actual enforcement point for "an influencer must
 * never access another influencer's data by editing an ID" (spec section 9).
 * Call this FIRST in every influencer-scoped data function, before running
 * any query.
 */
export function assertOwnInfluencerScope(
  sessionUser: { role: string; influencerId: string | null },
  requestedInfluencerId: string
) {
  if (sessionUser.role === "INFLUENCER" && sessionUser.influencerId !== requestedInfluencerId) {
    throw new ForbiddenError("Cannot access another influencer's data");
  }
}
