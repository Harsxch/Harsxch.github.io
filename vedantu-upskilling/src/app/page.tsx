import type { Metadata } from "next";
import { Home } from "@/components/home/home";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = { alternates: { canonical: SITE_URL } };

export default function Page() {
  return <Home />;
}
