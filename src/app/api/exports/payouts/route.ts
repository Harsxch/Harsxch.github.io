import { apiHandler } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { listPayouts } from "@/lib/data/payouts";
import { csvResponse } from "@/lib/csv";
import { formatDate } from "@/lib/format";

export const GET = apiHandler(async () => {
  const session = await requireSession();
  assertCan(session.user.role, "exports", "read");

  const rows = await listPayouts();

  return csvResponse(
    "payouts.csv",
    rows.map((p) => ({
      Influencer: p.influencer.name,
      Amount: p.amount.toString(),
      Reference: p.reference ?? "",
      Initiated: formatDate(p.initiatedAt),
      "Paid At": p.paidAt ? formatDate(p.paidAt) : "",
      Status: p.status,
    }))
  );
});
