import { prisma } from "@/lib/prisma";
import type { AttributionStrategy } from "./types";

/**
 * Coupon codes are explicit customer action (typed at checkout), whereas a
 * tracking-link UTM can be stale, shared, or overwritten by a later click.
 * Default priority is therefore coupon-first (spec section 16 lists this as
 * one of the possible rules; MVP picks it as the sensible default).
 */
export const couponStrategy: AttributionStrategy = {
  name: "coupon",
  async resolve(input) {
    if (!input.couponCode) return null;
    const coupon = await prisma.coupon.findUnique({
      where: { code: input.couponCode.toUpperCase().trim() },
    });
    if (!coupon) return null;
    return {
      influencerId: coupon.influencerId,
      trackingLinkId: null,
      couponId: coupon.id,
      campaignId: null,
      source: "COUPON",
    };
  },
};

export const trackingLinkStrategy: AttributionStrategy = {
  name: "tracking_link",
  async resolve(input) {
    if (!input.trackingLinkCode) return null;
    const link = await prisma.trackingLink.findUnique({
      where: { code: input.trackingLinkCode },
    });
    if (!link) return null;
    return {
      influencerId: link.influencerId,
      trackingLinkId: link.id,
      couponId: null,
      campaignId: link.campaignId,
      source: "TRACKING_LINK",
    };
  },
};

/**
 * Ordered attribution pipeline. Swap the order, add a strategy (first-click,
 * last-click across multiple touches, etc.) or remove one without touching
 * order-processing code elsewhere.
 */
export const attributionPipeline: AttributionStrategy[] = [couponStrategy, trackingLinkStrategy];

export async function resolveAttribution(input: {
  couponCode?: string | null;
  trackingLinkCode?: string | null;
}) {
  for (const strategy of attributionPipeline) {
    const match = await strategy.resolve(input);
    if (match) return match;
  }
  return null;
}
