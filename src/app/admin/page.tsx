import { getAdminDashboard } from "@/lib/data/dashboard";
import { resolveRange } from "@/lib/date-range";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RangeSelect } from "@/components/ui/range-select";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { SimpleBarChart } from "@/components/charts/simple-bar-chart";
import { formatCurrency, formatDate } from "@/lib/format";
import { Users, ShoppingCart, IndianRupee, Wallet, Banknote, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range: rangeKey } = await searchParams;
  const range = resolveRange(rangeKey);
  const data = await getAdminDashboard({ from: range.from, to: range.to });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Influencer channel performance overview</p>
        </div>
        <RangeSelect current={range.key} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Influencers" value={String(data.kpis.totalInfluencers)} icon={Users} hint={`${data.kpis.activeInfluencers} active`} />
        <StatCard label="Total Sales" value={String(data.kpis.totalSales)} icon={ShoppingCart} />
        <StatCard label="Total Revenue" value={formatCurrency(data.kpis.totalRevenue)} icon={IndianRupee} />
        <StatCard label="Influencer Earnings" value={formatCurrency(data.kpis.totalInfluencerEarnings)} icon={Wallet} />
        <StatCard label="Company Retained" value={formatCurrency(data.kpis.companyRetainedRevenue)} icon={TrendingUp} />
        <StatCard label="Pending Payouts" value={formatCurrency(data.kpis.pendingPayouts)} icon={Banknote} />
        <StatCard label="Paid Payouts" value={formatCurrency(data.kpis.paidPayouts)} icon={Banknote} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Revenue over time" subtitle="Final amount collected per day" />
          <CardBody>
            <TimeSeriesChart data={data.revenueOverTime} dataKey="revenue" label="Revenue" valueFormat="currency" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Revenue by course" />
          <CardBody>
            <SimpleBarChart data={data.salesByCourse} xKey="courseName" dataKey="revenue" label="Revenue" valueFormat="currency" />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Top influencers" subtitle="By revenue in range" />
          {data.topInfluencers.length === 0 ? (
            <EmptyState title="No sales in this range" />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Influencer</Th>
                  <Th align="right">Sales</Th>
                  <Th align="right">Revenue</Th>
                  <Th align="right">Earnings</Th>
                </Tr>
              </Thead>
              <tbody>
                {data.topInfluencers.map((inf) => (
                  <Tr key={inf.influencerId}>
                    <Td>{inf.name}</Td>
                    <Td align="right">{inf.sales}</Td>
                    <Td align="right">{formatCurrency(inf.revenue)}</Td>
                    <Td align="right">{formatCurrency(inf.earnings)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Recent orders" />
          {data.recentOrders.length === 0 ? (
            <EmptyState title="No orders in this range" />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Order</Th>
                  <Th>Course</Th>
                  <Th>Influencer</Th>
                  <Th align="right">Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <Tr key={o.id}>
                    <Td className="font-mono text-xs">{o.orderNumber}</Td>
                    <Td>{o.course.name}</Td>
                    <Td>{o.attribution?.influencer?.name ?? "—"}</Td>
                    <Td align="right">{formatCurrency(o.finalAmount.toString())}</Td>
                    <Td>
                      <Badge>{o.status}</Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent refunds" />
        {data.recentRefunds.length === 0 ? (
          <EmptyState title="No refunds in this range" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Order</Th>
                <Th align="right">Amount</Th>
                <Th>Type</Th>
                <Th>Date</Th>
                <Th>Reason</Th>
              </Tr>
            </Thead>
            <tbody>
              {data.recentRefunds.map((r) => (
                <Tr key={r.id}>
                  <Td className="font-mono text-xs">{r.order.orderNumber}</Td>
                  <Td align="right">{formatCurrency(r.amount.toString())}</Td>
                  <Td>{r.isPartial ? <Badge color="amber">Partial</Badge> : <Badge color="red">Full</Badge>}</Td>
                  <Td>{formatDate(r.refundedAt)}</Td>
                  <Td className="text-slate-500">{r.reason ?? "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
