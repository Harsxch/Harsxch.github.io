"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/format";

/**
 * `valueFormat` is a plain string (not a function) on purpose: this is a
 * Client Component rendered from Server Component pages, and React Server
 * Components cannot serialize function props across that boundary (only
 * Server Actions can cross it as callable references). Formatting happens
 * INSIDE this client component instead.
 */
export function TimeSeriesChart({
  data,
  dataKey,
  label,
  valueFormat = "number",
}: {
  data: { day: string; [key: string]: string | number }[];
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
      <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={format} width={60} />
        <Tooltip
          formatter={(value) => [format(Number(value)), label]}
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Area type="monotone" dataKey={dataKey} stroke="#0f172a" strokeWidth={2} fill={`url(#gradient-${dataKey})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
