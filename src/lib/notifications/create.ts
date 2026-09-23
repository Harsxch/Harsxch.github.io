import type { Prisma } from "@/generated/prisma/client";
import type { NotificationType } from "@/generated/prisma/enums";

/** Fire-and-forget in-app notification. Swallows errors so a notification
 * failure never rolls back the financial transaction it's attached to. */
export async function notify(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    entityType?: string;
    entityId?: string;
  }
) {
  await tx.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      entityType: params.entityType,
      entityId: params.entityId,
    },
  });
}
