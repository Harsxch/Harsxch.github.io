import type { Metadata } from "next";
import { InfoPage } from "@/components/info-page";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return (
    <InfoPage eyebrow="Company" title="About">
      <p>Vedantu Upskilling is a set of hands-on courses from Vedantu for students and early-career learners, taught in Hinglish and built around real projects.</p>
    </InfoPage>
  );
}
