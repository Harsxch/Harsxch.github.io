import { LayoutDashboard, Users, ShoppingCart } from "lucide-react";
import type { NavItem } from "@/components/layout/app-shell";

// Simplified product direction: Admin manages Influencers and gets Sales
// Tracking visibility across all of them - that's the whole nav. Other
// previously-built admin pages (Courses, Campaigns, Tracking Links,
// Coupons, Commercial Agreements, Earnings, Payouts, Audit Logs) still
// exist and work - Sales Tracking's filters read from them - they're just
// no longer linked from the nav. See the handover notes for what's hidden
// vs. removed.
export const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/influencers", label: "Influencers", icon: Users },
  { href: "/admin/sales", label: "Sales Tracking", icon: ShoppingCart },
];
