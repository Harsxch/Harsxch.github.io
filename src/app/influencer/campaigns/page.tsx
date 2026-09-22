import { listCampaigns } from "@/lib/data/campaigns";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function MyCampaignsPage() {
  const campaigns = await listCampaigns();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Campaigns</h1>
        <p className="text-sm text-slate-500 mt-0.5">Campaigns you&apos;re part of</p>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <EmptyState title="No campaigns yet" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((c) => (
            <Card key={c.id}>
              <CardBody>
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-slate-900">{c.name}</h3>
                  <Badge>{c.status}</Badge>
                </div>
                <p className="text-sm text-slate-500 mt-1">{c.description}</p>
                <div className="text-xs text-slate-500 mt-2">
                  {formatDate(c.startDate)} {c.endDate && `→ ${formatDate(c.endDate)}`}
                </div>
                {(c.targetSales || c.targetRevenue) && (
                  <div className="text-xs text-slate-500 mt-1">
                    Target: {c.targetSales ? `${c.targetSales} sales` : ""}
                    {c.targetSales && c.targetRevenue ? " · " : ""}
                    {c.targetRevenue ? formatCurrency(c.targetRevenue.toString()) : ""}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
