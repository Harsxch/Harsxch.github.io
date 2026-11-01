import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { soonCourses } from "@/content/courses";
import { TileArt } from "@/components/art/tile-art";
import { titleClass } from "@/lib/theme-type";

export function Upcoming() {
  return (
    <section id="upcoming" className="scroll-mt-20 px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-[1240px]">
        <p className="font-mono text-[11px] tracking-[0.2em] text-brand uppercase">Upcoming</p>
        <h2 className="font-display mt-4 text-[clamp(2.4rem,5.4vw,4.4rem)] leading-none">Two more worlds are loading.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {soonCourses.map((c) => (
            <Link key={c.slug} href={`/courses/${c.slug}`} data-theme={c.theme}
              className="group relative isolate block min-h-[480px] overflow-hidden rounded-[36px] bg-c-bg text-c-fg">
              <TileArt theme={c.theme} lift="tall" className="transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
                <span className="rounded-full border border-c-fg/30 px-3 py-1 text-[11px] tracking-[0.18em] uppercase backdrop-blur">Launching soon</span>
                <h3 className={`${titleClass[c.theme]} mt-4 text-[clamp(2.4rem,5vw,4rem)] leading-none`}>{c.title}</h3>
                <p className="mt-3 flex items-end justify-between gap-4 text-c-fg/75">
                  <span className="max-w-sm">{c.blurb}</span>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-c-fg text-c-bg transition group-hover:rotate-45"><ArrowUpRight className="size-5" /></span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
