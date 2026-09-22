"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createTrackingLink, setTrackingLinkStatus } from "@/lib/data/tracking-links";

function str(v: FormDataEntryValue | null): string | undefined {
  const s = v ? String(v).trim() : "";
  return s.length > 0 ? s : undefined;
}

export async function createTrackingLinkAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await requireSession();

  const influencerId = String(formData.get("influencerId") ?? "");
  const courseId = String(formData.get("courseId") ?? "");
  const platformId = String(formData.get("platformId") ?? "");
  const utmContent = str(formData.get("utmContent"));
  if (!influencerId || !courseId || !platformId || !utmContent) {
    return { error: "Influencer, course, platform and content label are required" };
  }

  // Values are passed through as entered, not forced to lowercase/snake_case
  // - real-world UTM values are often mixed-case (e.g. "HarshPriyam",
  // "V_Upskill_Academy"), and the admin now has full manual control over
  // every dimension rather than the platform auto-deriving them.
  await createTrackingLink(
    {
      influencerId,
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
