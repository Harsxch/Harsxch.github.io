import Link from "next/link";
import { listInfluencers } from "@/lib/data/influencers";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { Plus, Download } from "lucide-react";

export default async function InfluencersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const { rows, total, page, pageSize } = await listInfluencers({
    search: params.search,
    status: params.status as never,
    page: params.page ? Number(params.page) : 1,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Influencers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/exports/influencers">
            <Button variant="secondary">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </a>
          <Link href="/admin/influencers/new">
            <Button>
              <Plus className="w-4 h-4" /> Add Influencer
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <form className="flex flex-wrap items-center gap-2 p-4 border-b border-slate-100">
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Search by name or email..."
            className="flex-1 min-w-0 basis-full sm:basis-auto rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <select
            name="status"
            defaultValue={params.status ?? ""}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">All statuses</option>
            {["PROSPECT", "ONBOARDING", "ACTIVE", "PAUSED", "INACTIVE"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
        </form>

        {rows.length === 0 ? (
          <EmptyState title="No influencers found" subtitle="Try adjusting your filters or add a new influencer" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Platform</Th>
                <Th>Manager</Th>
                <Th>Joined</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {rows.map((inf) => (
                <Tr key={inf.id}>
                  <Td>
                    <Link href={`/admin/influencers/${inf.id}`} className="font-medium text-slate-900 hover:underline">
                      {inf.name}
                    </Link>
                    <div className="text-xs text-slate-500">{inf.email}</div>
                  </Td>
                  <Td>{inf.category ?? "—"}</Td>
                  <Td>{inf.primaryPlatform?.name ?? "—"}</Td>
                  <Td>{inf.manager?.name ?? "—"}</Td>
                  <Td>{formatDate(inf.joiningDate)}</Td>
                  <Td>
                    <Badge>{inf.status}</Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}

        {total > pageSize && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 text-sm text-slate-500">
            <span>
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={`?page=${page - 1}`} className="text-slate-700 hover:underline">
                  Previous
                </Link>
              )}
              {page * pageSize < total && (
                <Link href={`?page=${page + 1}`} className="text-slate-700 hover:underline">
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
