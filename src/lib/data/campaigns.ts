import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";

export async function listCampaigns() {
  const session = await requireSession();
  assertCan(session.user.role, "campaigns", "read");

  if (session.user.role === "INFLUENCER" && session.user.influencerId) {
    return prisma.campaign.findMany({
      where: { influencers: { some: { influencerId: session.user.influencerId } } },
      orderBy: { startDate: "desc" },
    });
  }

  return prisma.campaign.findMany({ orderBy: { startDate: "desc" } });
}

export async function createCampaign(
  input: {
    name: string;
    slug: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    targetSales?: number;
    targetRevenue?: number;
    courseIds: string[];
    influencerIds: string[];
  },
  actor: { id: string; email: string }
) {
  const session = await requireSession();
  assertCan(session.user.role, "campaigns", "write");

  const campaign = await prisma.$transaction(async (tx) => {
    const created = await tx.campaign.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        targetSales: input.targetSales,
        targetRevenue: input.targetRevenue,
        status: "ACTIVE",
        createdById: actor.id,
        courses: { create: input.courseIds.map((courseId) => ({ courseId })) },
        influencers: { create: input.influencerIds.map((influencerId) => ({ influencerId })) },
      },
    });
    await tx.auditLog.create({
      data: {
        userId: actor.id,
        userEmail: actor.email,
        action: "CAMPAIGN_CREATED",
        entityType: "Campaign",
        entityId: created.id,
        newValue: { name: input.name },
      },
    });
    return created;
  });

  return campaign;
}
