import { listLedgerEntries } from "@/lib/data/ledger";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { ApproveSelection } from "./approve-selection";

export default async function EarningsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const { rows, total } = await listLedgerEntries({ status: (params.status as never) ?? "PENDING", pageSize: 100 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Earnings Ledger</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} transactions</p>
        </div>
        <a
          href={`/api/exports/earnings${params.status ? `?status=${params.status}` : ""}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Export CSV
        </a>
      </div>

      <Card>
        <CardHeader
          title="Transactions"
          action={
            <form className="flex gap-2">
              <select name="status" defaultValue={params.status ?? "PENDING"} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
                {["PENDING", "APPROVED", "PAID", "REVERSED"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button type="submit" className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                Filter
              </button>
            </form>
          }
        />
        {rows.length === 0 ? (
          <EmptyState title="No transactions" />
        ) : (
          <ApproveSelection
            rows={rows.map((t) => ({
              id: t.id,
              date: formatDateTime(t.createdAt),
              influencer: t.influencer.name,
              course: t.order.course.name,
              type: t.type,
              model: t.modelTypeSnapshot,
              amount: t.influencerAmount.toString(),
              status: t.status,
            }))}
          />
        )}
      </Card>
    </div>
  );
}
