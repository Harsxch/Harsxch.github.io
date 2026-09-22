import { prisma } from "@/lib/prisma";
import { BadRequestError, NotFoundError } from "@/lib/api/handler";
import { resolveAttribution } from "@/lib/attribution/strategies";
import { resolveAgreementVersion } from "@/lib/financial/resolve-agreement";
import { calculateSplit } from "@/lib/financial/calculate";
import { calculateReversal } from "@/lib/financial/reversal";
import { validateCouponForOrder } from "@/lib/coupons/validate";
import { recordAudit } from "@/lib/audit/log";
import { notify } from "@/lib/notifications/create";
import type { CreateOrderInput, CreateRefundInput } from "./schemas";

type Actor = { id: string; email: string };

/**
 * ORDER_CREATED + ORDER_PAID event, folded into one call because a manually
 * entered order always represents an already-completed sale (spec section
 * 33 lists manual admin entry as one of four ingestion methods; the other
 * three - API, webhook, CSV - would call the same downstream pipeline from
 * their own thin adapters, keeping this function payment-provider agnostic).
 */
export async function createManualOrder(input: CreateOrderInput, actor: Actor) {
  return prisma.$transaction(async (tx) => {
    const course = await tx.course.findUnique({ where: { id: input.courseId } });
    if (!course) throw new NotFoundError("Course not found");

    const discountAmount = Math.min(input.discountAmount, input.originalPrice);
    const finalAmount = input.originalPrice - discountAmount;

    const customer = await tx.customer.upsert({
      where: { email: input.customerEmail.toLowerCase().trim() },
      create: {
        email: input.customerEmail.toLowerCase().trim(),
        name: input.customerName,
        phone: input.customerPhone,
      },
      update: {},
    });

    let couponId: string | null = null;
    let couponAgreementVersionId: string | null = null;
    if (input.couponCode) {
      const coupon = await tx.coupon.findUnique({ where: { code: input.couponCode.toUpperCase().trim() } });
      if (!coupon) throw new BadRequestError(`Coupon ${input.couponCode} not found`);
      await validateCouponForOrder(tx, coupon, input.courseId, input.placedAt ?? new Date());
      couponId = coupon.id;
      couponAgreementVersionId = coupon.agreementVersionId;
      await tx.coupon.update({ where: { id: coupon.id }, data: { currentUsage: { increment: 1 } } });
    }

    const orderNumber = input.orderNumber ?? `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const placedAt = input.placedAt ?? new Date();

    const order = await tx.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        courseId: input.courseId,
        couponId,
        originalPrice: input.originalPrice,
        discountAmount,
        finalAmount,
        status: "SUCCESSFUL",
        source: "MANUAL",
        placedAt,
        createdById: actor.id,
      },
    });

    const attribution = await resolveAttribution({
      couponCode: input.couponCode,
      trackingLinkCode: input.trackingLinkCode,
    });

    await tx.orderAttribution.create({
      data: {
        orderId: order.id,
        influencerId: attribution?.influencerId ?? null,
        trackingLinkId: attribution?.trackingLinkId ?? null,
        couponId: attribution?.couponId ?? couponId,
        campaignId: attribution?.campaignId ?? null,
        source: attribution?.source ?? "NONE",
      },
    });

    if (attribution?.influencerId) {
      const agreementVersion = await resolveAgreementVersion({
        influencerId: attribution.influencerId,
        courseId: input.courseId,
        campaignId: attribution.campaignId,
        couponAgreementVersionId,
        asOf: placedAt,
      });

      if (agreementVersion) {
        const split = calculateSplit(
          {
            originalPrice: order.originalPrice.toString(),
            discountAmount: order.discountAmount.toString(),
            finalAmount: order.finalAmount.toString(),
          },
          {
            id: agreementVersion.id,
            modelType: agreementVersion.modelType,
            influencerSharePct: agreementVersion.influencerSharePct?.toString() ?? null,
            companySharePct: agreementVersion.companySharePct?.toString() ?? null,
            commissionPct: agreementVersion.commissionPct?.toString() ?? null,
            fixedAmount: agreementVersion.fixedAmount?.toString() ?? null,
            eligibleRevenueBasis: agreementVersion.eligibleRevenueBasis,
          }
        );

        await tx.financialTransaction.create({
          data: {
            orderId: order.id,
            influencerId: attribution.influencerId,
            agreementVersionId: agreementVersion.id,
            type: "EARNING",
            status: "PENDING",
            modelTypeSnapshot: agreementVersion.modelType,
            influencerSharePctSnapshot: agreementVersion.influencerSharePct,
            companySharePctSnapshot: agreementVersion.companySharePct,
            commissionPctSnapshot: agreementVersion.commissionPct,
            fixedAmountSnapshot: agreementVersion.fixedAmount,
            eligibleRevenueBasisSnapshot: agreementVersion.eligibleRevenueBasis,
            eligibleRevenue: split.eligibleRevenue,
            influencerAmount: split.influencerAmount,
            companyAmount: split.companyAmount,
          },
        });

        const influencer = await tx.influencer.findUnique({
          where: { id: attribution.influencerId },
          select: { userId: true, name: true },
        });
        if (influencer?.userId) {
          await notify(tx, {
            userId: influencer.userId,
            type: "NEW_SALE",
            title: "New sale attributed to you",
            body: `Order ${order.orderNumber} for ${course.name} - you earned ${split.influencerAmount}.`,
            entityType: "Order",
            entityId: order.id,
          });
        }
      } else {
        await recordAudit({
          actor,
          action: "AGREEMENT_NOT_FOUND",
          entityType: "Order",
          entityId: order.id,
          newValue: { influencerId: attribution.influencerId, courseId: input.courseId },
          tx,
        });
      }
    }

    await recordAudit({
      actor,
      action: "ORDER_CREATED",
      entityType: "Order",
      entityId: order.id,
      newValue: { orderNumber: order.orderNumber, finalAmount: order.finalAmount.toString() },
      tx,
    });

    return order;
  });
}

/** ORDER_REFUNDED event. Supports partial refunds; never mutates the
 * original EARNING transaction's calculation snapshot. */
export async function createRefund(orderId: string, input: CreateRefundInput, actor: Actor) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { refunds: true } });
    if (!order) throw new NotFoundError("Order not found");
    if (order.status === "CANCELLED") throw new BadRequestError("Cannot refund a cancelled order");
    if (order.status === "PENDING") throw new BadRequestError("Cannot refund an order that has not settled");

    const alreadyRefunded = order.refunds.reduce((sum, r) => sum + Number(r.amount), 0);
    const remaining = Number(order.finalAmount) - alreadyRefunded;
    if (input.amount > remaining + 0.001) {
      throw new BadRequestError(`Refund amount exceeds refundable balance (${remaining.toFixed(2)})`);
    }

    const isFullRefund = Math.abs(input.amount - remaining) < 0.01;

    const refund = await tx.refund.create({
      data: {
        orderId: order.id,
        amount: input.amount,
        isPartial: !isFullRefund,
        reason: input.reason,
        createdById: actor.id,
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: { status: isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED" },
    });

    const earningTx = await tx.financialTransaction.findFirst({
      where: { orderId: order.id, type: "EARNING" },
    });

    if (earningTx) {
      const reversal = calculateReversal({
        orderFinalAmount: order.finalAmount.toString(),
        refundAmount: input.amount.toString(),
        originalEligibleRevenue: earningTx.eligibleRevenue.toString(),
        originalInfluencerAmount: earningTx.influencerAmount.toString(),
        originalCompanyAmount: earningTx.companyAmount.toString(),
      });

      await tx.financialTransaction.create({
        data: {
          orderId: order.id,
          influencerId: earningTx.influencerId,
          agreementVersionId: earningTx.agreementVersionId,
          type: "REVERSAL",
          status: "REVERSED",
          modelTypeSnapshot: earningTx.modelTypeSnapshot,
          influencerSharePctSnapshot: earningTx.influencerSharePctSnapshot,
          companySharePctSnapshot: earningTx.companySharePctSnapshot,
          commissionPctSnapshot: earningTx.commissionPctSnapshot,
          fixedAmountSnapshot: earningTx.fixedAmountSnapshot,
          eligibleRevenueBasisSnapshot: earningTx.eligibleRevenueBasisSnapshot,
          eligibleRevenue: negate(reversal.eligibleRevenue),
          influencerAmount: negate(reversal.influencerAmount),
          companyAmount: negate(reversal.companyAmount),
          relatedTransactionId: earningTx.id,
          refundId: refund.id,
        },
      });

      if (isFullRefund) {
        await tx.financialTransaction.update({
          where: { id: earningTx.id },
          data: { status: "REVERSED" },
        });
      }

      const influencer = await tx.influencer.findUnique({
        where: { id: earningTx.influencerId },
        select: { userId: true },
      });
      if (influencer?.userId) {
        await notify(tx, {
          userId: influencer.userId,
          type: "EARNING_REVERSED",
          title: "Earnings reversed",
          body: `Order ${order.orderNumber} was ${isFullRefund ? "refunded" : "partially refunded"}; ${reversal.influencerAmount} was reversed from your balance.`,
          entityType: "Order",
          entityId: order.id,
        });
      }
    }

    await recordAudit({
      actor,
      action: "ORDER_REFUNDED",
      entityType: "Order",
      entityId: order.id,
      newValue: { amount: input.amount, isFullRefund },
      tx,
    });

    return refund;
  });
}

function negate(value: string): string {
  const n = Number(value);
  return (n === 0 ? 0 : -n).toFixed(2);
}
