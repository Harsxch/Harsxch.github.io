import { requireSession } from "@/lib/auth/session";
import { getInfluencerDashboard } from "@/lib/data/dashboard";
import { resolveRange } from "@/lib/date-range";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { RangeSelect } from "@/components/ui/range-select";
import { TimeSeriesChart } from "@/components/charts/time-series-chart";
import { formatCurrency } from "@/lib/format";
import { ShoppingCart, IndianRupee, Clock, CheckCircle2, Banknote, Wallet } from "lucide-react";

export default async function InfluencerDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await requireSession();
  const { range: rangeKey } = await searchParams;
  const range = resolveRange(rangeKey);
  const data = await getInfluencerDashboard(session.user.influencerId!, { from: range.from, to: range.to });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Welcome back, {session.user.name.split(" ")[0]}</h1>
          <p className="text-sm text-slate-500 mt-0.5">Here&apos;s how your promotions are performing</p>
        </div>
        <RangeSelect current={range.key} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Sales Today" value={String(data.kpis.salesToday)} icon={ShoppingCart} />
        <StatCard label="Sales This Week" value={String(data.kpis.salesWeek)} icon={ShoppingCart} />
        <StatCard label="Sales This Month" value={String(data.kpis.salesMonth)} icon={ShoppingCart} />
        <StatCard label="Total Sales" value={String(data.kpis.salesTotal)} icon={ShoppingCart} />
        <StatCard label="Revenue Generated" value={formatCurrency(data.kpis.revenueGenerated)} icon={IndianRupee} hint="in selected range" />
        <StatCard label="Pending Earnings" value={formatCurrency(data.kpis.pendingEarnings)} icon={Clock} />
        <StatCard label="Approved Earnings" value={formatCurrency(data.kpis.approvedEarnings)} icon={CheckCircle2} />
        <StatCard label="Paid Earnings" value={formatCurrency(data.kpis.paidEarnings)} icon={Banknote} />
      </div>

      <StatCard label="Total Earnings (all time)" value={formatCurrency(data.kpis.totalEarnings)} icon={Wallet} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Earnings over time" />
          <CardBody>
            <TimeSeriesChart data={data.timeSeries} dataKey="earnings" label="Earnings" valueFormat="currency" />
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Course-wise performance" />
          {data.courseWise.length === 0 ? (
            <EmptyState title="No sales yet" />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Course</Th>
                  <Th align="right">Sales</Th>
                  <Th align="right">Revenue</Th>
                  <Th align="right">Earnings</Th>
                </Tr>
              </Thead>
              <tbody>
                {data.courseWise.map((c) => (
                  <Tr key={c.courseName}>
                    <Td>{c.courseName}</Td>
                    <Td align="right">{c.sales}</Td>
                    <Td align="right">{formatCurrency(c.revenue)}</Td>
                    <Td align="right">{formatCurrency(c.earnings)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Platform-wise performance" />
        {data.platformWise.length === 0 ? (
          <EmptyState title="No sales yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Platform</Th>
                <Th align="right">Sales</Th>
                <Th align="right">Revenue</Th>
              </Tr>
            </Thead>
            <tbody>
              {data.platformWise.map((p) => (
                <Tr key={p.platformName}>
                  <Td>{p.platformName}</Td>
                  <Td align="right">{p.sales}</Td>
                  <Td align="right">{formatCurrency(p.revenue)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
