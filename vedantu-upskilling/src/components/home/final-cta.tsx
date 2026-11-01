import Link from "next/link";
import { courses } from "@/content/courses";
import { dotColor } from "@/lib/theme-type";

export function FinalCta() {
  return (
    <section className="px-3 pb-3 sm:px-5">
      <div className="noise relative mx-auto max-w-[1360px] overflow-hidden rounded-[36px] bg-[radial-gradient(120%_95%_at_50%_135%,#ff693d_0%,#d4421a_30%,#4a1a14_55%,#01202b_80%)] px-6 py-28 text-center text-white ring-1 ring-white/15 sm:rounded-[48px] sm:py-40">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_50%_100%,rgba(255,220,170,.55),transparent_70%)]" />
        <h2 className="font-display relative mx-auto max-w-[14ch] text-[clamp(2.76rem,7.02vw,6.24rem)] leading-[0.9]">
          Pick a world. <span className="text-brand ">Start building.</span>
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
