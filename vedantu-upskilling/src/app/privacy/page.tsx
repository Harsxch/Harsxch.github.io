import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function Page() {
  return (
    <InfoPage eyebrow="Legal" title="Privacy policy">
      <p>Privacy policy will be published here before launch. This site stores only a creator reference and campaign parameters in your browser to attribute enrolments, and optional analytics if enabled.</p>
    </InfoPage>
  );
}
