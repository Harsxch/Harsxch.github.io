import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession, resolveInfluencerScope } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";

export async function listPayouts(params: { influencerId?: string } = {}) {
  const session = await requireSession();
  assertCan(session.user.role, "payouts", "read");
  const influencerId = resolveInfluencerScope(session.user, params.influencerId);

  return prisma.payout.findMany({
    where: influencerId ? { influencerId } : {},
    include: { influencer: { select: { name: true } }, _count: { select: { transactions: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPayoutablesByInfluencer() {
  const session = await requireSession();
  assertCan(session.user.role, "payouts", "write");

  const grouped = await prisma.financialTransaction.groupBy({
    by: ["influencerId"],
    where: { payoutId: null, OR: [{ type: "EARNING", status: "APPROVED" }, { type: "REVERSAL", status: "REVERSED" }] },
    _sum: { influencerAmount: true },
  });

  const influencers = await prisma.influencer.findMany({
    where: { id: { in: grouped.map((g) => g.influencerId) } },
    select: { id: true, name: true, email: true },
  });
  const influencerById = new Map(influencers.map((i) => [i.id, i]));

  return grouped
    .map((g) => ({
      influencerId: g.influencerId,
      influencerName: influencerById.get(g.influencerId)?.name ?? "Unknown",
      amount: Number(g._sum.influencerAmount ?? 0).toFixed(2),
    }))
    .filter((g) => Number(g.amount) > 0);
}
