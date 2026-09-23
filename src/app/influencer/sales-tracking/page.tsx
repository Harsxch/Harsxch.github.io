import { getSalesTrackingFilterOptions } from "@/lib/sales-tracking/service";
import { SalesTrackingClient } from "./sales-tracking-client";

export default async function SalesTrackingPage() {
  const options = await getSalesTrackingFilterOptions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Sales Tracking</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Check the sales generated through your links and campaigns — no spreadsheets, no waiting on the team.
        </p>
      </div>

      <SalesTrackingClient options={options} />
    </div>
  );
}
