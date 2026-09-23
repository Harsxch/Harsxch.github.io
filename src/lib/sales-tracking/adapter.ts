import type {
  InfluencerIdentity,
  InfluencerSalesResponse,
  SalesFilterOptions,
  SalesFilters,
} from "./types";

/**
 * The one interface the rest of the app depends on. Today
 * `src/lib/sales-tracking/index.ts` points this at the mock adapter.
 * When the data team connects the real Metabase/production data source,
 * write a new class implementing this same interface and change that one
 * import - no UI, route, or type change required.
 *
 * `identity` is always server-derived (see service.ts) - an adapter must
 * never be called with an identifier that came from a client request.
 */
export interface SalesTrackingAdapter {
  getFilterOptions(identity: InfluencerIdentity): Promise<SalesFilterOptions>;
  getSales(identity: InfluencerIdentity, filters: SalesFilters): Promise<InfluencerSalesResponse>;
}
