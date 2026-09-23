import { requireSession } from "@/lib/auth/session";
import { getInfluencerProfile } from "@/lib/data/influencers";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function ProfilePage() {
  const session = await requireSession();
  const influencer = await getInfluencerProfile(session.user.influencerId!);
  if (!influencer) return null;

  const activeAgreement = influencer.agreements[0]?.versions.find((v) => v.status === "ACTIVE" && v.courseScopes.length === 0 && v.campaignScopes.length === 0);

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{influencer.name}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{influencer.email}</p>
        </div>
        <Badge>{influencer.status}</Badge>
      </div>

      <Card>
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

      <Card>
        <CardHeader title="My commercial agreement" subtitle="How your earnings are calculated" />
        <CardBody>
          {!activeAgreement ? (
            <p className="text-sm text-slate-400">No general agreement is set up yet. Contact your manager.</p>
          ) : (
            <div className="space-y-2 text-sm">
              <Row label="Model" value={activeAgreement.modelType.replaceAll("_", " ")} />
              {activeAgreement.modelType === "REVENUE_SHARE" && (
                <Row label="Split" value={`${activeAgreement.influencerSharePct}% you / ${activeAgreement.companySharePct}% company`} />
              )}
              {activeAgreement.modelType === "PERCENTAGE_COMMISSION" && (
                <Row label="Commission" value={`${activeAgreement.commissionPct}%`} />
              )}
              {activeAgreement.modelType === "FIXED_PER_SALE" && (
                <Row label="Fixed amount" value={`${formatCurrency(activeAgreement.fixedAmount?.toString())} per sale`} />
              )}
              <Row
                label="Calculated on"
                value={
                  activeAgreement.eligibleRevenueBasis === "DISCOUNTED"
                    ? "The amount the customer actually paid, after discount"
                    : activeAgreement.eligibleRevenueBasis === "GROSS"
                      ? "The course's original listed price"
                      : "The amount paid, net of any refunds"
                }
              />
              <Row label="Effective from" value={formatDate(activeAgreement.effectiveFrom)} />
            </div>
          )}
          <p className="text-xs text-slate-400 mt-3">
            Some courses or campaigns may have a different override agreement - your actual earnings per order always
            reflect the specific terms that applied at the time of that sale.
          </p>
        </CardBody>
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
