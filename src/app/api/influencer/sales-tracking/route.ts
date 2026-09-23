import { NextResponse, type NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/handler";
import { getSalesTrackingData } from "@/lib/sales-tracking/service";

/**
 * GET /api/influencer/sales-tracking
 *
 * Query params (all optional - an unset one never restricts results):
 *   startDate, endDate (YYYY-MM-DD)
 *   utmContent, utmSource, utmMedium, utmCampaign, utmTerm
 *   couponCode, courseName
 *
 * Deliberately takes NO influencer/user identifier as a parameter - the
 * caller's identity is always resolved server-side from the session
 * (see src/lib/sales-tracking/service.ts). This is the real Phase-1
 * implementation of the conceptual `GET /influencer/sales` endpoint
 * described in the feature spec; it's namespaced under
 * /api/influencer/sales-tracking to avoid colliding with the existing
 * /influencer/sales page route.
 */
export const GET = apiHandler(async (req: NextRequest) => {
  const p = req.nextUrl.searchParams;
  const data = await getSalesTrackingData({
    startDate: p.get("startDate") || undefined,
    endDate: p.get("endDate") || undefined,
    utmContent: p.get("utmContent") || undefined,
    utmSource: p.get("utmSource") || undefined,
    utmMedium: p.get("utmMedium") || undefined,
    utmCampaign: p.get("utmCampaign") || undefined,
    utmTerm: p.get("utmTerm") || undefined,
    couponCode: p.get("couponCode") || undefined,
    courseName: p.get("courseName") || undefined,
  });
  return NextResponse.json(data);
});
