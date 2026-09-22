import { notFound } from "next/navigation";
import { getInfluencerProfile } from "@/lib/data/influencers";
import { listCourses } from "@/lib/data/courses";
import { listCampaigns } from "@/lib/data/campaigns";
import { listOrders } from "@/lib/data/orders";
import { getInfluencerBalanceSummary } from "@/lib/data/ledger";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { AgreementVersionForm } from "./agreement-form";
import { formatCurrency, formatDate } from "@/lib/format";
import { Wallet, Clock, CheckCircle2, Banknote } from "lucide-react";

export default async function InfluencerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [influencer, courses, campaigns, orders, balance] = await Promise.all([
    getInfluencerProfile(id),
    listCourses({ status: "ACTIVE" }),
    listCampaigns(),
    listOrders({ influencerId: id, pageSize: 10 }),
    getInfluencerBalanceSummary(id),
  ]);

  if (!influencer) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{influencer.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{influencer.email}</p>
        </div>
        <Badge>{influencer.status}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Pending" value={formatCurrency(balance.pending)} icon={Clock} />
        <StatCard label="Approved" value={formatCurrency(balance.approved)} icon={CheckCircle2} />
        <StatCard label="Paid" value={formatCurrency(balance.paid)} icon={Banknote} />
        <StatCard label="Total Earned" value={formatCurrency(balance.totalEarned)} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader title="Profile" />
          <CardBody className="space-y-2 text-sm">
            <Row label="Phone" value={influencer.phone} />
            <Row label="Category" value={influencer.category} />
            <Row label="Platform" value={influencer.primaryPlatform?.name} />
            <Row label="Manager" value={influencer.manager?.name} />
            <Row label="Joined" value={formatDate(influencer.joiningDate)} />
            <Row label="YouTube" value={influencer.youtubeUrl} />
            <Row label="Instagram" value={influencer.instagramUrl} />
          </CardBody>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Commercial agreement" subtitle="Versioned - never edited in place" />
          <CardBody>
            {influencer.agreements.length === 0 || influencer.agreements[0].versions.length === 0 ? (
              <EmptyState title="No commercial agreement yet" subtitle="Add the first version below" />
            ) : (
              <div className="space-y-2">
                {influencer.agreements[0].versions.map((v) => (
                  <div key={v.id} className="border border-slate-200 rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">
                        v{v.version} - {v.modelType.replaceAll("_", " ")}
                      </span>
                      <Badge>{v.status}</Badge>
                    </div>
                    <div className="text-slate-500 text-xs mt-1">
                      {v.modelType === "REVENUE_SHARE" &&
                        `${v.influencerSharePct}% influencer / ${v.companySharePct}% company`}
                      {v.modelType === "PERCENTAGE_COMMISSION" && `${v.commissionPct}% commission`}
                      {v.modelType === "FIXED_PER_SALE" && `${formatCurrency(v.fixedAmount?.toString())} per sale`}
                      {v.modelType === "HYBRID" &&
                        `${v.influencerSharePct ?? v.commissionPct}% base + ${formatCurrency(v.fixedAmount?.toString())} bonus`}
                      {" · "}
                      {formatDate(v.effectiveFrom)} → {v.effectiveUntil ? formatDate(v.effectiveUntil) : "onwards"}
                    </div>
                    {(v.courseScopes.length > 0 || v.campaignScopes.length > 0) && (
                      <div className="text-xs text-slate-500 mt-1">
                        Scoped to: {v.courseScopes.map((s) => s.course.name).join(", ")}
                        {v.courseScopes.length > 0 && v.campaignScopes.length > 0 && " · "}
                        {v.campaignScopes.map((s) => s.campaign.name).join(", ")}
                      </div>
                    )}
                    {v.notes && <div className="text-xs text-slate-400 mt-1 italic">{v.notes}</div>}
                  </div>
                ))}
              </div>
            )}

            <AgreementVersionForm
              influencerId={id}
              courses={courses.map((c) => ({ id: c.id, name: c.name }))}
              campaigns={campaigns.map((c) => ({ id: c.id, name: c.name }))}
            />
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Tracking links" />
          {influencer.trackingLinks.length === 0 ? (
            <EmptyState title="No tracking links yet" />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Code</Th>
                  <Th>Course</Th>
                  <Th align="right">Clicks</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <tbody>
                {influencer.trackingLinks.map((l) => (
                  <Tr key={l.id}>
                    <Td className="font-mono text-xs">{l.code}</Td>
                    <Td>{l.course.name}</Td>
                    <Td align="right">{l.clicks}</Td>
                    <Td>
                      <Badge>{l.status}</Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>

        <Card>
          <CardHeader title="Coupons" />
          {influencer.coupons.length === 0 ? (
            <EmptyState title="No coupons yet" />
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Code</Th>
                  <Th>Discount</Th>
                  <Th align="right">Used</Th>
                  <Th>Status</Th>
                </Tr>
              </Thead>
              <tbody>
                {influencer.coupons.map((c) => (
                  <Tr key={c.id}>
                    <Td className="font-mono text-xs">{c.code}</Td>
                    <Td>
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : formatCurrency(c.discountValue.toString())}
                    </Td>
                    <Td align="right">
                      {c.currentUsage}
                      {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                    </Td>
                    <Td>
                      <Badge>{c.status}</Badge>
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader title="Recent orders" />
        {orders.rows.length === 0 ? (
          <EmptyState title="No orders yet" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Order</Th>
                <Th>Course</Th>
                <Th align="right">Amount</Th>
                <Th align="right">Earnings</Th>
                <Th>Status</Th>
              </Tr>
            </Thead>
            <tbody>
              {orders.rows.map((o) => (
                <Tr key={o.id}>
                  <Td className="font-mono text-xs">{o.orderNumber}</Td>
                  <Td>{o.courseName}</Td>
                  <Td align="right">{formatCurrency(o.finalAmount)}</Td>
                  <Td align="right">{formatCurrency(o.influencerAmount)}</Td>
                  <Td>
                    <Badge>{o.status}</Badge>
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

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-1 border-b border-slate-50 last:border-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-medium text-right">{value || "—"}</span>
    </div>
  );
}
