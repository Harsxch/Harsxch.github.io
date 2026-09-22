import type { Coupon, Prisma } from "@/generated/prisma/client";
import { BadRequestError } from "@/lib/api/handler";

/**
 * Validates a coupon is usable for a given course at a given time (spec
 * section 42 edge cases: expired coupons, usage limits, course scope).
 * Throws BadRequestError with a specific reason rather than silently
 * ignoring the coupon - a rejected coupon on a real order should be visible,
 * not swallowed.
 */
export async function validateCouponForOrder(
  tx: Prisma.TransactionClient,
  coupon: Coupon,
  courseId: string,
  asOf: Date
) {
  if (coupon.status !== "ACTIVE") {
    throw new BadRequestError(`Coupon ${coupon.code} is not active`);
  }
  if (coupon.startDate > asOf) {
    throw new BadRequestError(`Coupon ${coupon.code} is not yet valid`);
  }
  if (coupon.endDate && coupon.endDate < asOf) {
    throw new BadRequestError(`Coupon ${coupon.code} has expired`);
  }
  if (coupon.usageLimit !== null && coupon.currentUsage >= coupon.usageLimit) {
    throw new BadRequestError(`Coupon ${coupon.code} has reached its usage limit`);
  }

  const scopedCourseCount = await tx.couponCourse.count({ where: { couponId: coupon.id } });
  if (scopedCourseCount > 0) {
    const appliesToCourse = await tx.couponCourse.findUnique({
      where: { couponId_courseId: { couponId: coupon.id, courseId } },
    });
    if (!appliesToCourse) {
      throw new BadRequestError(`Coupon ${coupon.code} is not valid for this course`);
    }
  }
}
