const COLORS: Record<string, string> = {
  slate: "bg-slate-100 text-slate-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  purple: "bg-purple-100 text-purple-700",
};

const STATUS_COLOR: Record<string, keyof typeof COLORS> = {
  ACTIVE: "green",
  SUCCESSFUL: "green",
  APPROVED: "blue",
  PAID: "green",
  PENDING: "amber",
  PROCESSING: "amber",
  DRAFT: "slate",
  PROSPECT: "slate",
  ONBOARDING: "blue",
  PAUSED: "amber",
  INACTIVE: "slate",
  SUPERSEDED: "slate",
  EXPIRED: "slate",
  CANCELLED: "red",
  DISABLED: "red",
  FAILED: "red",
  REFUNDED: "red",
  PARTIALLY_REFUNDED: "amber",
  REVERSED: "red",
  COMPLETED: "green",
};

export function Badge({ children, color }: { children: React.ReactNode; color?: keyof typeof COLORS }) {
  const resolved = color ?? (typeof children === "string" ? STATUS_COLOR[children] : undefined) ?? "slate";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${COLORS[resolved]}`}>
      {typeof children === "string" ? children.replaceAll("_", " ") : children}
    </span>
  );
}
