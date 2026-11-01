import type { Metadata } from "next";
import { CoursesGrid } from "@/components/courses-grid";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "All courses",
  description: "Explore every Vedantu Upskilling course: AI Income Mastery, Claude Mastery, Python + DSA Mastery, AI Study Mastery, and what's launching next.",
  alternates: { canonical: `${SITE_URL}/courses` },
};

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 pt-28 pb-24 sm:px-6 sm:pt-36">
      <p className="font-mono text-[11px] tracking-[0.2em] text-brand uppercase">All courses</p>
      <h1 className="font-display mt-4 max-w-[14ch] text-[clamp(3rem,8vw,7rem)] leading-[0.92]">
        Six worlds. <span className="text-brand italic">One</span> way forward.
      </h1>
      <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">
        Every course has its own look, its own tools and its own finish line. Pick the one that matches what you want to build.
      </p>
      <div className="mt-14"><CoursesGrid /></div>
    </div>
  );
}
