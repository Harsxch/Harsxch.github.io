import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { listOrders } from "@/lib/data/orders";
import { csvResponse } from "@/lib/csv";
import { formatDateTime } from "@/lib/format";

/** Respects every filter the Sales screens support - status, course,
 * campaign, coupon, date range, and each UTM dimension. */
export const GET = apiHandler(async (req: NextRequest) => {
  const session = await requireSession();
  assertCan(session.user.role, "exports", "read");

  const p = req.nextUrl.searchParams;
  const { rows } = await listOrders({
    status: (p.get("status") as never) ?? undefined,
    courseId: p.get("courseId") ?? undefined,
    campaignId: p.get("campaignId") ?? undefined,
    influencerId: p.get("influencerId") ?? undefined,
    couponCode: p.get("couponCode") ?? undefined,
    utmSource: p.get("utmSource") ?? undefined,
    utmMedium: p.get("utmMedium") ?? undefined,
    utmCampaign: p.get("utmCampaign") ?? undefined,
    utmContent: p.get("utmContent") ?? undefined,
    utmTerm: p.get("utmTerm") ?? undefined,
    from: p.get("from") ? new Date(p.get("from")!) : undefined,
    to: p.get("to") ? new Date(p.get("to")!) : undefined,
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
      "Tracking Link": o.trackingLinkCode ?? "",
      "UTM Source": o.utmSource ?? "",
      "UTM Medium": o.utmMedium ?? "",
      "UTM Campaign": o.utmCampaign ?? "",
      "UTM Content": o.utmContent ?? "",
      "UTM Term": o.utmTerm ?? "",
      "Original Price": o.originalPrice,
      Discount: o.discountAmount,
      "Final Amount": o.finalAmount,
      "Eligible Revenue": o.eligibleRevenue ?? "",
      "Influencer Earnings": o.influencerAmount ?? "",
      Status: o.status,
    }))
  );
});
