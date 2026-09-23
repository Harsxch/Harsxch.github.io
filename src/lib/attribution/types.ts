import type { AttributionSource } from "@/generated/prisma/enums";

export interface AttributionInput {
  couponCode?: string | null;
  trackingLinkCode?: string | null;
}

export interface AttributionMatch {
  influencerId: string;
  trackingLinkId: string | null;
  couponId: string | null;
  campaignId: string | null;
  source: AttributionSource;
}

export interface AttributionStrategy {
  name: string;
  resolve(input: AttributionInput): Promise<AttributionMatch | null>;
}
