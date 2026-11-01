import type { Metadata } from "next";
import { CoursesGrid } from "@/components/courses-grid";
import { SITE_URL } from "@/lib/site";
import { ENROLLED } from "@/content/site";

export const metadata: Metadata = {
  title: "All courses",
  description: "Explore every Vedantu Upskilling course: AI Income Mastery, Claude Mastery, Python + DSA Mastery, AI Study Mastery, and what's launching next.",
  alternates: { canonical: `${SITE_URL}/courses` },
};

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 pt-28 pb-24 sm:px-6 sm:pt-36">
      <p className="text-[11px] tracking-[0.2em] text-brand uppercase">All courses</p>
      <h1 className="font-display mt-4 max-w-[14ch] text-[clamp(2.76rem,6.24vw,5.46rem)] leading-[0.92]">
        Six worlds. <span className="text-brand ">One</span> way forward.
      </h1>
      <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-soft">
        Every course has its own look, its own tools and its own finish line. Pick the one that matches what you want to build.
      </p>
      <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-hairline bg-white/60 px-4 py-2 text-[14px] text-ink-soft">
        <i className="size-2 rounded-full bg-brand" />Trusted by <b className="font-semibold text-ink">{ENROLLED.value}</b> {ENROLLED.short}.
      </p>
      <div className="mt-10"><CoursesGrid /></div>
    </div>
  );
}
