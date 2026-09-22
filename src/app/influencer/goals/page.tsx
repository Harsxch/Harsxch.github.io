import { listGoalsWithProgress } from "@/lib/data/goals";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function MyGoalsPage() {
  const goals = await listGoalsWithProgress();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Goals</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your targets and progress</p>
      </div>

      {goals.length === 0 ? (
        <Card>
          <EmptyState title="No goals set yet" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((g) => {
            const current = Number(g.current);
            const target = Number(g.targetValue);
            const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
            const isRevenue = g.metric === "REVENUE";

            return (
              <Card key={g.id}>
                <CardBody>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-900">{g.metric === "SALES" ? "Sales Target" : "Revenue Target"}</span>
                    <span className="text-xs text-slate-500">
                      {formatDate(g.periodStart)} → {formatDate(g.periodEnd)}
                    </span>
                  </div>
                  <div className="text-2xl font-semibold text-slate-900 tabular-nums">
                    {isRevenue ? formatCurrency(g.current) : g.current} / {isRevenue ? formatCurrency(g.targetValue.toString()) : g.targetValue.toString()}
                  </div>
                  <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{pct}% completed</div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
