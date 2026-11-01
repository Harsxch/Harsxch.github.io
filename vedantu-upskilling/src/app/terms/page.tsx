import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Terms & conditions" };

export default function Page() {
  return (
    <InfoPage eyebrow="Legal" title="Terms & conditions">
      <p>Terms and conditions will be published here before launch.</p>
    </InfoPage>
  );
}
