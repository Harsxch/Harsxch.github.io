import { listTrackingLinks } from "@/lib/data/tracking-links";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { LinkCell } from "./link-cell";

export default async function MyLinksPage() {
  const links = await listTrackingLinks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Links</h1>
        <p className="text-sm text-slate-500 mt-0.5">One-click copy your tracking links</p>
      </div>

      <Card>
        {links.length === 0 ? (
          <EmptyState title="No tracking links yet" subtitle="Ask your influencer manager to create one" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Link</Th>
                <Th>Course</Th>
                <Th>Platform</Th>
                <Th align="right">Clicks</Th>
                <Th align="right">Sales</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">Earnings</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {links.map((l) => (
                <Tr key={l.id}>
                  <Td>
                    <LinkCell code={l.code} />
                  </Td>
                  <Td>{l.course.name}</Td>
                  <Td>{l.platform.name}</Td>
                  <Td align="right">{l.clicks}</Td>
                  <Td align="right">{l.sales}</Td>
                  <Td align="right">{formatCurrency(l.revenue)}</Td>
                  <Td align="right">{formatCurrency(l.earnings)}</Td>
                  <Td>
                    <Badge>{l.status}</Badge>
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
