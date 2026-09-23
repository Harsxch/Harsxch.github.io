"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createInfluencer, updateInfluencer } from "@/lib/data/influencers";
import type { InfluencerStatus } from "@/generated/prisma/enums";

export async function createInfluencerAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!name || !email) return { error: "Name and email are required" };

  let influencerId: string;
  try {
    const influencer = await createInfluencer(
      {
        name,
        email,
        phone: strOrUndef(formData.get("phone")),
        youtubeUrl: strOrUndef(formData.get("youtubeUrl")),
        instagramUrl: strOrUndef(formData.get("instagramUrl")),
        primaryPlatformId: strOrUndef(formData.get("primaryPlatformId")),
        category: strOrUndef(formData.get("category")),
        status: (formData.get("status") as InfluencerStatus) || "PROSPECT",
        joiningDate: formData.get("joiningDate") ? new Date(String(formData.get("joiningDate"))) : undefined,
        notes: strOrUndef(formData.get("notes")),
      },
      { id: session.user.id, email: session.user.email }
    );
    influencerId = influencer.id;
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "An influencer with this email already exists" };
    }
    throw err;
  }

  revalidatePath("/admin/influencers");
  redirect(`/admin/influencers/${influencerId}`);
}

export async function updateInfluencerStatusAction(influencerId: string, status: InfluencerStatus) {
  const session = await requireSession();
  await updateInfluencer(influencerId, { status }, { id: session.user.id, email: session.user.email });
  revalidatePath(`/admin/influencers/${influencerId}`);
  revalidatePath("/admin/influencers");
}

function strOrUndef(v: FormDataEntryValue | null): string | undefined {
  const s = v ? String(v).trim() : "";
  return s.length > 0 ? s : undefined;
}
