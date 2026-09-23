import { listOrders } from "@/lib/data/orders";
import { listCourses } from "@/lib/data/courses";
import { listCampaigns } from "@/lib/data/campaigns";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SalesFilterBar, type SalesFilterValues } from "@/components/filters/sales-filter-bar";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default async function MySalesPage({
  searchParams,
}: {
  searchParams: Promise<SalesFilterValues & { page?: string }>;
}) {
  const params = await searchParams;
  const [courses, campaigns, { rows, total, page, pageSize }] = await Promise.all([
    listCourses(),
    listCampaigns(),
    listOrders({
      status: params.status as never,
      courseId: params.courseId || undefined,
      campaignId: params.campaignId || undefined,
      couponCode: params.couponCode || undefined,
      utmSource: params.utmSource || undefined,
      utmMedium: params.utmMedium || undefined,
      utmCampaign: params.utmCampaign || undefined,
      utmContent: params.utmContent || undefined,
      utmTerm: params.utmTerm || undefined,
      from: params.from ? new Date(params.from) : undefined,
      to: params.to ? new Date(params.to) : undefined,
      page: params.page ? Number(params.page) : 1,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Sales</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total} sales attributed to you</p>
      </div>

      <Card>
        <SalesFilterBar
          action="/influencer/sales"
          values={params}
          courses={courses.map((c) => ({ id: c.id, name: c.name }))}
          campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
          showStatus
        />

        {rows.length === 0 ? (
          <EmptyState title="No sales match these filters" subtitle="Sales attributed to your links and coupons will appear here" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Course</Th>
                <Th>Coupon</Th>
                <Th>UTM source / medium</Th>
                <Th>Campaign / content / term</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">Your Earnings</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {rows.map((o) => (
                <Tr key={o.id}>
                  <Td>{formatDateTime(o.placedAt)}</Td>
                  <Td>{o.courseName}</Td>
                  <Td className="font-mono text-xs">{o.couponCode ?? "—"}</Td>
                  <Td className="text-xs text-slate-500">
                    {o.utmSource || o.utmMedium ? `${o.utmSource ?? "—"} / ${o.utmMedium ?? "—"}` : "—"}
                  </Td>
                  <Td className="text-xs text-slate-500">
                    {o.utmCampaign || o.utmContent || o.utmTerm
                      ? `${o.utmCampaign ?? "—"} / ${o.utmContent ?? "—"} / ${o.utmTerm ?? "—"}`
                      : "—"}
                  </Td>
                  <Td align="right">{formatCurrency(o.finalAmount)}</Td>
                  <Td align="right">{formatCurrency(o.influencerAmount)}</Td>
                  <Td>
                    <Badge>{o.status}</Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
      {total > pageSize && (
        <p className="text-xs text-slate-500">
          Page {page} of {Math.ceil(total / pageSize)}
        </p>
      )}
    </div>
  );
}
