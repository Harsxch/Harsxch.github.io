import { z } from "zod";

export const createAgreementVersionSchema = z
  .object({
    modelType: z.enum(["REVENUE_SHARE", "PERCENTAGE_COMMISSION", "FIXED_PER_SALE", "HYBRID"]),
    influencerSharePct: z.coerce.number().min(0).max(100).optional(),
    companySharePct: z.coerce.number().min(0).max(100).optional(),
    commissionPct: z.coerce.number().min(0).max(100).optional(),
    fixedAmount: z.coerce.number().min(0).optional(),
    eligibleRevenueBasis: z.enum(["GROSS", "DISCOUNTED", "NET_OF_REFUND"]).default("DISCOUNTED"),
    effectiveFrom: z.coerce.date(),
    effectiveUntil: z.coerce.date().optional(),
    courseIds: z.array(z.string()).default([]),
    campaignIds: z.array(z.string()).default([]),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.modelType === "REVENUE_SHARE" && data.influencerSharePct === undefined) {
      ctx.addIssue({ code: "custom", message: "influencerSharePct is required for REVENUE_SHARE" });
    }
    if (data.modelType === "PERCENTAGE_COMMISSION" && data.commissionPct === undefined) {
      ctx.addIssue({ code: "custom", message: "commissionPct is required for PERCENTAGE_COMMISSION" });
    }
    if (data.modelType === "FIXED_PER_SALE" && data.fixedAmount === undefined) {
      ctx.addIssue({ code: "custom", message: "fixedAmount is required for FIXED_PER_SALE" });
    }
    if (data.modelType === "HYBRID" && data.influencerSharePct === undefined && data.commissionPct === undefined) {
      ctx.addIssue({ code: "custom", message: "HYBRID requires influencerSharePct or commissionPct as the base" });
    }
    if (data.effectiveUntil && data.effectiveUntil <= data.effectiveFrom) {
      ctx.addIssue({ code: "custom", message: "effectiveUntil must be after effectiveFrom" });
    }
  });

export type CreateAgreementVersionInput = z.infer<typeof createAgreementVersionSchema>;
