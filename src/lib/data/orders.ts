import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession, resolveInfluencerScope, assertOwnInfluencerScope } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import type { OrderStatus } from "@/generated/prisma/enums";

export interface OrderFilters {
  influencerId?: string;
  courseId?: string;
  campaignId?: string;
  status?: OrderStatus;
  from?: Date;
  to?: Date;
  couponCode?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  page?: number;
  pageSize?: number;
}

export async function listOrders(params: OrderFilters) {
  const session = await requireSession();
  assertCan(session.user.role, "orders", "read");
  const influencerId = resolveInfluencerScope(session.user, params.influencerId);

  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 25, 100);

  // UTM dimensions only ever live on the TrackingLink an order was
  // attributed through - only add this nested filter when at least one is
  // actually requested, otherwise it would wrongly exclude every
  // coupon-only-attributed order (no tracking link at all).
  const utmFilters = {
    ...(params.utmSource ? { utmSource: params.utmSource } : {}),
    ...(params.utmMedium ? { utmMedium: params.utmMedium } : {}),
    ...(params.utmCampaign ? { utmCampaign: params.utmCampaign } : {}),
    ...(params.utmContent ? { utmContent: params.utmContent } : {}),
    ...(params.utmTerm ? { utmTerm: params.utmTerm } : {}),
  };
  const hasUtmFilter = Object.keys(utmFilters).length > 0;

  const where = {
    ...(params.courseId ? { courseId: params.courseId } : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.couponCode ? { coupon: { code: params.couponCode.toUpperCase().trim() } } : {}),
    ...(params.from || params.to
      ? { placedAt: { ...(params.from ? { gte: params.from } : {}), ...(params.to ? { lte: params.to } : {}) } }
      : {}),
    ...(influencerId || params.campaignId || hasUtmFilter
      ? {
          attribution: {
            ...(influencerId ? { influencerId } : {}),
            ...(params.campaignId ? { campaignId: params.campaignId } : {}),
            ...(hasUtmFilter ? { trackingLink: utmFilters } : {}),
          },
        }
      : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        course: { select: { name: true } },
        coupon: { select: { code: true } },
        attribution: {
          include: {
            influencer: { select: { id: true, name: true } },
            campaign: true,
            trackingLink: { select: { code: true, utmSource: true, utmMedium: true, utmCampaign: true, utmContent: true, utmTerm: true } },
          },
        },
        transactions: { where: { type: "EARNING" } },
        // Never include `customer` for INFLUENCER role - PII must not leak
        // (spec section 17). Admin roles get it via getOrderDetail instead.
      },
      orderBy: { placedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  const isInfluencer = session.user.role === "INFLUENCER";

  return {
    rows: rows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      placedAt: o.placedAt,
      courseName: o.course.name,
      couponCode: o.coupon?.code ?? null,
      influencerName: o.attribution?.influencer?.name ?? null,
      campaignName: o.attribution?.campaign?.name ?? null,
      trackingLinkCode: o.attribution?.trackingLink?.code ?? null,
      utmSource: o.attribution?.trackingLink?.utmSource ?? null,
      utmMedium: o.attribution?.trackingLink?.utmMedium ?? null,
      utmCampaign: o.attribution?.trackingLink?.utmCampaign ?? null,
      utmContent: o.attribution?.trackingLink?.utmContent ?? null,
      utmTerm: o.attribution?.trackingLink?.utmTerm ?? null,
      originalPrice: o.originalPrice.toString(),
      discountAmount: o.discountAmount.toString(),
      finalAmount: o.finalAmount.toString(),
      eligibleRevenue: o.transactions[0]?.eligibleRevenue.toString() ?? null,
      influencerAmount: o.transactions[0]?.influencerAmount.toString() ?? null,
      companyAmount: isInfluencer ? null : (o.transactions[0]?.companyAmount.toString() ?? null),
      status: o.status,
      payoutStatus: o.transactions[0]?.status ?? null,
    })),
    total,
    page,
    pageSize,
  };
}

export async function getOrderDetail(orderId: string) {
  const session = await requireSession();
  assertCan(session.user.role, "orders", "read");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      course: true,
      coupon: true,
      customer: true,
      attribution: { include: { influencer: true, trackingLink: true, campaign: true } },
      transactions: { include: { agreementVersion: true }, orderBy: { createdAt: "asc" } },
      refunds: true,
    },
  });
  if (!order) return null;

  if (session.user.role === "INFLUENCER") {
    assertOwnInfluencerScope(session.user, order.attribution?.influencerId ?? "__none__");
    // Strip customer PII for influencers even though they're authorized to
    // see the order itself (spec section 17).
    return { ...order, customer: null, transactions: order.transactions.map((t) => ({ ...t, companyAmount: null })) };
  }

  return order;
}
