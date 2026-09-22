import { listPayouts } from "@/lib/data/payouts";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function MyPayoutsPage() {
  const payouts = await listPayouts();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Payouts</h1>
        <p className="text-sm text-slate-500 mt-0.5">{payouts.length} total</p>
      </div>

      <Card>
        {payouts.length === 0 ? (
          <EmptyState title="No payouts yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th align="right">Amount</Th>
                <Th>Reference</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {payouts.map((p) => (
                <Tr key={p.id}>
                  <Td>{formatDate(p.initiatedAt)}</Td>
                  <Td align="right">{formatCurrency(p.amount.toString())}</Td>
                  <Td className="font-mono text-xs">{p.reference ?? "—"}</Td>
                  <Td>
                    <Badge>{p.status}</Badge>
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
