"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { approveTransactions } from "@/lib/financial/transactions";

export async function approveTransactionsAction(transactionIds: string[]) {
  const session = await requireSession();
  await approveTransactions(transactionIds, { id: session.user.id, email: session.user.email });
  revalidatePath("/admin/earnings");
}
