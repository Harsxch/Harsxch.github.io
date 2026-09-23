import { prisma } from "@/lib/prisma";
import type { CommercialAgreementVersion } from "@/generated/prisma/client";

/**
 * Resolves which single CommercialAgreementVersion applies to a given sale.
 *
 * Priority (highest wins), per spec section 3 ("campaign-specific overrides
 * normal agreement", "course-specific agreements"):
 *   1. An agreement version explicitly linked to the coupon that was used
 *      (Coupon.agreementVersionId) - the most specific override possible.
 *   2. A version scoped to the attributed campaign.
 *   3. A version scoped to the order's course.
 *   4. The influencer's general version (no course/campaign scope at all).
 *
 * Within a priority tier, only ACTIVE versions whose [effectiveFrom,
 * effectiveUntil) window covers `asOf` are eligible; ties break on highest
 * version number.
 *
 * Returns null when nothing matches - callers must treat this as a data
 * problem to surface (e.g. flag the transaction for manual review), never
 * silently fall back to "no earnings".
 */
export async function resolveAgreementVersion(params: {
  influencerId: string;
  courseId: string;
  campaignId: string | null;
  couponAgreementVersionId: string | null;
  asOf: Date;
}): Promise<CommercialAgreementVersion | null> {
  if (params.couponAgreementVersionId) {
    const version = await prisma.commercialAgreementVersion.findFirst({
      where: {
        id: params.couponAgreementVersionId,
        agreement: { influencerId: params.influencerId },
        status: "ACTIVE",
        effectiveFrom: { lte: params.asOf },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: params.asOf } }],
      },
    });
    if (version) return version;
  }

  const baseWhere = {
    agreement: { influencerId: params.influencerId },
    status: "ACTIVE" as const,
    effectiveFrom: { lte: params.asOf },
    OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: params.asOf } }],
  };

  if (params.campaignId) {
    const version = await prisma.commercialAgreementVersion.findFirst({
      where: { ...baseWhere, campaignScopes: { some: { campaignId: params.campaignId } } },
      orderBy: { version: "desc" },
    });
    if (version) return version;
  }

  const courseVersion = await prisma.commercialAgreementVersion.findFirst({
    where: { ...baseWhere, courseScopes: { some: { courseId: params.courseId } } },
    orderBy: { version: "desc" },
  });
  if (courseVersion) return courseVersion;

  const generalVersion = await prisma.commercialAgreementVersion.findFirst({
    where: { ...baseWhere, courseScopes: { none: {} }, campaignScopes: { none: {} } },
    orderBy: { version: "desc" },
  });
  return generalVersion;
}
