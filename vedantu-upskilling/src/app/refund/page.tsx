import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Refund policy" };

export default function Page() {
  return (
    <InfoPage eyebrow="Policy" title="Refund policy">
      <p>Refund terms can differ by course. For Claude Mastery for Internships, the course FAQ states: no refunds once you&apos;ve enrolled. Policies for other courses are being confirmed.</p>
    </InfoPage>
  );
}
