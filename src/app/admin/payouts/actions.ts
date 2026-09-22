"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createPayout, markPayoutPaid, markPayoutFailed } from "@/lib/financial/payouts";

export async function createPayoutAction(influencerId: string) {
  const session = await requireSession();
  await createPayout(influencerId, { id: session.user.id, email: session.user.email });
  revalidatePath("/admin/payouts");
}

export async function markPayoutPaidAction(payoutId: string) {
  const session = await requireSession();
  await markPayoutPaid(payoutId, { id: session.user.id, email: session.user.email });
  revalidatePath("/admin/payouts");
}

export async function markPayoutFailedAction(payoutId: string, reason: string) {
  const session = await requireSession();
  await markPayoutFailed(payoutId, reason, { id: session.user.id, email: session.user.email });
  revalidatePath("/admin/payouts");
}
