import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { listOrders } from "@/lib/data/orders";
import { csvResponse } from "@/lib/csv";
import { formatDateTime } from "@/lib/format";

/** Respects the same filters as /admin/sales (status, course, influencer). */
export const GET = apiHandler(async (req: NextRequest) => {
  const session = await requireSession();
  assertCan(session.user.role, "exports", "read");

  const params = req.nextUrl.searchParams;
  const { rows } = await listOrders({
    status: (params.get("status") as never) ?? undefined,
    courseId: params.get("courseId") ?? undefined,
    influencerId: params.get("influencerId") ?? undefined,
    pageSize: 10000,
  });

  return csvResponse(
    "sales.csv",
    rows.map((o) => ({
      "Order Number": o.orderNumber,
      Date: formatDateTime(o.placedAt),
      Course: o.courseName,
      Influencer: o.influencerName ?? "",
      Coupon: o.couponCode ?? "",
      "Original Price": o.originalPrice,
      Discount: o.discountAmount,
      "Final Amount": o.finalAmount,
      "Eligible Revenue": o.eligibleRevenue ?? "",
      "Influencer Earnings": o.influencerAmount ?? "",
      Status: o.status,
    }))
  );
});
