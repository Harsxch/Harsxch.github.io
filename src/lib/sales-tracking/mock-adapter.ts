import type { SalesTrackingAdapter } from "./adapter";
import { generateMockSales } from "./mock-data";
import type {
  InfluencerIdentity,
  InfluencerSalesResponse,
  SalesFilterOptions,
  SalesFilters,
} from "./types";

/**
 * Placeholder adapter standing in for the real Metabase/production data
 * source (see adapter.ts). All filtering/aggregation here mirrors exactly
 * what a real backend query would need to do - an unset filter never
 * restricts results, matches are case-insensitive - so replacing this file
 * with a real API-backed adapter is a drop-in swap, not a rewrite of the
 * filtering semantics.
 */
export class MockSalesTrackingAdapter implements SalesTrackingAdapter {
  async getFilterOptions(identity: InfluencerIdentity): Promise<SalesFilterOptions> {
    const rows = generateMockSales(identity.influencerId);
    const distinct = (values: (string | null)[]) =>
      [...new Set(values.filter((v): v is string => Boolean(v)))].sort();

    return {
      utmContent: distinct(rows.map((r) => r.utmContent)),
      utmSource: distinct(rows.map((r) => r.utmSource)),
      utmMedium: distinct(rows.map((r) => r.utmMedium)),
      utmCampaign: distinct(rows.map((r) => r.utmCampaign)),
      utmTerm: distinct(rows.map((r) => r.utmTerm)),
      couponCode: distinct(rows.map((r) => r.couponCode)),
      courseName: distinct(rows.map((r) => r.courseName)),
    };
  }

  async getSales(identity: InfluencerIdentity, filters: SalesFilters): Promise<InfluencerSalesResponse> {
    const allRows = generateMockSales(identity.influencerId);

    const matches = (value: string | null, filter: string | undefined) =>
      !filter || (value ?? "").toLowerCase() === filter.toLowerCase();

    const sales = allRows.filter((row) => {
      if (filters.startDate && row.date < filters.startDate) return false;
      if (filters.endDate && row.date > filters.endDate) return false;
      if (!matches(row.utmContent, filters.utmContent)) return false;
      if (!matches(row.utmSource, filters.utmSource)) return false;
      if (!matches(row.utmMedium, filters.utmMedium)) return false;
      if (!matches(row.utmCampaign, filters.utmCampaign)) return false;
      if (!matches(row.utmTerm, filters.utmTerm)) return false;
      if (!matches(row.couponCode, filters.couponCode)) return false;
      if (!matches(row.courseName, filters.courseName)) return false;
      return true;
    });

    const totalRevenue = sales.reduce((sum, r) => sum + r.saleAmount, 0);
    const courseNames = new Set(sales.map((r) => r.courseName));

    const courseMap = new Map<string, { sales: number; revenue: number }>();
    const utmMap = new Map<string, { sales: number; revenue: number }>();
    for (const row of sales) {
      const c = courseMap.get(row.courseName) ?? { sales: 0, revenue: 0 };
      c.sales += 1;
      c.revenue += row.saleAmount;
      courseMap.set(row.courseName, c);

      const utmKey = row.utmContent ?? "(not set)";
      const u = utmMap.get(utmKey) ?? { sales: 0, revenue: 0 };
      u.sales += 1;
      u.revenue += row.saleAmount;
      utmMap.set(utmKey, u);
    }

    return {
      summary: {
        totalSales: sales.length,
        totalRevenue,
        coursesSold: courseNames.size,
      },
      courseBreakdown: [...courseMap.entries()]
        .map(([courseName, v]) => ({ courseName, ...v }))
        .sort((a, b) => b.revenue - a.revenue),
      utmBreakdown: [...utmMap.entries()]
        .map(([utmContent, v]) => ({ utmContent, ...v }))
        .sort((a, b) => b.revenue - a.revenue),
      sales,
    };
  }
}
