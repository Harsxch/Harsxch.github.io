import { listCoupons } from "@/lib/data/coupons";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/copy-button";
import { formatCurrency } from "@/lib/format";

export default async function MyCouponsPage() {
  const coupons = await listCoupons();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Coupons</h1>
        <p className="text-sm text-slate-500 mt-0.5">Share these codes with your audience</p>
      </div>

      <Card>
        {coupons.length === 0 ? (
          <EmptyState title="No coupons yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Code</Th>
                <Th>Discount</Th>
                <Th align="right">Sales</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">Your Earnings</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {coupons.map((c) => (
                <Tr key={c.id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold">{c.code}</span>
                      <CopyButton text={c.code} />
                    </div>
                  </Td>
                  <Td>{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : formatCurrency(c.discountValue.toString())}</Td>
                  <Td align="right">{c.sales}</Td>
                  <Td align="right">{formatCurrency(c.revenue)}</Td>
                  <Td align="right">{formatCurrency(c.earnings)}</Td>
                  <Td>
                    <Badge>{c.status}</Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
