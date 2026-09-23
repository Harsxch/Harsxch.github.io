"use client";

import { useState } from "react";
import { Loader2, CalendarRange, AlertTriangle, SearchX } from "lucide-react";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { Table, Thead, Th, Tr, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format";
import type { InfluencerSalesResponse, SalesFilterOptions, SalesFilters } from "@/lib/sales-tracking/types";

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900";
const labelClass = "block text-xs font-medium text-slate-700 mb-1";

const EMPTY_FILTERS: SalesFilters = {
  startDate: "",
  endDate: "",
  utmContent: "",
  utmSource: "",
  utmMedium: "",
  utmCampaign: "",
  utmTerm: "",
  couponCode: "",
  courseName: "",
};

type ViewState = "idle" | "loading" | "error" | "loaded";

export function SalesTrackingClient({ options }: { options: SalesFilterOptions }) {
  const [filters, setFilters] = useState<SalesFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<ViewState>("idle");
  const [data, setData] = useState<InfluencerSalesResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function updateFilter(key: keyof SalesFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setView("idle");
    setData(null);
    setValidationError(null);
  }

  async function applyFilters() {
    if (!filters.startDate || !filters.endDate) {
      setValidationError("Please select both a start date and an end date");
      return;
    }
    setValidationError(null);
    setView("loading");

    try {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value) params.set(key, value);
      }
      const res = await fetch(`/api/influencer/sales-tracking?${params.toString()}`);
      if (!res.ok) throw new Error("Request failed");
      const json: InfluencerSalesResponse = await res.json();
      setData(json);
      setView("loaded");
    } catch {
      setView("error");
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className={labelClass}>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => updateFilter("startDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => updateFilter("endDate", e.target.value)}
                className={inputClass}
              />
            </div>
            <FilterSelect
              label="UTM Source"
              value={filters.utmSource ?? ""}
              options={options.utmSource}
              onChange={(v) => updateFilter("utmSource", v)}
            />
            <FilterSelect
              label="UTM Medium"
              value={filters.utmMedium ?? ""}
              options={options.utmMedium}
              onChange={(v) => updateFilter("utmMedium", v)}
            />
            <FilterSelect
              label="UTM Campaign"
              value={filters.utmCampaign ?? ""}
              options={options.utmCampaign}
              onChange={(v) => updateFilter("utmCampaign", v)}
            />
            <FilterSelect
              label="UTM Content"
              value={filters.utmContent ?? ""}
              options={options.utmContent}
              onChange={(v) => updateFilter("utmContent", v)}
            />
            <FilterSelect
              label="UTM Term"
              value={filters.utmTerm ?? ""}
              options={options.utmTerm}
              onChange={(v) => updateFilter("utmTerm", v)}
            />
            <FilterSelect
              label="Coupon Code"
              value={filters.couponCode ?? ""}
              options={options.couponCode}
              onChange={(v) => updateFilter("couponCode", v)}
            />
            <FilterSelect
              label="Course Name"
              value={filters.courseName ?? ""}
              options={options.courseName}
              onChange={(v) => updateFilter("courseName", v)}
            />
          </div>

          {validationError && <p className="text-sm text-red-600 mt-3">{validationError}</p>}

          <div className="flex gap-2 mt-4">
            <Button onClick={applyFilters} disabled={view === "loading"}>
              Apply Filters
            </Button>
            <Button variant="secondary" onClick={clearFilters} disabled={view === "loading"}>
              Clear Filters
            </Button>
          </div>
        </CardBody>
      </Card>

      {view === "idle" && (
        <Card>
          <CardBody className="text-center py-14">
            <CalendarRange className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">Select a date range to view your sales</p>
            <p className="text-xs text-slate-400 mt-1">Add UTM, coupon, or course filters if you want to narrow it down.</p>
          </CardBody>
        </Card>
      )}

      {view === "loading" && (
        <Card>
          <CardBody className="text-center py-14">
            <Loader2 className="w-6 h-6 text-slate-400 mx-auto mb-3 animate-spin" />
            <p className="text-sm text-slate-500">Fetching your sales...</p>
          </CardBody>
        </Card>
      )}

      {view === "error" && (
        <Card>
          <CardBody className="text-center py-14">
            <AlertTriangle className="w-8 h-8 text-red-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">Unable to load sales right now. Please try again.</p>
            <Button variant="secondary" onClick={applyFilters} className="mt-4">
              Retry
            </Button>
          </CardBody>
        </Card>
      )}

      {view === "loaded" && data && data.sales.length === 0 && (
        <Card>
          <CardBody className="text-center py-14">
            <SearchX className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">No sales found for the selected filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try changing your date range or filters.</p>
          </CardBody>
        </Card>
      )}

      {view === "loaded" && data && data.sales.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Sales" value={String(data.summary.totalSales)} />
            <StatCard label="Total Revenue" value={formatCurrency(data.summary.totalRevenue)} />
            <StatCard label="Courses Sold" value={String(data.summary.coursesSold)} />
          </div>

          <Card>
            <CardHeader title="Course-wise breakdown" />
            <Table>
              <Thead>
                <Tr>
                  <Th>Course</Th>
                  <Th align="right">Sales</Th>
                  <Th align="right">Revenue</Th>
                </Tr>
              </Thead>
              <tbody>
                {data.courseBreakdown.map((c) => (
                  <Tr key={c.courseName}>
                    <Td>{c.courseName}</Td>
                    <Td align="right">{c.sales}</Td>
                    <Td align="right">{formatCurrency(c.revenue)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>

          <Card>
            <CardHeader title="UTM content breakdown" subtitle="Which specific video/post/link is generating sales" />
            <Table>
              <Thead>
                <Tr>
                  <Th>UTM Content</Th>
                  <Th align="right">Sales</Th>
                  <Th align="right">Revenue</Th>
                </Tr>
              </Thead>
              <tbody>
                {data.utmBreakdown.map((u) => (
                  <Tr key={u.utmContent}>
                    <Td>{u.utmContent}</Td>
                    <Td align="right">{u.sales}</Td>
                    <Td align="right">{formatCurrency(u.revenue)}</Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>

          <Card>
            <CardHeader title="Sales" subtitle={`${data.sales.length} orders matching your filters`} />
            <Table>
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Course</Th>
                  <Th>UTM Source</Th>
                  <Th>UTM Medium</Th>
                  <Th>UTM Campaign</Th>
                  <Th>UTM Content</Th>
                  <Th>UTM Term</Th>
                  <Th>Coupon</Th>
                  <Th>User ID</Th>
                  <Th>Order ID</Th>
                  <Th align="right">Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <tbody>
                {data.sales.map((s) => (
                  <Tr key={s.orderId}>
                    <Td>{formatDate(s.date)}</Td>
                    <Td>{s.courseName}</Td>
                    <Td className="text-xs text-slate-500">{s.utmSource ?? "—"}</Td>
                    <Td className="text-xs text-slate-500">{s.utmMedium ?? "—"}</Td>
                    <Td className="text-xs text-slate-500">{s.utmCampaign ?? "—"}</Td>
                    <Td className="text-xs text-slate-500">{s.utmContent ?? "—"}</Td>
                    <Td className="text-xs text-slate-500">{s.utmTerm ?? "—"}</Td>
                    <Td className="font-mono text-xs">{s.couponCode ?? "—"}</Td>
                    <Td className="font-mono text-xs">{s.userId}</Td>
                    <Td className="font-mono text-xs">{s.orderId}</Td>
                    <Td align="right">{formatCurrency(s.saleAmount)}</Td>
                    <Td>
                      <Badge>{s.saleStatus}</Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
