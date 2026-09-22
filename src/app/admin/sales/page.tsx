import Link from "next/link";
import { listOrders } from "@/lib/data/orders";
import { listCourses } from "@/lib/data/courses";
import { listCampaigns } from "@/lib/data/campaigns";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SalesFilterBar, type SalesFilterValues } from "@/components/filters/sales-filter-bar";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Plus, Download } from "lucide-react";

export default async function SalesPage({
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

  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v && k !== "page") query.set(k, v);
  const queryString = query.toString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sales</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} orders</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/exports/sales${queryString ? `?${queryString}` : ""}`}>
            <Button variant="secondary">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </a>
          <Link href="/admin/sales/new">
            <Button>
              <Plus className="w-4 h-4" /> Record Sale
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <SalesFilterBar
          action="/admin/sales"
          values={params}
          courses={courses.map((c) => ({ id: c.id, name: c.name }))}
          campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
          showStatus
        />

        {rows.length === 0 ? (
          <EmptyState title="No orders found" subtitle="Try widening your filters" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Order</Th>
                <Th>Date</Th>
                <Th>Course</Th>
                <Th>Influencer</Th>
                <Th>Coupon</Th>
                <Th>UTM source / medium</Th>
                <Th>Campaign / content / term</Th>
                <Th align="right">Final Amount</Th>
                <Th align="right">Earnings</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {rows.map((o) => (
                <Tr key={o.id}>
                  <Td className="font-mono text-xs">
                    <Link href={`/admin/sales/${o.id}`} className="hover:underline">
                      {o.orderNumber}
                    </Link>
                  </Td>
                  <Td>{formatDateTime(o.placedAt)}</Td>
                  <Td>{o.courseName}</Td>
                  <Td>{o.influencerName ?? <span className="text-slate-400">Unattributed</span>}</Td>
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

        {total > pageSize && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-sm text-slate-500">
            <span>
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?${queryString ? queryString + "&" : ""}page=${page - 1}`} className="text-slate-700 hover:underline">
                  Previous
                </Link>
              )}
              {page * pageSize < total && (
                <Link href={`?${queryString ? queryString + "&" : ""}page=${page + 1}`} className="text-slate-700 hover:underline">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
