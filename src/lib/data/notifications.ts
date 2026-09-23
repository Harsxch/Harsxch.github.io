import "server-only";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";

export async function listMyNotifications() {
  const session = await requireSession();
  return prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function unreadNotificationCount() {
  const session = await requireSession();
  return prisma.notification.count({ where: { userId: session.user.id, isRead: false } });
}

export async function markNotificationRead(notificationId: string) {
  const session = await requireSession();
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead() {
  const session = await requireSession();
  await prisma.notification.updateMany({ where: { userId: session.user.id, isRead: false }, data: { isRead: true } });
}
