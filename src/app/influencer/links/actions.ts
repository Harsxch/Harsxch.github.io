"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createTrackingLink, setTrackingLinkStatus } from "@/lib/data/tracking-links";

function str(v: FormDataEntryValue | null): string | undefined {
  const s = v ? String(v).trim() : "";
  return s.length > 0 ? s : undefined;
}

/**
 * Self-serve link creation. `influencerId` is never taken from the form -
 * createTrackingLink() forces it to the caller's own session influencerId
 * for anyone with the INFLUENCER role, so there is nothing here for a
 * client to tamper with even if they modified the request.
 */
export async function createMyTrackingLinkAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await requireSession();

  const courseId = String(formData.get("courseId") ?? "");
  const platformId = String(formData.get("platformId") ?? "");
  const utmContent = str(formData.get("utmContent"));
  if (!courseId || !platformId || !utmContent) {
    return { error: "Course, platform and UTM content are required" };
  }

  try {
    await createTrackingLink(
      {
        influencerId: session.user.influencerId ?? "",
        courseId,
        platformId,
        campaignId: str(formData.get("campaignId")),
        couponId: str(formData.get("couponId")),
        content: str(formData.get("content")),
        utmSource: str(formData.get("utmSource")) ?? "direct",
        utmMedium: str(formData.get("utmMedium")),
        utmCampaign: str(formData.get("utmCampaign")) ?? "general",
        utmContent,
        utmTerm: str(formData.get("utmTerm")),
      },
      { id: session.user.id, email: session.user.email }
    );
  } catch (err) {
    if (err instanceof Error) return { error: err.message };
    throw err;
  }

  revalidatePath("/influencer/links");
  return { error: null };
}

/** setTrackingLinkStatus() itself enforces that the caller owns this link -
 * this is not the only line of defense. */
export async function toggleMyTrackingLinkAction(linkId: string, currentStatus: "ACTIVE" | "DISABLED") {
  const session = await requireSession();
  await setTrackingLinkStatus(linkId, currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE", {
    id: session.user.id,
    email: session.user.email,
  });
  revalidatePath("/influencer/links");
}
