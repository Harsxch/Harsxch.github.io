import type { NextRequest } from "next/server";
import { apiHandler } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { listLedgerEntries } from "@/lib/data/ledger";
import { csvResponse } from "@/lib/csv";
import { formatDateTime } from "@/lib/format";

export const GET = apiHandler(async (req: NextRequest) => {
  const session = await requireSession();
  assertCan(session.user.role, "exports", "read");

  const status = req.nextUrl.searchParams.get("status");
  const { rows } = await listLedgerEntries({ status: (status as never) ?? undefined, pageSize: 10000 });

  return csvResponse(
    "earnings.csv",
    rows.map((t) => ({
      Date: formatDateTime(t.createdAt),
      Influencer: t.influencer.name,
      Course: t.order.course.name,
      Type: t.type,
      Model: t.modelTypeSnapshot,
      "Eligible Revenue": t.eligibleRevenue.toString(),
      "Influencer Amount": t.influencerAmount.toString(),
      Status: t.status,
    }))
  );
});
