import type { AgreementModelType, EligibleRevenueBasis } from "@/generated/prisma/enums";

/** The subset of a CommercialAgreementVersion needed to run a calculation. */
export interface AgreementTerms {
  id: string;
  modelType: AgreementModelType;
  influencerSharePct: string | null; // Decimal serialized as string, e.g. "40.00"
  companySharePct: string | null;
  commissionPct: string | null;
  fixedAmount: string | null;
  eligibleRevenueBasis: EligibleRevenueBasis;
}

export interface OrderMoney {
  originalPrice: string;
  discountAmount: string;
  finalAmount: string;
}

export interface CalculationResult {
  eligibleRevenue: string;
  influencerAmount: string;
  companyAmount: string;
}
