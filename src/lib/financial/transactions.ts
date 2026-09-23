import { prisma } from "@/lib/prisma";
import { BadRequestError } from "@/lib/api/handler";
import { recordAudit } from "@/lib/audit/log";

type Actor = { id: string; email: string };

/** Moves PENDING earning rows to APPROVED, ready to be batched into a payout. */
export async function approveTransactions(transactionIds: string[], actor: Actor) {
  return prisma.$transaction(async (tx) => {
    const rows = await tx.financialTransaction.findMany({
      where: { id: { in: transactionIds } },
    });
    const invalid = rows.filter((r) => r.type !== "EARNING" || r.status !== "PENDING");
    if (invalid.length > 0) {
      throw new BadRequestError(
        `${invalid.length} transaction(s) are not pending EARNING rows and cannot be approved`
      );
    }

    await tx.financialTransaction.updateMany({
      where: { id: { in: transactionIds } },
      data: { status: "APPROVED" },
    });

    for (const row of rows) {
      await recordAudit({
        actor,
        action: "TRANSACTION_APPROVED",
        entityType: "FinancialTransaction",
        entityId: row.id,
        previousValue: { status: "PENDING" },
        newValue: { status: "APPROVED" },
        tx,
      });
    }

    return rows.length;
  });
}
