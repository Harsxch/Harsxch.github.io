import Link from "next/link";
import { listOrders } from "@/lib/data/orders";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Plus, Download } from "lucide-react";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { rows, total, page, pageSize } = await listOrders({
    status: params.status as never,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sales</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} orders</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/exports/sales${params.status ? `?status=${params.status}` : ""}`}>
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
        <form className="flex items-center gap-2 p-4 border-b border-slate-100">
          <select name="status" defaultValue={params.status ?? ""} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {["PENDING", "SUCCESSFUL", "REFUNDED", "PARTIALLY_REFUNDED", "CANCELLED"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>

        {rows.length === 0 ? (
          <EmptyState title="No orders found" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Order</Th>
                <Th>Date</Th>
                <Th>Course</Th>
                <Th>Influencer</Th>
                <Th>Coupon</Th>
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
                <Link href={`?page=${page - 1}`} className="text-slate-700 hover:underline">
                  Previous
                </Link>
              )}
              {page * pageSize < total && (
                <Link href={`?page=${page + 1}`} className="text-slate-700 hover:underline">
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
