import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";

export async function listAllAgreementVersions() {
  const session = await requireSession();
  assertCan(session.user.role, "agreements", "read");

  return prisma.commercialAgreementVersion.findMany({
    where: { status: "ACTIVE" },
    include: {
      agreement: { include: { influencer: { select: { id: true, name: true } } } },
      courseScopes: { include: { course: { select: { name: true } } } },
      campaignScopes: { include: { campaign: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}
