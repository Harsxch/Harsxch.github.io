"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { liveCourses, startPrice, inr, soonCourses } from "@/content/courses";
import { track } from "@/lib/analytics";
import { titleClass } from "@/lib/theme-type";
import { SplitWords } from "@/components/ui/reveal";
import { TileArt } from "@/components/art/tile-art";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -130]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const ys = [y1, y2, y3, y4];
  const lift = ["sm:mt-10", "sm:mt-0", "sm:mt-16", "sm:mt-6"];

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 pb-16 sm:pt-36">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(255,105,61,.13),transparent_70%)]" />
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-fit rounded-full border border-black/10 bg-white/60 px-4 py-1.5 text-[12px] font-medium tracking-wide text-ink/70 backdrop-blur"
        >
          Vedantu Upskilling · {liveCourses.length} live courses, {soonCourses.length} on the way
        </motion.p>

        <h1 className="font-display mx-auto mt-7 max-w-[15ch] text-center text-[clamp(3.4rem,10.5vw,9.5rem)] leading-[0.9] text-ink">
          <SplitWords text="Learn skills that move you" />
          <span className="text-brand italic"><SplitWords text="forward." delay={0.35} /></span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mx-auto mt-8 max-w-xl text-center text-[17px] leading-relaxed text-ink-soft sm:text-lg"
        >
          Hands-on courses in AI, Claude and Python, taught in Hinglish, built around real projects, finished with
          something you can actually show.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.8 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/courses"
            onClick={() => track("cta_click", { where: "hero" })}
            className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(255,105,61,.7)] transition hover:bg-[var(--brand-orange-press)]"
          >
            Explore courses <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link href="#worlds" className="rounded-full px-5 py-3.5 text-[15px] font-medium text-ink/70 transition hover:text-ink">
            See the four worlds ↓
          </Link>
        </motion.div>

        <div id="worlds" className="no-scrollbar -mx-4 mt-16 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0">
          {liveCourses.map((c, i) => (
            <motion.div
              key={c.slug}
              data-theme={c.theme}
              style={{ y: ys[i] }}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.12, duration: 0.9 }}
              className={`min-w-[72%] snap-center sm:min-w-0 ${lift[i]}`}
            >
              <Link
                href={`/courses/${c.slug}`}
                onClick={() => track("course_card_click", { course: c.slug, where: "hero" })}
                className="group relative block aspect-[3/4] overflow-hidden rounded-[28px] bg-c-bg text-c-fg shadow-[0_30px_60px_-30px_rgba(1,32,43,.55)] ring-1 ring-black/10 transition duration-500 hover:-translate-y-2"
              >
                <TileArt theme={c.theme} lift className="transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <h2 className={`${titleClass[c.theme]} text-[28px] leading-[1.02] sm:text-[30px] ${c.theme === "python" ? "text-[22px] sm:text-[22px]" : ""}`}>
                    {c.title}
                  </h2>
                  <p className="mt-2 flex items-center justify-between text-[13px] text-c-fg/70">
                    <span>from {inr(startPrice(c) ?? 0)}</span>
                    <span className="grid size-8 place-items-center rounded-full bg-c-accent text-c-on transition group-hover:translate-x-1"><ArrowRight className="size-4" /></span>
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
