"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createCoupon, setCouponStatus } from "@/lib/data/coupons";
import type { CouponDiscountType } from "@/generated/prisma/enums";

export async function createCouponAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await requireSession();

  const code = String(formData.get("code") ?? "").trim();
  const influencerId = String(formData.get("influencerId") ?? "");
  const discountValue = Number(formData.get("discountValue") ?? 0);
  if (!code || !influencerId || !discountValue) {
    return { error: "Code, influencer and discount value are required" };
  }

  try {
    await createCoupon(
      {
        code,
        influencerId,
        discountType: (formData.get("discountType") as CouponDiscountType) || "PERCENTAGE",
        discountValue,
        endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : undefined,
        usageLimit: formData.get("usageLimit") ? Number(formData.get("usageLimit")) : undefined,
      },
      { id: session.user.id, email: session.user.email }
    );
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/coupons");
  return { error: null };
}

export async function toggleCouponAction(couponId: string, currentStatus: "ACTIVE" | "INACTIVE" | "EXPIRED") {
  const session = await requireSession();
  await setCouponStatus(couponId, currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE", {
    id: session.user.id,
    email: session.user.email,
  });
  revalidatePath("/admin/coupons");
}
