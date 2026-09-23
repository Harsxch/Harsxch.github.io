import "server-only";
import { requireSession } from "@/lib/auth/session";
import { ForbiddenError } from "@/lib/auth/rbac";
import { salesTrackingAdapter } from "./index";
import type { InfluencerIdentity, SalesFilters } from "./types";

/**
 * The ONLY place an influencer's identity is resolved for this feature -
 * always from the server session, never from a request parameter. This is
 * what makes it structurally impossible for an influencer to retrieve
 * another influencer's sales by editing an ID: there is no ID for them to
 * edit in the first place.
 */
async function resolveIdentity(): Promise<InfluencerIdentity> {
  const session = await requireSession();
  if (session.user.role !== "INFLUENCER" || !session.user.influencerId) {
    throw new ForbiddenError("Sales Tracking is only available to influencer accounts");
  }
  return {
    influencerId: session.user.influencerId,
    email: session.user.email,
    name: session.user.name,
  };
}

export async function getSalesTrackingFilterOptions() {
  const identity = await resolveIdentity();
  return salesTrackingAdapter.getFilterOptions(identity);
}

export async function getSalesTrackingData(filters: SalesFilters) {
  const identity = await resolveIdentity();
  return salesTrackingAdapter.getSales(identity, filters);
}
