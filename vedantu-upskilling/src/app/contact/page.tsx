import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Contact & support" };

export default function Page() {
  return (
    <InfoPage eyebrow="Help" title="Contact & support">
      <p>Support details are being finalised. For now, the best way to reach Vedantu is through the official Vedantu channels.</p>
    </InfoPage>
  );
}
