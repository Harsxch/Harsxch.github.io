import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession, resolveInfluencerScope, assertOwnInfluencerScope } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { BadRequestError, NotFoundError } from "@/lib/api/handler";

export async function listTrackingLinks(params: { influencerId?: string } = {}) {
  const session = await requireSession();
  assertCan(session.user.role, "trackingLinks", "read");
  const influencerId = resolveInfluencerScope(session.user, params.influencerId);

  const links = await prisma.trackingLink.findMany({
    where: influencerId ? { influencerId } : {},
    include: {
      influencer: { select: { name: true } },
      course: true,
      platform: true,
      campaign: true,
      coupon: { select: { code: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Sales/revenue/earnings are computed via aggregation (never denormalized
  // counters) so they can never drift from the ledger.
  const attributions = await prisma.orderAttribution.groupBy({
    by: ["trackingLinkId"],
    where: { trackingLinkId: { in: links.map((l) => l.id) } },
    _count: { _all: true },
  });
  const countByLink = new Map(attributions.map((a) => [a.trackingLinkId, a._count._all]));

  const orderTotals = await prisma.$queryRaw<{ trackingLinkId: string; revenue: string; earnings: string }[]>`
    SELECT oa."trackingLinkId" as "trackingLinkId",
           COALESCE(SUM(o."finalAmount"), 0)::text as revenue,
           COALESCE(SUM(ft."influencerAmount"), 0)::text as earnings
    FROM "OrderAttribution" oa
    JOIN "Order" o ON o.id = oa."orderId"
    LEFT JOIN "FinancialTransaction" ft ON ft."orderId" = o.id
    WHERE oa."trackingLinkId" IS NOT NULL AND o.status != 'CANCELLED'
    GROUP BY oa."trackingLinkId"
  `;
  const totalsByLink = new Map(orderTotals.map((t) => [t.trackingLinkId, t]));

  return links.map((link) => ({
    ...link,
    sales: countByLink.get(link.id) ?? 0,
    revenue: totalsByLink.get(link.id)?.revenue ?? "0",
    earnings: totalsByLink.get(link.id)?.earnings ?? "0",
  }));
}

/**
 * Self-serve for influencers, full control for admins. An INFLUENCER caller
 * can never create a link for anyone but themselves - `input.influencerId`
 * is ignored entirely for that role and replaced with their own session
 * influencerId, the same pattern used everywhere else in this codebase to
 * stop an ID in a request from crossing into someone else's data.
 */
export async function createTrackingLink(
  input: {
    influencerId: string;
    courseId: string;
    platformId: string;
    campaignId?: string;
    couponId?: string;
    content?: string;
    utmSource: string;
    utmMedium?: string;
    utmCampaign: string;
    utmContent: string;
    utmTerm?: string;
  },
  actor: { id: string; email: string }
) {
  const session = await requireSession();
  assertCan(session.user.role, "trackingLinks", "write");

  const influencerId = session.user.role === "INFLUENCER" ? session.user.influencerId! : input.influencerId;

  const [influencer, course] = await Promise.all([
    prisma.influencer.findUnique({ where: { id: influencerId } }),
    prisma.course.findUnique({ where: { id: input.courseId } }),
  ]);
  if (!influencer) throw new BadRequestError("Influencer not found");
  if (!course) throw new BadRequestError("Course not found");

  if (session.user.role === "INFLUENCER") {
    const hasAccess = await prisma.courseInfluencer.findUnique({
      where: { courseId_influencerId: { courseId: input.courseId, influencerId } },
    });
    if (!hasAccess) throw new BadRequestError("You don't have access to promote this course");
  }

  if (input.couponId) {
    const coupon = await prisma.coupon.findUnique({ where: { id: input.couponId } });
    if (!coupon || coupon.influencerId !== influencerId) {
      throw new BadRequestError("That coupon does not belong to this influencer");
    }
  }

  const slugify = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  let code = `${slugify(influencer.name)}-${slugify(course.name)}-${slugify(input.content ?? input.utmContent)}`;
  const existing = await prisma.trackingLink.count({ where: { code: { startsWith: code } } });
  if (existing > 0) code = `${code}-${existing + 1}`;

  const link = await prisma.trackingLink.create({
    data: {
      code,
      influencerId,
      courseId: input.courseId,
      platformId: input.platformId,
      campaignId: input.campaignId,
      couponId: input.couponId,
      content: input.content,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium || "influencer",
      utmCampaign: input.utmCampaign,
      utmContent: input.utmContent,
      utmTerm: input.utmTerm,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      userEmail: actor.email,
      action: "TRACKING_LINK_CREATED",
      entityType: "TrackingLink",
      entityId: link.id,
      newValue: { code: link.code, influencerId, courseId: input.courseId },
    },
  });

  return link;
}

export async function setTrackingLinkStatus(
  linkId: string,
  status: "ACTIVE" | "DISABLED",
  actor: { id: string; email: string }
) {
  const session = await requireSession();
  assertCan(session.user.role, "trackingLinks", "write");

  const existing = await prisma.trackingLink.findUnique({ where: { id: linkId } });
  if (!existing) throw new NotFoundError("Tracking link not found");
  // Row-level check: an influencer can only toggle their own links, even
  // though the resource-level RBAC check above already passed.
  assertOwnInfluencerScope(session.user, existing.influencerId);

  const link = await prisma.trackingLink.update({ where: { id: linkId }, data: { status } });
  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      userEmail: actor.email,
      action: "TRACKING_LINK_STATUS_CHANGED",
      entityType: "TrackingLink",
      entityId: link.id,
      newValue: { status },
    },
  });
  return link;
}

/** Public - called from the redirect route, no session required. Increments
 * the click counter, the one genuinely event-driven counter in the schema. */
export async function recordTrackingLinkClick(code: string) {
  await prisma.trackingLink.updateMany({ where: { code, status: "ACTIVE" }, data: { clicks: { increment: 1 } } });
}
