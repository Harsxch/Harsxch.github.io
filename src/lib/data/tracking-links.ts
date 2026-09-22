import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession, resolveInfluencerScope } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { BadRequestError } from "@/lib/api/handler";

export async function listTrackingLinks(params: { influencerId?: string } = {}) {
  const session = await requireSession();
  assertCan(session.user.role, "trackingLinks", "read");
  const influencerId = resolveInfluencerScope(session.user, params.influencerId);

  const links = await prisma.trackingLink.findMany({
    where: influencerId ? { influencerId } : {},
    include: { influencer: { select: { name: true } }, course: true, platform: true, campaign: true },
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

export async function createTrackingLink(
  input: {
    influencerId: string;
    courseId: string;
    platformId: string;
    campaignId?: string;
    content?: string;
    utmSource: string;
    utmCampaign: string;
    utmContent: string;
  },
  actor: { id: string; email: string }
) {
  const session = await requireSession();
  assertCan(session.user.role, "trackingLinks", "write");

  const [influencer, course] = await Promise.all([
    prisma.influencer.findUnique({ where: { id: input.influencerId } }),
    prisma.course.findUnique({ where: { id: input.courseId } }),
  ]);
  if (!influencer) throw new BadRequestError("Influencer not found");
  if (!course) throw new BadRequestError("Course not found");

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
      influencerId: input.influencerId,
      courseId: input.courseId,
      platformId: input.platformId,
      campaignId: input.campaignId,
      content: input.content,
      utmSource: input.utmSource,
      utmMedium: "influencer",
      utmCampaign: input.utmCampaign,
      utmContent: input.utmContent,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      userEmail: actor.email,
      action: "TRACKING_LINK_CREATED",
      entityType: "TrackingLink",
      entityId: link.id,
      newValue: { code: link.code, influencerId: input.influencerId, courseId: input.courseId },
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
