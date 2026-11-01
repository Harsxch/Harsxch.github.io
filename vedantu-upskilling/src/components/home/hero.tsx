"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { liveCourses, soonCourses } from "@/content/courses";
import { track } from "@/lib/analytics";
import { SplitWords } from "@/components/ui/reveal";
import { ArchCard } from "@/components/arch-card";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const ys = [useTransform(scrollYProgress, [0, 1], [0, -70]), useTransform(scrollYProgress, [0, 1], [0, -150]), useTransform(scrollYProgress, [0, 1], [0, -40]), useTransform(scrollYProgress, [0, 1], [0, -110])];
  const rise = ["sm:mt-12", "sm:mt-0", "sm:mt-20", "sm:mt-8"];

  return (
    <section ref={ref} className="relative overflow-hidden pt-24 pb-16 sm:pt-28">
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6">
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mx-auto w-fit rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[12px] font-medium tracking-wide text-ink/75 backdrop-blur">
          Vedantu Upskilling · {liveCourses.length} live courses, {soonCourses.length} on the way
        </motion.p>

        <h1 className="font-display mx-auto mt-5 max-w-[15ch] text-center text-[clamp(2.9rem,7.2vw,6.1rem)] leading-[0.93] text-ink">
          <SplitWords text="Learn skills that move you" />
          <span className="bg-gradient-to-b from-[#ffb08f] via-brand to-[#e8451a] bg-clip-text text-transparent [filter:drop-shadow(0_0_38px_rgba(255,105,61,.55))]"><SplitWords text="forward." delay={0.35} /></span>
        </h1>

        <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
          className="mx-auto mt-6 max-w-2xl text-center text-[17px] leading-relaxed text-ink-soft sm:text-lg">
          Hands-on courses in AI, Claude and Python, taught in Hinglish, built around real projects, finished with something you can actually show.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.95, duration: 0.8 }} className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/courses" onClick={() => track("cta_click", { where: "hero" })}
            className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_14px_44px_-8px_rgba(255,105,61,.8)] transition hover:bg-[var(--brand-orange-press)]">
            Explore courses <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link href="#worlds" className="rounded-full px-5 py-3.5 text-[15px] font-medium text-ink/70 transition hover:text-ink">Step through a door ↓</Link>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.15 }} className="mt-5 text-center text-[14px] text-ink-soft">
          Join <b className="font-semibold text-ink">7,200+</b> learners building skills for what&apos;s next.
        </motion.p>

        <div id="worlds" className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pt-6 pb-8 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
          {liveCourses.map((c, i) => (
            <motion.div key={c.slug} style={{ y: ys[i] }} initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.12, duration: 0.9 }}
              className={`min-w-[72%] snap-center sm:min-w-0 ${rise[i]}`}>
              <ArchCard course={c} where="hero" />
            </motion.div>
          ))}
        </div>
        <p className="mt-10 text-center text-[14px] text-ink-soft">
          Two more doors open soon:{" "}
          {soonCourses.map((c, i) => (<span key={c.slug}>{i > 0 && " and "}<Link href={`/courses/${c.slug}`} className="text-ink underline decoration-white/30 underline-offset-4 transition hover:decoration-brand">{c.title}</Link></span>))}.
        </p>
      </div>
    </section>
  );
}
