import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession, resolveInfluencerScope } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";

export async function listGoalsWithProgress(params: { influencerId?: string } = {}) {
  const session = await requireSession();
  assertCan(session.user.role, "goals", "read");
  const influencerId = resolveInfluencerScope(session.user, params.influencerId);
  if (!influencerId) return [];

  const goals = await prisma.goal.findMany({
    where: { influencerId },
    orderBy: { periodStart: "desc" },
  });

  const results = await Promise.all(
    goals.map(async (goal) => {
      if (goal.metric === "SALES") {
        const count = await prisma.order.count({
          where: {
            attribution: { influencerId },
            placedAt: { gte: goal.periodStart, lte: goal.periodEnd },
            status: { not: "CANCELLED" },
          },
        });
        return { ...goal, current: count.toString() };
      }
      const agg = await prisma.order.aggregate({
        where: {
          attribution: { influencerId },
          placedAt: { gte: goal.periodStart, lte: goal.periodEnd },
          status: { not: "CANCELLED" },
        },
        _sum: { finalAmount: true },
      });
      return { ...goal, current: (agg._sum.finalAmount ?? 0).toString() };
    })
  );

  return results;
}
