import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession, resolveInfluencerScope } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { BadRequestError } from "@/lib/api/handler";
import type { CouponDiscountType, CouponStatus } from "@/generated/prisma/enums";

export async function listCoupons(params: { influencerId?: string } = {}) {
  const session = await requireSession();
  assertCan(session.user.role, "coupons", "read");
  const influencerId = resolveInfluencerScope(session.user, params.influencerId);

  const coupons = await prisma.coupon.findMany({
    where: influencerId ? { influencerId } : {},
    include: { influencer: { select: { name: true } }, courses: { include: { course: true } } },
    orderBy: { createdAt: "desc" },
  });

  const totals = await prisma.$queryRaw<{ couponId: string; sales: string; revenue: string; earnings: string }[]>`
    SELECT o."couponId" as "couponId",
           COUNT(*)::text as sales,
           COALESCE(SUM(o."finalAmount"), 0)::text as revenue,
           COALESCE(SUM(ft."influencerAmount"), 0)::text as earnings
    FROM "Order" o
    LEFT JOIN "FinancialTransaction" ft ON ft."orderId" = o.id AND ft.type = 'EARNING'
    WHERE o."couponId" IS NOT NULL AND o.status != 'CANCELLED'
    GROUP BY o."couponId"
  `;
  const totalsByCoupon = new Map(totals.map((t) => [t.couponId, t]));

  return coupons.map((c) => ({
    ...c,
    sales: Number(totalsByCoupon.get(c.id)?.sales ?? 0),
    revenue: totalsByCoupon.get(c.id)?.revenue ?? "0",
    earnings: totalsByCoupon.get(c.id)?.earnings ?? "0",
  }));
}

export async function createCoupon(
  input: {
    code: string;
    influencerId: string;
    discountType: CouponDiscountType;
    discountValue: number;
    startDate?: Date;
    endDate?: Date;
    usageLimit?: number;
    courseIds?: string[];
    agreementVersionId?: string;
  },
  actor: { id: string; email: string }
) {
  const session = await requireSession();
  assertCan(session.user.role, "coupons", "write");

  const existing = await prisma.coupon.findUnique({ where: { code: input.code.toUpperCase().trim() } });
  if (existing) {
    throw new BadRequestError(`Coupon code ${input.code} already exists`);
  }

  const coupon = await prisma.coupon.create({
    data: {
      code: input.code.toUpperCase().trim(),
      influencerId: input.influencerId,
      discountType: input.discountType,
      discountValue: input.discountValue,
      startDate: input.startDate ?? new Date(),
      endDate: input.endDate,
      usageLimit: input.usageLimit,
      agreementVersionId: input.agreementVersionId,
      courses: input.courseIds ? { create: input.courseIds.map((courseId) => ({ courseId })) } : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      userEmail: actor.email,
      action: "COUPON_CREATED",
      entityType: "Coupon",
      entityId: coupon.id,
      newValue: { code: coupon.code, influencerId: input.influencerId },
    },
  });

  return coupon;
}

export async function setCouponStatus(couponId: string, status: CouponStatus, actor: { id: string; email: string }) {
  const session = await requireSession();
  assertCan(session.user.role, "coupons", "write");
  const coupon = await prisma.coupon.update({ where: { id: couponId }, data: { status } });
  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      userEmail: actor.email,
      action: "COUPON_STATUS_CHANGED",
      entityType: "Coupon",
      entityId: coupon.id,
      newValue: { status },
    },
  });
  return coupon;
}
