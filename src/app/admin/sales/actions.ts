"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { createManualOrder, createRefund } from "@/lib/orders/process-order";
import { createOrderSchema, createRefundSchema } from "@/lib/orders/schemas";

export async function createOrderAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await requireSession();
  assertCan(session.user.role, "orders", "write");

  const parsed = createOrderSchema.safeParse({
    customerEmail: formData.get("customerEmail"),
    customerName: formData.get("customerName") || undefined,
    customerPhone: formData.get("customerPhone") || undefined,
    courseId: formData.get("courseId"),
    originalPrice: formData.get("originalPrice"),
    discountAmount: formData.get("discountAmount") || 0,
    couponCode: formData.get("couponCode") || undefined,
    trackingLinkCode: formData.get("trackingLinkCode") || undefined,
    placedAt: formData.get("placedAt") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  let orderId: string;
  try {
    const order = await createManualOrder(parsed.data, { id: session.user.id, email: session.user.email });
    orderId = order.id;
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/sales");
  redirect(`/admin/sales/${orderId}`);
}

export async function createRefundAction(
  orderId: string,
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await requireSession();
  assertCan(session.user.role, "refunds", "write");

  const parsed = createRefundSchema.safeParse({
    amount: formData.get("amount"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  try {
    await createRefund(orderId, parsed.data, { id: session.user.id, email: session.user.email });
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath(`/admin/sales/${orderId}`);
  revalidatePath("/admin/sales");
  return { error: null };
}
