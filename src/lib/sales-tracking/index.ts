import type { SalesTrackingAdapter } from "./adapter";
import { MockSalesTrackingAdapter } from "./mock-adapter";

/**
 * The single swap point for connecting the real data source.
 *
 * When the data team is ready to connect Metabase/production data:
 *   1. Write a new class implementing `SalesTrackingAdapter` (adapter.ts).
 *   2. Replace the line below with an instance of that class.
 * Nothing else in the app needs to change - the API route and every UI
 * component only ever talk to this adapter through the interface.
 */
export const salesTrackingAdapter: SalesTrackingAdapter = new MockSalesTrackingAdapter();

export * from "./types";
export type { SalesTrackingAdapter } from "./adapter";
