import Decimal from "decimal.js";

/**
 * Computes the reversal amounts for a refund against an original EARNING
 * transaction. Supports partial refunds by reversing the same proportion of
 * the influencer/company split that the refund represents of the order's
 * final amount (spec section 8).
 *
 * Returned amounts are POSITIVE magnitudes describing "how much to claw
 * back" - the caller (process-order.ts) is responsible for persisting them
 * as negative numbers on the REVERSAL FinancialTransaction row, so that a
 * plain SUM(amount) over a ledger yields the correct net balance without
 * every reader needing to know the sign convention per transaction type.
 */
export function calculateReversal(params: {
  orderFinalAmount: string;
  refundAmount: string;
  originalEligibleRevenue: string;
  originalInfluencerAmount: string;
  originalCompanyAmount: string;
}) {
  const orderFinalAmount = new Decimal(params.orderFinalAmount);
  const refundAmount = new Decimal(params.refundAmount);

  if (refundAmount.lte(0)) {
    throw new Error("Refund amount must be positive");
  }
  if (refundAmount.gt(orderFinalAmount)) {
    throw new Error("Refund amount cannot exceed the order's final amount");
  }

  const ratio = orderFinalAmount.isZero() ? new Decimal(0) : refundAmount.div(orderFinalAmount);

  const reversedEligibleRevenue = new Decimal(params.originalEligibleRevenue)
    .mul(ratio)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  const reversedInfluencerAmount = new Decimal(params.originalInfluencerAmount)
    .mul(ratio)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
  // Derive company reversal as the remainder for the same reconciliation
  // reason as in calculate.ts - avoids independent-rounding drift.
  const reversedCompanyAmount = new Decimal(params.originalCompanyAmount)
    .mul(ratio)
    .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

  return {
    eligibleRevenue: reversedEligibleRevenue.toFixed(2),
    influencerAmount: reversedInfluencerAmount.toFixed(2),
    companyAmount: reversedCompanyAmount.toFixed(2),
    isFullRefund: refundAmount.eq(orderFinalAmount),
  };
}
