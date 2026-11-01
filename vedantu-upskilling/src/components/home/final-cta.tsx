import Link from "next/link";
import { courses } from "@/content/courses";
import { dotColor } from "@/lib/theme-type";

export function FinalCta() {
  return (
    <section className="px-3 pb-3 sm:px-5">
      <div className="noise relative mx-auto max-w-[1360px] overflow-hidden rounded-[36px] bg-navy px-6 py-24 text-center text-white sm:rounded-[48px] sm:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_120%,rgba(255,105,61,.5),transparent_65%)]" />
        <h2 className="font-display relative mx-auto max-w-[14ch] text-[clamp(3rem,9vw,8rem)] leading-[0.9]">
          Pick a world. <span className="text-brand italic">Start building.</span>
        </h2>
        <div className="relative mt-12 flex flex-wrap justify-center gap-2.5">
          {courses.map((c) => (
            <Link key={c.slug} href={`/courses/${c.slug}`}
              className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[14px] backdrop-blur transition hover:bg-white/15">
              <i className="size-2 rounded-full" style={{ background: dotColor[c.theme] }} />
              {c.shortName}
              {c.status === "coming-soon" && <span className="text-[10px] tracking-widest text-white/50 uppercase">Soon</span>}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
