import { headers } from "next/headers";
import { requireSession } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/app-shell";
import { ADMIN_NAV } from "./nav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const pathname = (await headers()).get("x-pathname") ?? "/admin";

  return (
    <AppShell navItems={ADMIN_NAV} userName={session.user.name} userRole={session.user.role} activePath={pathname}>
      {children}
    </AppShell>
  );
}
