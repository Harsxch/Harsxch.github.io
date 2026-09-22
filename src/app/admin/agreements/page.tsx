import Link from "next/link";
import { listAllAgreementVersions } from "@/lib/data/agreements";
import { Card } from "@/components/ui/card";
import { Table, Thead, Th, Tr, Td, EmptyState } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function AgreementsPage() {
  const versions = await listAllAgreementVersions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Commercial Agreements</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Active agreement versions across all influencers. Manage versions from each influencer&apos;s profile.
        </p>
      </div>

      <Card>
        {versions.length === 0 ? (
          <EmptyState title="No active agreements" />
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Influencer</Th>
                <Th>Version</Th>
                <Th>Model</Th>
                <Th>Terms</Th>
                <Th>Scope</Th>
                <Th>Effective</Th>
              </Tr>
            </Thead>
            <tbody>
              {versions.map((v) => (
                <Tr key={v.id}>
                  <Td>
                    <Link href={`/admin/influencers/${v.agreement.influencer.id}`} className="text-slate-900 font-medium hover:underline">
                      {v.agreement.influencer.name}
                    </Link>
                  </Td>
                  <Td>v{v.version}</Td>
                  <Td>
                    <Badge color="slate">{v.modelType.replaceAll("_", " ")}</Badge>
                  </Td>
                  <Td className="text-xs">
                    {v.modelType === "REVENUE_SHARE" && `${v.influencerSharePct}% / ${v.companySharePct}%`}
                    {v.modelType === "PERCENTAGE_COMMISSION" && `${v.commissionPct}%`}
                    {v.modelType === "FIXED_PER_SALE" && formatCurrency(v.fixedAmount?.toString())}
                    {v.modelType === "HYBRID" &&
                      `${v.influencerSharePct ?? v.commissionPct}% + ${formatCurrency(v.fixedAmount?.toString())}`}
                  </Td>
                  <Td className="text-xs text-slate-500">
                    {v.courseScopes.length === 0 && v.campaignScopes.length === 0
                      ? "All courses"
                      : [
                          ...v.courseScopes.map((s) => s.course.name),
                          ...v.campaignScopes.map((s) => s.campaign.name),
                        ].join(", ")}
                  </Td>
                  <Td className="text-xs">
                    {formatDate(v.effectiveFrom)} → {v.effectiveUntil ? formatDate(v.effectiveUntil) : "onwards"}
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
