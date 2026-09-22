import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession, resolveInfluencerScope } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import type { TransactionStatus } from "@/generated/prisma/enums";

export async function listLedgerEntries(params: {
  influencerId?: string;
  status?: TransactionStatus;
  page?: number;
  pageSize?: number;
}) {
  const session = await requireSession();
  assertCan(session.user.role, "transactions", "read");
  const influencerId = resolveInfluencerScope(session.user, params.influencerId);

  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 50, 200);

  const where = {
    ...(influencerId ? { influencerId } : {}),
    ...(params.status ? { status: params.status } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.financialTransaction.findMany({
      where,
      include: {
        order: { include: { course: { select: { name: true } } } },
        influencer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.financialTransaction.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}

/** Balance summary. REVERSAL rows store negative amounts by convention, so a
 * plain grouped SUM(influencerAmount) gives the correct net balance per
 * status without any type-aware branching here. */
export async function getInfluencerBalanceSummary(influencerId: string) {
  const session = await requireSession();
  assertCan(session.user.role, "transactions", "read");
  const scopedId = resolveInfluencerScope(session.user, influencerId);
  if (!scopedId) return { pending: "0.00", approved: "0.00", paid: "0.00", reversed: "0.00", totalEarned: "0.00" };

  const grouped = await prisma.financialTransaction.groupBy({
    by: ["status"],
    where: { influencerId: scopedId },
    _sum: { influencerAmount: true },
  });

  const byStatus = Object.fromEntries(grouped.map((g) => [g.status, Number(g._sum.influencerAmount ?? 0)]));
  const pending = byStatus.PENDING ?? 0;
  const approved = byStatus.APPROVED ?? 0;
  const paid = byStatus.PAID ?? 0;
  const reversed = byStatus.REVERSED ?? 0;

  return {
    pending: pending.toFixed(2),
    approved: approved.toFixed(2),
    paid: paid.toFixed(2),
    reversed: reversed.toFixed(2),
    totalEarned: (pending + approved + paid + reversed).toFixed(2),
  };
}
