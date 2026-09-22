import { listLedgerEntries, getInfluencerBalanceSummary } from "@/lib/data/ledger";
import { requireSession } from "@/lib/auth/session";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { Clock, CheckCircle2, Banknote, Wallet } from "lucide-react";

export default async function MyEarningsPage() {
  const session = await requireSession();
  const [{ rows, total }, balance] = await Promise.all([
    listLedgerEntries({ pageSize: 100 }),
    getInfluencerBalanceSummary(session.user.influencerId!),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Earnings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your full earnings ledger - {total} entries</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending" value={formatCurrency(balance.pending)} icon={Clock} />
        <StatCard label="Approved" value={formatCurrency(balance.approved)} icon={CheckCircle2} />
        <StatCard label="Paid" value={formatCurrency(balance.paid)} icon={Banknote} />
        <StatCard label="Total Earned" value={formatCurrency(balance.totalEarned)} icon={Wallet} />
      </div>

      <Card>
        <CardHeader title="Ledger" subtitle="How each amount was calculated is shown under Model" />
        {rows.length === 0 ? (
          <EmptyState title="No earnings yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Course</Th>
                <Th>Type</Th>
                <Th>Model</Th>
                <Th align="right">Amount</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {rows.map((t) => (
                <Tr key={t.id}>
                  <Td>{formatDateTime(t.createdAt)}</Td>
                  <Td>{t.order.course.name}</Td>
                  <Td>{t.type}</Td>
                  <Td className="text-xs">{t.modelTypeSnapshot.replaceAll("_", " ")}</Td>
                  <Td align="right">{formatCurrency(t.influencerAmount.toString())}</Td>
                  <Td>
                    <Badge>{t.status}</Badge>
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
