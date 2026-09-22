"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createTrackingLink, setTrackingLinkStatus } from "@/lib/data/tracking-links";

export async function createTrackingLinkAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await requireSession();

  const influencerId = String(formData.get("influencerId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const platformId = String(formData.get("platformId") ?? "");
  const utmContent = String(formData.get("utmContent") ?? "").trim();
  if (!influencerId || !courseId || !platformId || !utmContent) {
    return { error: "Influencer, course, platform and content label are required" };
  }

  await createTrackingLink(
    {
      influencerId,
      courseId,
      platformId,
      campaignId: String(formData.get("campaignId") ?? "") || undefined,
      content: String(formData.get("content") ?? "") || undefined,
      utmSource: String(formData.get("utmSource") ?? "").toLowerCase() || "direct",
      utmCampaign: String(formData.get("utmCampaign") ?? "").toLowerCase().replace(/\s+/g, "_") || "general",
      utmContent: utmContent.toLowerCase().replace(/\s+/g, "_"),
    },
    { id: session.user.id, email: session.user.email }
  );

  revalidatePath("/admin/tracking-links");
  return { error: null };
}

export async function toggleTrackingLinkAction(linkId: string, currentStatus: "ACTIVE" | "DISABLED") {
  const session = await requireSession();
  await setTrackingLinkStatus(linkId, currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE", {
    id: session.user.id,
    email: session.user.email,
  });
  revalidatePath("/admin/tracking-links");
}
