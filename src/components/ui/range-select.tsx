"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { RANGE_OPTIONS } from "@/lib/date-range";

export function RangeSelect({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={current}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("range", e.target.value);
        router.push(`${pathname}?${params.toString()}`);
      }}
      className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
    >
      {RANGE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
