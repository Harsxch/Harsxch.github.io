import {
  LayoutDashboard,
  Users,
  BookOpen,
  Megaphone,
  Link2,
  Ticket,
  ShoppingCart,
  FileText,
  Wallet,
  Banknote,
  ClipboardList,
} from "lucide-react";
import type { NavItem } from "@/components/layout/app-shell";

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/influencers", label: "Influencers", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/tracking-links", label: "Tracking Links", icon: Link2 },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/sales", label: "Sales", icon: ShoppingCart },
  { href: "/admin/agreements", label: "Commercial Agreements", icon: FileText },
  { href: "/admin/earnings", label: "Earnings", icon: Wallet },
  { href: "/admin/payouts", label: "Payouts", icon: Banknote },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
];
