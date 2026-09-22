import { listAuditLogs } from "@/lib/data/audit";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const { rows, total, page, pageSize } = await listAuditLogs({ page: params.page ? Number(params.page) : 1 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Audit Logs</h1>
        <p className="text-sm text-slate-500 mt-0.5">{total} entries · immutable, append-only</p>
      </div>

      <Card>
        {rows.length === 0 ? (
          <EmptyState title="No audit entries yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Time</Th>
                <Th>Actor</Th>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>Details</Th>
              </Tr>
            </Thead>
            <tbody>
              {rows.map((log) => (
                <Tr key={log.id}>
                  <Td className="text-xs whitespace-nowrap">{formatDateTime(log.createdAt)}</Td>
                  <Td className="text-xs">{log.userEmail}</Td>
                  <Td className="text-xs font-medium">{log.action}</Td>
                  <Td className="text-xs">
                    {log.entityType} <span className="text-slate-400 font-mono">{log.entityId.slice(0, 8)}</span>
                  </Td>
                  <Td className="text-xs text-slate-500 max-w-xs truncate">
                    {log.newValue ? JSON.stringify(log.newValue) : ""}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
        {total > pageSize && (
          <div className="px-5 py-3 border-t border-slate-100 text-xs text-slate-500">
            Page {page} of {Math.ceil(total / pageSize)}
          </div>
        )}
      </Card>
    </div>
  );
}
