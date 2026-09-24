import { redirect } from "next/navigation";

// The old standalone influencer dashboard was folded into the Sales
// Tracking page's own summary cards as part of the simplified two-role
// (Admin/Influencer) product direction - Sales Tracking is now the
// influencer's only nav item. Kept as a redirect rather than deleted so no
// old link/bookmark 404s.
export default function InfluencerRootPage() {
  redirect("/influencer/sales-tracking");
}
