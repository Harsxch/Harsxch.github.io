import { listPayouts, getPayoutablesByInfluencer } from "@/lib/data/payouts";
import { Card, CardHeader } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { PayoutRowActions, CreatePayoutButton } from "./row-actions";

export default async function PayoutsPage() {
  const [payouts, payoutables] = await Promise.all([listPayouts(), getPayoutablesByInfluencer()]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Payouts</h1>
          <p className="text-sm text-slate-500 mt-0.5">{payouts.length} total</p>
        </div>
        <a
          href="/api/exports/payouts"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </a>
      </div>

      <Card>
        <CardHeader title="Ready to pay out" subtitle="Approved earnings not yet included in a payout" />
        {payoutables.length === 0 ? (
          <EmptyState title="Nothing to pay out" subtitle="Approve pending earnings first" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Influencer</Th>
                <Th align="right">Net amount</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <tbody>
              {payoutables.map((p) => (
                <Tr key={p.influencerId}>
                  <Td>{p.influencerName}</Td>
                  <Td align="right">{formatCurrency(p.amount)}</Td>
                  <Td>
                    <CreatePayoutButton influencerId={p.influencerId} />
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Payout history" />
        {payouts.length === 0 ? (
          <EmptyState title="No payouts yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Influencer</Th>
                <Th align="right">Amount</Th>
                <Th>Initiated</Th>
                <Th>Status</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <tbody>
              {payouts.map((p) => (
                <Tr key={p.id}>
                  <Td>{p.influencer.name}</Td>
                  <Td align="right">{formatCurrency(p.amount.toString())}</Td>
                  <Td>{formatDate(p.initiatedAt)}</Td>
                  <Td>
                    <Badge>{p.status}</Badge>
                  </Td>
                  <Td>
                    <PayoutRowActions payoutId={p.id} status={p.status} />
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
