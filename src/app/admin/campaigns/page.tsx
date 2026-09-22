import { listCampaigns } from "@/lib/data/campaigns";
import { listCourses } from "@/lib/data/courses";
import { listInfluencers } from "@/lib/data/influencers";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { CampaignForm } from "./form";

export default async function CampaignsPage() {
  const [campaigns, courses, influencers] = await Promise.all([
    listCampaigns(),
    listCourses({ status: "ACTIVE" }),
    listInfluencers({ pageSize: 100 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Campaigns</h1>
        <p className="text-sm text-slate-500 mt-0.5">{campaigns.length} total</p>
      </div>

      <Card>
        <CardHeader title="Campaigns" />
        {campaigns.length === 0 ? (
          <EmptyState title="No campaigns yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Dates</Th>
                <Th align="right">Target sales</Th>
                <Th align="right">Target revenue</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {campaigns.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-medium text-slate-900">{c.name}</Td>
                  <Td>
                    {formatDate(c.startDate)} {c.endDate ? `→ ${formatDate(c.endDate)}` : ""}
                  </Td>
                  <Td align="right">{c.targetSales ?? "—"}</Td>
                  <Td align="right">{c.targetRevenue ? formatCurrency(c.targetRevenue.toString()) : "—"}</Td>
                  <Td>
                    <Badge>{c.status}</Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Create campaign" />
        <CardBody>
          <CampaignForm
            courses={courses.map((c) => ({ id: c.id, name: c.name }))}
            influencers={influencers.rows.map((i) => ({ id: i.id, name: i.name }))}
          />
        </CardBody>
      </Card>
    </div>
  );
}
