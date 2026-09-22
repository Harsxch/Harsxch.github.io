import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession, resolveInfluencerScope } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";

export interface DateRange {
  from: Date;
  to: Date;
}

export async function getAdminDashboard(range: DateRange) {
  const session = await requireSession();
  assertCan(session.user.role, "analytics", "read");

  const [
    totalInfluencers,
    activeInfluencers,
    orderAgg,
    earningAgg,
    pendingPayoutAgg,
    paidPayoutAgg,
    topInfluencers,
    recentOrders,
    recentRefunds,
    salesByCourse,
    revenueByPlatform,
    revenueOverTime,
  ] = await Promise.all([
    prisma.influencer.count(),
    prisma.influencer.count({ where: { status: "ACTIVE" } }),
    prisma.order.aggregate({
      where: { placedAt: { gte: range.from, lte: range.to }, status: { not: "CANCELLED" } },
      _count: { _all: true },
      _sum: { finalAmount: true },
    }),
    prisma.financialTransaction.aggregate({
      where: { createdAt: { gte: range.from, lte: range.to } },
      _sum: { influencerAmount: true, companyAmount: true },
    }),
    // Grouped per influencer and clamped at zero before summing: a refund
    // reversal on one influencer can never offset what's owed to another,
    // so a naive global SUM can go negative even though nobody is actually
    // owed a negative amount. See getPayoutablesByInfluencer for the same
    // per-influencer logic used when actually creating payouts.
    prisma.financialTransaction
      .groupBy({
        by: ["influencerId"],
        where: { payoutId: null, OR: [{ type: "EARNING", status: "APPROVED" }, { type: "REVERSAL", status: "REVERSED" }] },
        _sum: { influencerAmount: true },
      })
      .then((rows) => rows.reduce((sum, r) => sum + Math.max(0, Number(r._sum.influencerAmount ?? 0)), 0)),
    prisma.payout.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.$queryRaw<{ influencerId: string; name: string; sales: string; revenue: string; earnings: string }[]>`
      WITH order_stats AS (
        SELECT oa."influencerId" as influencer_id, COUNT(o.id) as sales, COALESCE(SUM(o."finalAmount"), 0) as revenue
        FROM "OrderAttribution" oa
        JOIN "Order" o ON o.id = oa."orderId"
        WHERE oa."influencerId" IS NOT NULL
          AND o."placedAt" BETWEEN ${range.from} AND ${range.to}
          AND o.status != 'CANCELLED'
        GROUP BY oa."influencerId"
      ),
      earning_stats AS (
        SELECT "influencerId" as influencer_id, COALESCE(SUM("influencerAmount"), 0) as earnings
        FROM "FinancialTransaction"
        WHERE "createdAt" BETWEEN ${range.from} AND ${range.to}
        GROUP BY "influencerId"
      )
      SELECT i.id as "influencerId", i.name,
             COALESCE(os.sales, 0)::text as sales,
             COALESCE(os.revenue, 0)::text as revenue,
             COALESCE(es.earnings, 0)::text as earnings
      FROM "Influencer" i
      JOIN order_stats os ON os.influencer_id = i.id
      LEFT JOIN earning_stats es ON es.influencer_id = i.id
      ORDER BY revenue DESC
      LIMIT 10
    `,
    prisma.order.findMany({
      where: { placedAt: { gte: range.from, lte: range.to } },
      include: { course: { select: { name: true } }, attribution: { include: { influencer: { select: { name: true } } } } },
      orderBy: { placedAt: "desc" },
      take: 10,
    }),
    prisma.refund.findMany({
      where: { refundedAt: { gte: range.from, lte: range.to } },
      include: { order: { select: { orderNumber: true, courseId: true } } },
      orderBy: { refundedAt: "desc" },
      take: 10,
    }),
    prisma.$queryRaw<{ courseName: string; sales: string; revenue: string }[]>`
      SELECT c.name as "courseName", COUNT(o.id)::text as sales, COALESCE(SUM(o."finalAmount"), 0)::text as revenue
      FROM "Order" o
      JOIN "Course" c ON c.id = o."courseId"
      WHERE o."placedAt" BETWEEN ${range.from} AND ${range.to} AND o.status != 'CANCELLED'
      GROUP BY c.name
      ORDER BY revenue DESC
    `,
    prisma.$queryRaw<{ platformName: string; revenue: string }[]>`
      SELECT p.name as "platformName", COALESCE(SUM(o."finalAmount"), 0)::text as revenue
      FROM "Order" o
      JOIN "OrderAttribution" oa ON oa."orderId" = o.id
      JOIN "TrackingLink" tl ON tl.id = oa."trackingLinkId"
      JOIN "Platform" p ON p.id = tl."platformId"
      WHERE o."placedAt" BETWEEN ${range.from} AND ${range.to} AND o.status != 'CANCELLED'
      GROUP BY p.name
    `,
    prisma.$queryRaw<{ day: string; revenue: string; sales: string }[]>`
      SELECT to_char(date_trunc('day', o."placedAt"), 'YYYY-MM-DD') as day,
             COALESCE(SUM(o."finalAmount"), 0)::text as revenue,
             COUNT(*)::text as sales
      FROM "Order" o
      WHERE o."placedAt" BETWEEN ${range.from} AND ${range.to} AND o.status != 'CANCELLED'
      GROUP BY 1
      ORDER BY 1
    `,
  ]);

  return {
    kpis: {
      totalInfluencers,
      activeInfluencers,
      totalSales: orderAgg._count._all,
      totalRevenue: (orderAgg._sum.finalAmount ?? 0).toString(),
      totalInfluencerEarnings: (earningAgg._sum.influencerAmount ?? 0).toString(),
      companyRetainedRevenue: (earningAgg._sum.companyAmount ?? 0).toString(),
      pendingPayouts: pendingPayoutAgg.toFixed(2),
      paidPayouts: (paidPayoutAgg._sum.amount ?? 0).toString(),
    },
    topInfluencers,
    recentOrders,
    recentRefunds,
    salesByCourse,
    revenueByPlatform,
    revenueOverTime,
  };
}

