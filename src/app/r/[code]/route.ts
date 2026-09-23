import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordTrackingLinkClick } from "@/lib/data/tracking-links";

/**
 * Public tracking-link redirect. Not behind auth (see middleware.ts) - this
 * is what gets shared with the influencer's audience. Increments the click
 * counter, then 302s to the course URL carrying the link's full UTM set
 * (source/medium/campaign/content/term) and, if this link has a coupon
 * attached, a couponCode param too - matching how these links get built in
 * the real world (a single share link that both tracks and auto-applies a
 * discount at checkout).
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const link = await prisma.trackingLink.findUnique({
    where: { code },
    include: { course: true, coupon: { select: { code: true } } },
  });

  if (!link || link.status !== "ACTIVE") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  await recordTrackingLinkClick(code);

  const target = new URL(link.course.courseUrl);
  target.searchParams.set("utm_source", link.utmSource);
  target.searchParams.set("utm_medium", link.utmMedium);
  target.searchParams.set("utm_campaign", link.utmCampaign);
  target.searchParams.set("utm_content", link.utmContent);
  if (link.utmTerm) target.searchParams.set("utm_term", link.utmTerm);
  if (link.coupon) target.searchParams.set("couponCode", link.coupon.code);

  return NextResponse.redirect(target);
}
