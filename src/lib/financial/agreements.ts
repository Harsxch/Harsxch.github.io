import { prisma } from "@/lib/prisma";
import { recordAudit } from "@/lib/audit/log";
import type { CreateAgreementVersionInput } from "./agreement-schemas";

type Actor = { id: string; email: string };

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Adds a new version to an influencer's commercial agreement. NEVER edits an
 * existing version's terms (spec section 5) - this is the only entry point
 * for changing an influencer's commercial terms, and it always appends.
 *
 * Any currently-ACTIVE version with the exact same scope (same course/
 * campaign set) is superseded: its effectiveUntil is set to the day before
 * the new version's effectiveFrom, and its status flips to SUPERSEDED. Both
 * rows remain in the database forever; historical transactions already
 * pointing at the old version are untouched.
 */
export async function addAgreementVersion(
  influencerId: string,
  input: CreateAgreementVersionInput,
  actor: Actor
) {
  return prisma.$transaction(async (tx) => {
    let agreement = await tx.commercialAgreement.findFirst({ where: { influencerId } });
    if (!agreement) {
      agreement = await tx.commercialAgreement.create({
        data: { influencerId, createdById: actor.id },
      });
      await recordAudit({
        actor,
        action: "AGREEMENT_CREATED",
        entityType: "CommercialAgreement",
        entityId: agreement.id,
        newValue: { influencerId },
        tx,
      });
    }

    const existingVersions = await tx.commercialAgreementVersion.findMany({
      where: { agreementId: agreement.id, status: "ACTIVE" },
      include: { courseScopes: true, campaignScopes: true },
    });

    const newCourseIds = [...input.courseIds].sort();
    const newCampaignIds = [...input.campaignIds].sort();

    for (const existing of existingVersions) {
      const existingCourseIds = existing.courseScopes.map((s) => s.courseId).sort();
      const existingCampaignIds = existing.campaignScopes.map((s) => s.campaignId).sort();
      const sameScope =
        arraysEqual(existingCourseIds, newCourseIds) && arraysEqual(existingCampaignIds, newCampaignIds);

      if (sameScope) {
        const newEffectiveUntil = new Date(input.effectiveFrom.getTime() - ONE_DAY_MS);
        await tx.commercialAgreementVersion.update({
          where: { id: existing.id },
          data: { status: "SUPERSEDED", effectiveUntil: newEffectiveUntil },
        });
        await recordAudit({
          actor,
          action: "AGREEMENT_VERSION_SUPERSEDED",
          entityType: "CommercialAgreementVersion",
          entityId: existing.id,
          previousValue: { status: "ACTIVE", effectiveUntil: existing.effectiveUntil },
          newValue: { status: "SUPERSEDED", effectiveUntil: newEffectiveUntil },
          tx,
        });
      }
    }

    const maxVersion = await tx.commercialAgreementVersion.aggregate({
      where: { agreementId: agreement.id },
      _max: { version: true },
    });
    const nextVersion = (maxVersion._max.version ?? 0) + 1;

    const version = await tx.commercialAgreementVersion.create({
      data: {
        agreementId: agreement.id,
        version: nextVersion,
        modelType: input.modelType,
        influencerSharePct: input.influencerSharePct,
        companySharePct:
          input.companySharePct ?? (input.influencerSharePct !== undefined ? 100 - input.influencerSharePct : undefined),
        commissionPct: input.commissionPct,
        fixedAmount: input.fixedAmount,
        eligibleRevenueBasis: input.eligibleRevenueBasis,
        effectiveFrom: input.effectiveFrom,
        effectiveUntil: input.effectiveUntil,
        status: "ACTIVE",
        notes: input.notes,
        createdById: actor.id,
        courseScopes: { create: newCourseIds.map((courseId) => ({ courseId })) },
        campaignScopes: { create: newCampaignIds.map((campaignId) => ({ campaignId })) },
      },
      include: { courseScopes: true, campaignScopes: true },
    });

    await recordAudit({
      actor,
      action: "AGREEMENT_VERSION_CREATED",
      entityType: "CommercialAgreementVersion",
      entityId: version.id,
      newValue: {
        version: nextVersion,
        modelType: input.modelType,
        influencerSharePct: input.influencerSharePct,
        effectiveFrom: input.effectiveFrom,
      },
      tx,
    });

    return version;
  });
}

function arraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}
