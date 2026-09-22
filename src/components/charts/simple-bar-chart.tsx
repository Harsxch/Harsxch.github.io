"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/format";

/** See time-series-chart.tsx for why this takes a string `valueFormat`
 * instead of a formatter function prop. */
export function SimpleBarChart({
  data,
  xKey,
  dataKey,
  label,
  valueFormat = "number",
}: {
  data: Record<string, string | number>[];
  xKey: string;
  dataKey: string;
  label: string;
  valueFormat?: "currency" | "number";
}) {
  if (data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-sm text-slate-400">No data in this range</div>;
  }
  const format = (v: number) => (valueFormat === "currency" ? formatCurrency(v) : String(v));
  const chartData = data.map((d) => ({ ...d, [dataKey]: Number(d[dataKey]) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={format} width={60} />
        <Tooltip
          formatter={(value) => [format(Number(value)), label]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Bar dataKey={dataKey} fill="#0f172a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
