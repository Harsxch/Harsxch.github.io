import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderDetail } from "@/lib/data/orders";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { RefundForm } from "./refund-form";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();

  const alreadyRefunded = order.refunds.reduce((sum, r) => sum + Number(r.amount), 0);
  const remaining = Number(order.finalAmount) - alreadyRefunded;
  const canRefund = ["SUCCESSFUL", "PARTIALLY_REFUNDED"].includes(order.status) && remaining > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 font-mono">{order.orderNumber}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{formatDateTime(order.placedAt)}</p>
        </div>
        <Badge>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Order" />
          <CardBody className="space-y-2 text-sm">
            <Row label="Course" value={order.course.name} />
            <Row label="Original price" value={formatCurrency(order.originalPrice.toString())} />
            <Row label="Discount" value={formatCurrency(order.discountAmount.toString())} />
            <Row label="Final amount" value={formatCurrency(order.finalAmount.toString())} />
            <Row label="Coupon" value={order.coupon?.code} />
            {order.customer && <Row label="Customer" value={`${order.customer.name ?? ""} (${order.customer.email})`} />}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Attribution" />
          <CardBody className="space-y-2 text-sm">
            <Row
              label="Influencer"
              value={
                order.attribution?.influencer ? (
                  <Link href={`/admin/influencers/${order.attribution.influencer.id}`} className="hover:underline">
                    {order.attribution.influencer.name}
                  </Link>
                ) : undefined
              }
            />
            <Row label="Source" value={order.attribution?.source} />
            <Row label="Tracking link" value={order.attribution?.trackingLink?.code} />
            <Row label="Campaign" value={order.attribution?.campaign?.name} />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Financial transactions" subtitle="Immutable calculation snapshots" />
        <CardBody className="space-y-3">
          {order.transactions.length === 0 ? (
            <p className="text-sm text-slate-400">No financial transaction was created (order was not attributed to an influencer with a matching agreement).</p>
          ) : (
            order.transactions.map((t) => (
              <div key={t.id} className="border border-slate-200 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{t.type}</span>
                  <Badge>{t.status}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                  <Row label="Eligible revenue" value={formatCurrency(t.eligibleRevenue.toString())} />
                  <Row label="Influencer amount" value={formatCurrency(t.influencerAmount.toString())} />
                  {t.companyAmount !== null && <Row label="Company amount" value={formatCurrency(t.companyAmount.toString())} />}
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  Model: {t.modelTypeSnapshot.replaceAll("_", " ")} · Basis: {t.eligibleRevenueBasisSnapshot}
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      {order.refunds.length > 0 && (
        <Card>
          <CardHeader title="Refunds" />
          <CardBody className="space-y-2 text-sm">
            {order.refunds.map((r) => (
              <div key={r.id} className="flex justify-between border-b border-slate-50 pb-2 last:border-0">
                <span>
                  {formatDateTime(r.refundedAt)} {r.reason && `- ${r.reason}`}
                </span>
                <span className="font-medium">{formatCurrency(r.amount.toString())}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {canRefund && (
        <Card>
          <CardHeader title="Issue refund" subtitle={`Refundable balance: ${formatCurrency(remaining.toFixed(2))}`} />
          <CardBody>
            <RefundForm orderId={order.id} maxAmount={remaining} />
          </CardBody>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-900 font-medium text-right">{value || "—"}</span>
    </div>
  );
}
