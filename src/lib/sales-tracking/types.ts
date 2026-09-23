/**
 * Data contracts for the Sales Tracking feature. These are the shapes the
 * frontend is built against - the real backend (Metabase-connected) just
 * needs to satisfy `SalesTrackingAdapter` (see adapter.ts) and return data
 * in these shapes. Nothing in the UI changes when that swap happens.
 */

export type SaleStatus = "PAID" | "PENDING" | "REFUNDED" | "CANCELLED";

/** Every field is optional and additive: an unset filter must never
 * restrict results (spec: "If they leave a filter empty, it should NOT
 * restrict the results"). Dates are ISO date strings (YYYY-MM-DD). */
export interface SalesFilters {
  startDate?: string;
  endDate?: string;
  utmContent?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  couponCode?: string;
  courseName?: string;
}

/**
 * One row of attributed sales data. Deliberately has NO customer PII -
 * `userId` is the business's existing opaque user identifier (never a
 * phone number, email, or name), which is the only customer-linked field
 * an influencer is allowed to see, for reconciliation purposes only.
 */
export interface InfluencerSaleRecord {
  orderId: string;
  date: string; // ISO date string
  courseName: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  utmTerm: string | null;
  couponCode: string | null;
  userId: string;
  saleAmount: number;
  saleStatus: SaleStatus;
}

export interface SalesSummary {
  totalSales: number;
  totalRevenue: number;
  coursesSold: number;
}

export interface CourseSalesBreakdown {
  courseName: string;
  sales: number;
  revenue: number;
}

export interface UtmSalesBreakdown {
  utmContent: string;
  sales: number;
  revenue: number;
}

/** Distinct values available to this influencer, used to populate the
 * filter dropdowns. Never hardcoded in the UI - always sourced from
 * whatever backend is wired in (mock today, Metabase later). */
export interface SalesFilterOptions {
  utmContent: string[];
  utmSource: string[];
  utmMedium: string[];
  utmCampaign: string[];
  utmTerm: string[];
  couponCode: string[];
  courseName: string[];
}

export interface InfluencerSalesResponse {
  summary: SalesSummary;
  courseBreakdown: CourseSalesBreakdown[];
  utmBreakdown: UtmSalesBreakdown[];
  sales: InfluencerSaleRecord[];
}

/** Resolved server-side from the session only - never accepted from a
 * client request. See src/lib/sales-tracking/service.ts. */
export interface InfluencerIdentity {
  influencerId: string;
  email: string;
  name: string;
}
