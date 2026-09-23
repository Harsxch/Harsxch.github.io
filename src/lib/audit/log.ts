import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type AuditActor = { id: string; email: string } | null;

/**
 * Append-only audit trail. Never call prisma.auditLog.update/delete anywhere
 * else in the app - this is the single write path.
 */
export async function recordAudit(params: {
  actor: AuditActor;
  action: string;
  entityType: string;
  entityId: string;
  previousValue?: Prisma.InputJsonValue | null;
  newValue?: Prisma.InputJsonValue | null;
  tx?: Prisma.TransactionClient;
}) {
  const client = params.tx ?? prisma;
  await client.auditLog.create({
    data: {
      userId: params.actor?.id ?? null,
      userEmail: params.actor?.email ?? "system",
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      previousValue: params.previousValue ?? undefined,
      newValue: params.newValue ?? undefined,
    },
  });
}
