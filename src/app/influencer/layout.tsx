import { headers } from "next/headers";
import { requireSession } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { INFLUENCER_NAV } from "./nav";

export default async function InfluencerLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const pathname = (await headers()).get("x-pathname") ?? "/influencer";

  return (
    <AppShell navItems={INFLUENCER_NAV} userName={session.user.name} userRole={session.user.role} activePath={pathname}>
      {children}
    </AppShell>
  );
}
