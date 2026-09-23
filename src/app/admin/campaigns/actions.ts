"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { createCampaign } from "@/lib/data/campaigns";

export async function createCampaignAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const session = await requireSession();

  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const startDate = formData.get("startDate");
  if (!name || !slug || !startDate) return { error: "Name, slug and start date are required" };

  try {
    await createCampaign(
      {
        name,
        slug,
        description: String(formData.get("description") ?? "") || undefined,
        startDate: new Date(String(startDate)),
        endDate: formData.get("endDate") ? new Date(String(formData.get("endDate"))) : undefined,
        targetSales: formData.get("targetSales") ? Number(formData.get("targetSales")) : undefined,
        targetRevenue: formData.get("targetRevenue") ? Number(formData.get("targetRevenue")) : undefined,
        courseIds: formData.getAll("courseIds").map(String),
        influencerIds: formData.getAll("influencerIds").map(String),
      },
      { id: session.user.id, email: session.user.email }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return { error: "A campaign with this slug already exists" };
    }
    throw err;
  }

  revalidatePath("/admin/campaigns");
  return { error: null };
}
