export type RangeKey = "today" | "yesterday" | "7d" | "30d" | "this_month" | "last_month";

export const RANGE_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
];

export function resolveRange(key: string | undefined): { from: Date; to: Date; key: RangeKey } {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (key) {
    case "today":
      return { from: startOfToday, to: endOfToday, key: "today" };
    case "yesterday": {
      const from = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      const to = new Date(startOfToday.getTime() - 1);
      return { from, to, key: "yesterday" };
    }
    case "7d": {
      const from = new Date(startOfToday.getTime() - 6 * 24 * 60 * 60 * 1000);
      return { from, to: endOfToday, key: "7d" };
    }
    case "this_month": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from, to: endOfToday, key: "this_month" };
    }
    case "last_month": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { from, to, key: "last_month" };
    }
    case "30d":
    default: {
      const from = new Date(startOfToday.getTime() - 29 * 24 * 60 * 60 * 1000);
      return { from, to: endOfToday, key: "30d" };
    }
  }
}
