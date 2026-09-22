import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordTrackingLinkClick } from "@/lib/data/tracking-links";

/**
 * Public tracking-link redirect. Not behind auth (see middleware.ts) - this
 * is what gets shared with the influencer's audience. Increments the click
 * counter, then 302s to the course URL carrying the link's UTM parameters.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const link = await prisma.trackingLink.findUnique({
    where: { code },
    include: { course: true },
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

  return NextResponse.redirect(target);
}
