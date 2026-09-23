import { prisma } from "@/lib/prisma";
import { BadRequestError, NotFoundError } from "@/lib/api/handler";
import { recordAudit } from "@/lib/audit/log";
import { notify } from "@/lib/notifications/create";

type Actor = { id: string; email: string };

/**
 * Bundles APPROVED earning rows (plus any not-yet-settled REVERSAL rows,
 * which carry negative amounts) into a Payout. Payouts are a distinct
 * financial entity from individual ledger rows (spec section 20) - creating
 * one links transactions to it via payoutId but does NOT mark them PAID;
 * that only happens once the payout itself is confirmed paid.
 */
export async function createPayout(
  influencerId: string,
  actor: Actor,
  options?: { method?: string; reference?: string }
) {
  return prisma.$transaction(async (tx) => {
    const eligible = await tx.financialTransaction.findMany({
      where: {
        influencerId,
        payoutId: null,
        OR: [
          { type: "EARNING", status: "APPROVED" },
          { type: "REVERSAL", status: "REVERSED" },
        ],
      },
    });

    if (eligible.length === 0) {
      throw new BadRequestError("No approved earnings or pending reversals to pay out");
    }

    const amount = eligible.reduce((sum, t) => sum + Number(t.influencerAmount), 0);
    if (amount <= 0) {
      throw new BadRequestError(
        `Net payable amount is ${amount.toFixed(2)}; nothing to pay out until it is positive`
      );
    }

    const payout = await tx.payout.create({
      data: {
        influencerId,
        amount: amount.toFixed(2),
        status: "PENDING",
        method: options?.method,
        reference: options?.reference,
        initiatedById: actor.id,
      },
    });

    await tx.financialTransaction.updateMany({
      where: { id: { in: eligible.map((t) => t.id) } },
      data: { payoutId: payout.id },
    });

    await recordAudit({
      actor,
      action: "PAYOUT_CREATED",
      entityType: "Payout",
      entityId: payout.id,
      newValue: { influencerId, amount: payout.amount.toString(), transactionCount: eligible.length },
      tx,
    });

    return payout;
  });
}

export async function markPayoutPaid(payoutId: string, actor: Actor) {
  return prisma.$transaction(async (tx) => {
    const payout = await tx.payout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundError("Payout not found");
    if (payout.status === "PAID") throw new BadRequestError("Payout is already marked paid");

    await tx.payout.update({
      where: { id: payoutId },
      data: { status: "PAID", paidAt: new Date() },
    });

    await tx.financialTransaction.updateMany({
      where: { payoutId, type: "EARNING" },
      data: { status: "PAID" },
    });

    const influencer = await tx.influencer.findUnique({
      where: { id: payout.influencerId },
      select: { userId: true },
    });
    if (influencer?.userId) {
      await notify(tx, {
        userId: influencer.userId,
        type: "EARNING_PAID",
        title: "Payout completed",
        body: `Your payout of ${payout.amount.toString()} has been marked as paid.`,
        entityType: "Payout",
        entityId: payout.id,
      });
    }

    await recordAudit({
      actor,
      action: "PAYOUT_MARKED_PAID",
      entityType: "Payout",
      entityId: payout.id,
      previousValue: { status: payout.status },
      newValue: { status: "PAID" },
      tx,
    });

    return payout;
  });
}

export async function markPayoutFailed(payoutId: string, reason: string, actor: Actor) {
  return prisma.$transaction(async (tx) => {
    const payout = await tx.payout.findUnique({ where: { id: payoutId } });
    if (!payout) throw new NotFoundError("Payout not found");
    if (payout.status === "PAID") throw new BadRequestError("Cannot fail a payout already marked paid");

    await tx.payout.update({
      where: { id: payoutId },
      data: { status: "FAILED", failureReason: reason },
    });

    // Return the linked transactions to the unassigned pool so they can be
    // retried in a future payout (spec section 42, "failed payouts").
    await tx.financialTransaction.updateMany({
      where: { payoutId },
      data: { payoutId: null },
    });

    await recordAudit({
      actor,
      action: "PAYOUT_MARKED_FAILED",
      entityType: "Payout",
      entityId: payout.id,
      newValue: { status: "FAILED", reason },
      tx,
    });

    return payout;
  });
}
