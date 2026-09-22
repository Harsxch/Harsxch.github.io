import Decimal from "decimal.js";
import type { AgreementTerms, CalculationResult, OrderMoney } from "./types";

/**
 * The dedicated financial calculation service (spec sections 6, 7, 18).
 *
 * DELIBERATELY has zero dependency on Prisma, Next.js or any UI code: it is
 * pure input -> output so it can be unit tested and so nobody is ever
 * tempted to recompute earnings inline in a component. Callers are
 * responsible for persisting the result as an immutable snapshot (see
 * src/lib/financial/process-order.ts) - this function itself never touches
 * the database.
 *
 * Eligible revenue default (documented per spec section 6): DISCOUNTED, i.e.
 * the final amount the customer actually paid after the coupon/discount was
 * applied, before any refund. This matches the worked example in the spec
 * (₹10,000 price, ₹2,000 discount, ₹8,000 paid -> eligible revenue ₹8,000).
 * GROSS and NET_OF_REFUND are supported per-agreement via
 * eligibleRevenueBasis but DISCOUNTED is what new agreements default to.
 *
 * Rounding rule: money amounts are rounded to 2dp with ROUND_HALF_UP. The
 * company amount is always derived as the REMAINDER (eligibleRevenue -
 * influencerAmount), never computed independently - this guarantees
 * influencerAmount + companyAmount === eligibleRevenue exactly, with no
 * stray rounding cents. companySharePct on a REVENUE_SHARE agreement is
 * stored for display/audit only; it is not used in the calculation.
 */
export function calculateSplit(
  order: OrderMoney,
  agreement: AgreementTerms
): CalculationResult {
  const eligibleRevenue = resolveEligibleRevenue(order, agreement.eligibleRevenueBasis);

  let influencerAmount: Decimal;

  switch (agreement.modelType) {
    case "REVENUE_SHARE": {
      const pct = requirePct(agreement.influencerSharePct, "influencerSharePct");
      influencerAmount = eligibleRevenue.mul(pct).div(100);
      break;
    }
    case "PERCENTAGE_COMMISSION": {
      const pct = requirePct(agreement.commissionPct, "commissionPct");
      influencerAmount = eligibleRevenue.mul(pct).div(100);
      break;
    }
    case "FIXED_PER_SALE": {
      const fixed = requireAmount(agreement.fixedAmount, "fixedAmount");
      influencerAmount = fixed;
      break;
    }
    case "HYBRID": {
      // MVP hybrid = base share/commission + flat bonus, applied unconditionally.
      // Threshold-based bonuses ("+₹500 after 50 sales") need stateful
      // evaluation against cumulative sales and are out of scope for Phase 1
      // (see docs/ARCHITECTURE.md, "Hybrid model limitation").
      const base = agreement.influencerSharePct
        ? eligibleRevenue.mul(new Decimal(agreement.influencerSharePct)).div(100)
        : agreement.commissionPct
          ? eligibleRevenue.mul(new Decimal(agreement.commissionPct)).div(100)
          : new Decimal(0);
      const bonus = agreement.fixedAmount ? new Decimal(agreement.fixedAmount) : new Decimal(0);
      influencerAmount = base.plus(bonus);
      break;
    }
    default:
      throw new Error(`Unsupported model type: ${agreement.modelType}`);
  }

  influencerAmount = influencerAmount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const companyAmount = eligibleRevenue.minus(influencerAmount).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    eligibleRevenue: eligibleRevenue.toFixed(2),
    influencerAmount: influencerAmount.toFixed(2),
    companyAmount: companyAmount.toFixed(2),
  };
}

function resolveEligibleRevenue(
  order: OrderMoney,
  basis: AgreementTerms["eligibleRevenueBasis"]
): Decimal {
  switch (basis) {
    case "GROSS":
      return new Decimal(order.originalPrice);
    case "DISCOUNTED":
    case "NET_OF_REFUND":
      // NET_OF_REFUND is identical to DISCOUNTED at initial calculation time
      // (no refund exists yet); the refund reversal path in reversal.ts is
      // what actually nets out a refund from the influencer's balance.
      return new Decimal(order.finalAmount);
    default:
      throw new Error(`Unsupported eligible revenue basis: ${basis}`);
  }
}

function requirePct(value: string | null, field: string): Decimal {
  if (value === null) throw new Error(`Agreement is missing required field: ${field}`);
  return new Decimal(value);
}

function requireAmount(value: string | null, field: string): Decimal {
  if (value === null) throw new Error(`Agreement is missing required field: ${field}`);
  return new Decimal(value);
}
