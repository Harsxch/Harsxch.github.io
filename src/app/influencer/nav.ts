import { BarChart3 } from "lucide-react";
import type { NavItem } from "@/components/layout/app-shell";

// Simplified product direction: the influencer experience is Sales
// Tracking only. Other previously-built influencer pages (My Sales, My
// Courses, My Links, My Coupons, Campaigns, Earnings, Payouts, Goals,
// Notifications, Profile) still exist and work, they're just no longer
// linked from the nav - see the handover notes for what's hidden vs. removed.
export const INFLUENCER_NAV: NavItem[] = [
  { href: "/influencer/sales-tracking", label: "Sales Tracking", icon: BarChart3 },
];
