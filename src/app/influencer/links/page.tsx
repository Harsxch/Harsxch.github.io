import { listTrackingLinks } from "@/lib/data/tracking-links";
import { listCourses } from "@/lib/data/courses";
import { listPlatforms } from "@/lib/data/influencers";
import { listCampaigns } from "@/lib/data/campaigns";
import { listCoupons } from "@/lib/data/coupons";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { LinkCell } from "./link-cell";
import { CreateMyLinkForm } from "./create-form";
import { MyLinkRowActions } from "./row-actions";

export default async function MyLinksPage() {
  const [links, courses, platforms, campaigns, coupons] = await Promise.all([
    listTrackingLinks(),
    listCourses(),
    listPlatforms(),
    listCampaigns(),
    listCoupons(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Links</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Build your own link: pick a course, set your own UTM source/medium/campaign/content/term, and optionally
          attach one of your coupons.
        </p>
      </div>

      <Card>
        <CardHeader title="Create a link" />
        <CardBody>
          <CreateMyLinkForm
            courses={courses.map((c) => ({ id: c.id, name: c.name }))}
            platforms={platforms.map((p) => ({ id: p.id, name: p.name }))}
            campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
            coupons={coupons.map((c) => ({ id: c.id, code: c.code }))}
          />
        </CardBody>
      </Card>

      <Card>
        {links.length === 0 ? (
          <EmptyState title="No tracking links yet" subtitle="Create one above, or ask your influencer manager" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Link</Th>
                <Th>Course</Th>
                <Th>Platform</Th>
                <Th>UTM source / medium</Th>
                <Th>UTM campaign / content / term</Th>
                <Th>Coupon</Th>
                <Th align="right">Clicks</Th>
                <Th align="right">Sales</Th>
                <Th align="right">Revenue</Th>
                <Th align="right">Earnings</Th>
                <Th>Status</Th>
                <Th></Th>
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
                  <Td className="text-xs text-slate-500">
                    {l.utmSource} / {l.utmMedium}
                  </Td>
                  <Td className="text-xs text-slate-500">
                    {l.utmCampaign} / {l.utmContent} / {l.utmTerm ?? "—"}
                  </Td>
                  <Td className="font-mono text-xs">{l.coupon?.code ?? "—"}</Td>
                  <Td align="right">{l.clicks}</Td>
                  <Td align="right">{l.sales}</Td>
                  <Td align="right">{formatCurrency(l.revenue)}</Td>
                  <Td align="right">{formatCurrency(l.earnings)}</Td>
                  <Td>
                    <Badge>{l.status}</Badge>
                  </Td>
                  <Td>
                    <MyLinkRowActions linkId={l.id} status={l.status} />
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
