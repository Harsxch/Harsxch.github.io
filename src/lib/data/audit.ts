import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";

export async function listAuditLogs(params: { entityType?: string; page?: number; pageSize?: number } = {}) {
  const session = await requireSession();
  assertCan(session.user.role, "auditLogs", "read");

  const page = params.page ?? 1;
  const pageSize = Math.min(params.pageSize ?? 50, 200);
  const where = params.entityType ? { entityType: params.entityType } : {};

  const [rows, total] = await Promise.all([
    prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.auditLog.count({ where }),
  ]);

  return { rows, total, page, pageSize };
}
