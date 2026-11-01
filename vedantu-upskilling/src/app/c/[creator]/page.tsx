import type { Metadata } from "next";
import { Home } from "@/components/home/home";
import { SetRef } from "@/components/set-ref";

export const metadata: Metadata = { robots: { index: false } };

/** Creator landing: same experience as home, but carries creator attribution (ref=<slug>). */
export default async function CreatorPage({ params }: { params: Promise<{ creator: string }> }) {
  const { creator } = await params;
  return (
    <>
      <SetRef value={creator} />
      <Home />
    </>
  );
}
