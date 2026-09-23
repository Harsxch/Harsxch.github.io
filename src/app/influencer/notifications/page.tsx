import { listMyNotifications } from "@/lib/data/notifications";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";
import { MarkAllReadButton } from "./mark-all-read-button";

export default async function NotificationsPage() {
  const notifications = await listMyNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500 mt-0.5">{notifications.length} total</p>
        </div>
        {notifications.some((n) => !n.isRead) && <MarkAllReadButton />}
      </div>

      <Card>
        {notifications.length === 0 ? (
          <EmptyState title="No notifications yet" />
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((n) => (
              <div key={n.id} className={`px-5 py-3 ${!n.isRead ? "bg-slate-50" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-900">{n.title}</span>
                  <span className="text-xs text-slate-400">{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
