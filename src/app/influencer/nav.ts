import {
  LayoutDashboard,
  ShoppingCart,
  BookOpen,
  Link2,
  Ticket,
  Megaphone,
  Wallet,
  Banknote,
  Target,
  Bell,
  User,
  BarChart3,
} from "lucide-react";
import type { NavItem } from "@/components/layout/app-shell";

export const INFLUENCER_NAV: NavItem[] = [
  { href: "/influencer", label: "Dashboard", icon: LayoutDashboard },
  { href: "/influencer/sales", label: "My Sales", icon: ShoppingCart },
  { href: "/influencer/sales-tracking", label: "Sales Tracking", icon: BarChart3 },
  { href: "/influencer/courses", label: "My Courses", icon: BookOpen },
  { href: "/influencer/links", label: "My Links", icon: Link2 },
  { href: "/influencer/coupons", label: "My Coupons", icon: Ticket },
  { href: "/influencer/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/influencer/earnings", label: "Earnings", icon: Wallet },
  { href: "/influencer/payouts", label: "Payouts", icon: Banknote },
  { href: "/influencer/goals", label: "Goals", icon: Target },
  { href: "/influencer/notifications", label: "Notifications", icon: Bell },
  { href: "/influencer/profile", label: "Profile", icon: User },
];