export async function getInfluencerDashboard(influencerId: string, range: DateRange) {
  const session = await requireSession();
  assertCan(session.user.role, "analytics", "read");
  const scopedId = resolveInfluencerScope(session.user, influencerId);
  if (!scopedId) throw new Error("No influencer scope resolved");

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [salesToday, salesWeek, salesMonth, salesTotal, revenueAgg, balance, courseWise, platformWise, timeSeries] =
    await Promise.all([
      prisma.order.count({
        where: { attribution: { influencerId: scopedId }, placedAt: { gte: startOfToday }, status: { not: "CANCELLED" } },
      }),
      prisma.order.count({
        where: { attribution: { influencerId: scopedId }, placedAt: { gte: startOfWeek }, status: { not: "CANCELLED" } },
      }),
      prisma.order.count({
        where: { attribution: { influencerId: scopedId }, placedAt: { gte: startOfMonth }, status: { not: "CANCELLED" } },
      }),
      prisma.order.count({ where: { attribution: { influencerId: scopedId }, status: { not: "CANCELLED" } } }),
      prisma.order.aggregate({
        where: {
          attribution: { influencerId: scopedId },
          placedAt: { gte: range.from, lte: range.to },
          status: { not: "CANCELLED" },
        },
        _sum: { finalAmount: true },
        _count: { _all: true },
      }),
      prisma.financialTransaction.groupBy({
        by: ["status"],
        where: { influencerId: scopedId },
        _sum: { influencerAmount: true },
      }),
      prisma.$queryRaw<{ courseName: string; sales: string; revenue: string; earnings: string }[]>`
        SELECT c.name as "courseName", COUNT(o.id)::text as sales, COALESCE(SUM(o."finalAmount"), 0)::text as revenue,
               COALESCE(SUM(ft."influencerAmount"), 0)::text as earnings
        FROM "Order" o
        JOIN "Course" c ON c.id = o."courseId"
        JOIN "OrderAttribution" oa ON oa."orderId" = o.id
        LEFT JOIN "FinancialTransaction" ft ON ft."orderId" = o.id AND ft.type = 'EARNING'
        WHERE oa."influencerId" = ${scopedId} AND o.status != 'CANCELLED'
        GROUP BY c.name
        ORDER BY revenue DESC
      `,
      prisma.$queryRaw<{ platformName: string; sales: string; revenue: string }[]>`
        SELECT p.name as "platformName", COUNT(o.id)::text as sales, COALESCE(SUM(o."finalAmount"), 0)::text as revenue
        FROM "Order" o
        JOIN "OrderAttribution" oa ON oa."orderId" = o.id
        JOIN "TrackingLink" tl ON tl.id = oa."trackingLinkId"
        JOIN "Platform" p ON p.id = tl."platformId"
        WHERE oa."influencerId" = ${scopedId} AND o.status != 'CANCELLED'
        GROUP BY p.name
      `,
      prisma.$queryRaw<{ day: string; revenue: string; sales: string; earnings: string }[]>`
        SELECT to_char(date_trunc('day', o."placedAt"), 'YYYY-MM-DD') as day,
               COALESCE(SUM(o."finalAmount"), 0)::text as revenue,
               COUNT(*)::text as sales,
               COALESCE(SUM(ft."influencerAmount"), 0)::text as earnings
        FROM "Order" o
        JOIN "OrderAttribution" oa ON oa."orderId" = o.id
        LEFT JOIN "FinancialTransaction" ft ON ft."orderId" = o.id AND ft.type = 'EARNING'
        WHERE oa."influencerId" = ${scopedId} AND o."placedAt" BETWEEN ${range.from} AND ${range.to} AND o.status != 'CANCELLED'
        GROUP BY 1
        ORDER BY 1
      `,
    ]);

  const byStatus = Object.fromEntries(balance.map((b) => [b.status, Number(b._sum.influencerAmount ?? 0)]));

  return {
    kpis: {
      salesToday,
      salesWeek,
      salesMonth,
      salesTotal,
      revenueGenerated: (revenueAgg._sum.finalAmount ?? 0).toString(),
      salesInRange: revenueAgg._count._all,
      pendingEarnings: (byStatus.PENDING ?? 0).toFixed(2),
      approvedEarnings: (byStatus.APPROVED ?? 0).toFixed(2),
      paidEarnings: (byStatus.PAID ?? 0).toFixed(2),
      totalEarnings: (
        (byStatus.PENDING ?? 0) +
        (byStatus.APPROVED ?? 0) +
        (byStatus.PAID ?? 0) +
        (byStatus.REVERSED ?? 0)
      ).toFixed(2),
    },
    courseWise,
    platformWise,
    timeSeries,
  };
}
