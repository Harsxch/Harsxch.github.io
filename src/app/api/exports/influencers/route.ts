import { apiHandler } from "@/lib/api/handler";
import { requireSession } from "@/lib/auth/session";
import { assertCan } from "@/lib/auth/rbac";
import { listInfluencers } from "@/lib/data/influencers";
import { csvResponse } from "@/lib/csv";
import { formatDate } from "@/lib/format";

export const GET = apiHandler(async () => {
  const session = await requireSession();
  assertCan(session.user.role, "exports", "read");

  const { rows } = await listInfluencers({ pageSize: 10000 });

  return csvResponse(
    "influencers.csv",
    rows.map((i) => ({
      Name: i.name,
      Email: i.email,
      Phone: i.phone ?? "",
      Category: i.category ?? "",
      Platform: i.primaryPlatform?.name ?? "",
      Manager: i.manager?.name ?? "",
      Joined: formatDate(i.joiningDate),
      Status: i.status,
    }))
  );
});
