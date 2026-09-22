"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { addAgreementVersion } from "@/lib/financial/agreements";
import { createAgreementVersionSchema } from "@/lib/financial/agreement-schemas";
import { updateInfluencer } from "@/lib/data/influencers";
import type { InfluencerStatus } from "@/generated/prisma/enums";

export async function addAgreementVersionAction(
  influencerId: string,
  _prevState: { error: string | null },
  formData: FormData
) {
  const session = await requireSession();
  assertCan(session.user.role, "agreements", "write");

  const raw = {
    modelType: formData.get("modelType"),
    influencerSharePct: formData.get("influencerSharePct") || undefined,
    commissionPct: formData.get("commissionPct") || undefined,
    fixedAmount: formData.get("fixedAmount") || undefined,
    eligibleRevenueBasis: formData.get("eligibleRevenueBasis") || "DISCOUNTED",
    effectiveFrom: formData.get("effectiveFrom"),
    effectiveUntil: formData.get("effectiveUntil") || undefined,
    courseIds: formData.getAll("courseIds").map(String).filter(Boolean),
    campaignIds: formData.getAll("campaignIds").map(String).filter(Boolean),
    notes: formData.get("notes") || undefined,
  };

  const parsed = createAgreementVersionSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues.map((i) => i.message).join("; ") };
  }

  await addAgreementVersion(influencerId, parsed.data, { id: session.user.id, email: session.user.email });
  revalidatePath(`/admin/influencers/${influencerId}`);
  return { error: null };
}

export async function updateInfluencerStatusAction(influencerId: string, status: InfluencerStatus) {
  const session = await requireSession();
  await updateInfluencer(influencerId, { status }, { id: session.user.id, email: session.user.email });
  revalidatePath(`/admin/influencers/${influencerId}`);
}
