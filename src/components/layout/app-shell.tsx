import Link from "next/link";
import { SignOutButton } from "./sign-out-button";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export function AppShell({
  navItems,
  userName,
  userRole,
  activePath,
  children,
}: {
  navItems: NavItem[];
  userName: string;
  userRole: string;
  activePath: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-slate-200">
          <span className="font-semibold text-slate-900 text-sm">Influencer Partner Platform</span>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activePath === item.href || activePath.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="text-sm font-medium text-slate-900">{userName}</div>
          <div className="text-xs text-slate-500 mb-3">{formatRole(userRole)}</div>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="max-w-[1400px] mx-auto px-6 py-6">{children}</div>
      </main>
    </div>
  );
}

function formatRole(role: string) {
  return role
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
