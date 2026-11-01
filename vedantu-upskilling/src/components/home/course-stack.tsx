import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { liveCourses } from "@/content/courses";
import { titleClass } from "@/lib/theme-type";
import { PanelArt } from "@/components/art/panel-art";
import { PriceBlock } from "@/components/price-block";
import { Reveal } from "@/components/ui/reveal";

/** Stacking full-bleed panels. Each course gets its own palette, type voice and artwork. */
export function CourseStack() {
  return (
    <section aria-label="Live courses" className="relative px-3 pb-24 sm:px-5">
      <div className="mx-auto max-w-[1360px]">
        {liveCourses.map((c, i) => (
          <article
            key={c.slug}
            data-theme={c.theme}
            style={{ top: `calc(4.5rem + ${i * 14}px)` }}
            className="noise relative mb-6 overflow-hidden rounded-[32px] bg-c-bg text-c-fg shadow-[0_-20px_60px_-30px_rgba(0,0,0,.6)] sm:sticky sm:mb-10 sm:min-h-[78vh] sm:rounded-[44px]"
          >
            <div className="grid min-h-[inherit] items-stretch lg:grid-cols-[1.05fr_1fr]">
              <div className="relative z-10 flex flex-col justify-between gap-12 p-7 sm:p-12 lg:p-16">
                <div>
                  <p className="text-[11px] tracking-[0.2em] text-c-accent uppercase">
                    0{i + 1} · {c.eyebrow}
                  </p>
                  <Reveal>
                    <h2 className={`${titleClass[c.theme]} mt-5 text-[clamp(2.39rem,4.99vw,4.37rem)] leading-[0.95] ${c.theme === "python" ? "text-[clamp(1.84rem,3.59vw,3.12rem)]" : ""}`}>
                      {c.title}
                    </h2>
                  </Reveal>
                  <p className="mt-5 max-w-md text-[17px] leading-relaxed text-c-muted">{c.tagline} {c.blurb}</p>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-6">
                  <PriceBlock course={c} size="lg" />
                  <Link
                    href={`/courses/${c.slug}`}
                    className="group inline-flex items-center gap-2 rounded-full bg-c-accent px-6 py-3.5 text-[15px] font-semibold text-c-on transition hover:brightness-110"
                  >
                    Explore {c.shortName} <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
              <div className="relative p-5 pt-0 lg:p-10 lg:pl-0">
                <div className="relative h-full min-h-[420px] overflow-hidden rounded-t-[999px] rounded-b-[32px] bg-c-surface/70 ring-1 ring-c-line shadow-[0_30px_80px_-30px_rgba(0,0,0,.6)] max-lg:mx-auto max-lg:max-w-md">
                  <PanelArt theme={c.theme} />
                  <i aria-hidden className="pointer-events-none absolute inset-2.5 rounded-t-[999px] rounded-b-[24px] border border-white/10" />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
