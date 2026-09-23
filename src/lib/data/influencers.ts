import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { assertOwnInfluencerScope } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import type { InfluencerStatus } from "@/generated/prisma/enums";

export async function listInfluencers(params: {
  search?: string;
  status?: InfluencerStatus;
  platformId?: string;
  managerId?: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await requireSession();
  assertCan(session.user.role, "influencers", "read");

  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 25, 100);

  const where = {
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.status ? { status: params.status } : {}),
    ...(params.platformId ? { primaryPlatformId: params.platformId } : {}),
    ...(params.managerId ? { managerId: params.managerId } : {}),
  };

  const [rows, total] = await Promise.all([
    prisma.influencer.findMany({
      where,
      include: { primaryPlatform: true, manager: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.influencer.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}

export async function getInfluencerProfile(influencerId: string) {
  const session = await requireSession();
  assertCan(session.user.role, "influencers", "read");
  assertOwnInfluencerScope(session.user, influencerId);

  const influencer = await prisma.influencer.findUnique({
    where: { id: influencerId },
    include: {
      primaryPlatform: true,
      manager: { select: { id: true, name: true, email: true } },
      courseAccess: { include: { course: true } },
      campaigns: { include: { campaign: true } },
      trackingLinks: { include: { course: true, platform: true }, orderBy: { createdAt: "desc" } },
      coupons: { orderBy: { createdAt: "desc" } },
      agreements: {
        include: {
          versions: {
            include: { courseScopes: { include: { course: true } }, campaignScopes: { include: { campaign: true } } },
            orderBy: { version: "desc" },
          },
        },
      },
      goals: { orderBy: { periodStart: "desc" } },
    },
  });

  return influencer;
}

export async function createInfluencer(
  input: {
    name: string;
    email: string;
    phone?: string;
    youtubeUrl?: string;
    instagramUrl?: string;
    primaryPlatformId?: string;
    category?: string;
    managerId?: string;
    joiningDate?: Date;
    status?: InfluencerStatus;
    notes?: string;
    paymentInfo?: Record<string, string>;
  },
  actor: { id: string; email: string }
) {
  const session = await requireSession();
  assertCan(session.user.role, "influencers", "write");

  const influencer = await prisma.influencer.create({ data: input });

  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      userEmail: actor.email,
      action: "INFLUENCER_CREATED",
      entityType: "Influencer",
      entityId: influencer.id,
      newValue: { name: input.name, email: input.email, status: input.status ?? "PROSPECT" },
    },
  });

  return influencer;
}

export async function updateInfluencer(
  influencerId: string,
  input: Partial<{
    name: string;
    phone: string;
    youtubeUrl: string;
    instagramUrl: string;
    primaryPlatformId: string;
    category: string;
    managerId: string;
    status: InfluencerStatus;
    notes: string;
    paymentInfo: Record<string, string>;
  }>,
  actor: { id: string; email: string }
) {
  const session = await requireSession();
  assertCan(session.user.role, "influencers", "write");

  const before = await prisma.influencer.findUnique({ where: { id: influencerId } });
  const influencer = await prisma.influencer.update({ where: { id: influencerId }, data: input });

  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      userEmail: actor.email,
      action: "INFLUENCER_UPDATED",
      entityType: "Influencer",
      entityId: influencer.id,
      previousValue: before ? JSON.parse(JSON.stringify(before)) : undefined,
      newValue: input,
    },
  });

  return influencer;
}

export async function listPlatforms() {
  await requireSession();
  return prisma.platform.findMany({ orderBy: { name: "asc" } });
}
