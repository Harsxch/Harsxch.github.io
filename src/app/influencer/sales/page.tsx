import { listOrders } from "@/lib/data/orders";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default async function MySalesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const { rows, total, page, pageSize } = await listOrders({ page: params.page ? Number(params.page) : 1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Sales</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total} sales attributed to you</p>
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState title="No sales yet" subtitle="Sales attributed to your links and coupons will appear here" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Course</Th>
                <Th>Coupon</Th>
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
