import { listCoupons } from "@/lib/data/coupons";
import { listInfluencers } from "@/lib/data/influencers";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { CouponForm } from "./form";
import { CouponRowActions } from "./row-actions";

export default async function CouponsPage() {
  const [coupons, influencers] = await Promise.all([listCoupons(), listInfluencers({ pageSize: 100 })]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Coupons</h1>
        <p className="text-sm text-slate-500 mt-0.5">{coupons.length} total</p>
      </div>

      <Card>
        <CardHeader title="Create coupon" />
        <CardBody>
          <CouponForm influencers={influencers.rows.map((i) => ({ id: i.id, name: i.name }))} />
        </CardBody>
      </Card>

      <Card>
        {coupons.length === 0 ? (
          <EmptyState title="No coupons yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Code</Th>
                <Th>Influencer</Th>
                <Th>Discount</Th>
                <Th align="right">Uses</Th>
                <Th align="right">Sales</Th>
                <Th align="right">Revenue</Th>
                <Th>Status</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <tbody>
              {coupons.map((c) => (
                <Tr key={c.id}>
                  <Td className="font-mono text-xs">{c.code}</Td>
                  <Td>{c.influencer.name}</Td>
                  <Td>{c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : formatCurrency(c.discountValue.toString())}</Td>
                  <Td align="right">
                    {c.currentUsage}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                  </Td>
                  <Td align="right">{c.sales}</Td>
                  <Td align="right">{formatCurrency(c.revenue)}</Td>
                  <Td>
                    <Badge>{c.status}</Badge>
                  </Td>
                  <Td>
                    <CouponRowActions couponId={c.id} status={c.status} />
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
