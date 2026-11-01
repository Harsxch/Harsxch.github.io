"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRef, useSyncExternalStore } from "react";
import { liveCourses, soonCourses } from "@/content/courses";
import { track } from "@/lib/analytics";
import { SplitWords } from "@/components/ui/reveal";
import { ArchCard } from "@/components/arch-card";

/** True from the sm breakpoint up. Parallax is desktop-only: on phones the card row is a scroll container and would clip lifted cards. */
function useWide() {
  return useSyncExternalStore(
    (cb) => { const m = matchMedia("(min-width: 640px)"); m.addEventListener("change", cb); return () => m.removeEventListener("change", cb); },
    () => matchMedia("(min-width: 640px)").matches,
    () => true,
  );
}

export function Hero() {
  const wide = useWide();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const ys = [useTransform(scrollYProgress, [0, 1], [0, -70]), useTransform(scrollYProgress, [0, 1], [0, -150]), useTransform(scrollYProgress, [0, 1], [0, -40]), useTransform(scrollYProgress, [0, 1], [0, -110])];
  const rise = ["sm:mt-12", "sm:mt-0", "sm:mt-20", "sm:mt-8"];

  return (
    <section ref={ref} className="relative overflow-hidden pt-24 pb-16 sm:pt-28">
      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-6">
        <h1 className="font-display mx-auto max-w-[15ch] text-balance text-center text-[clamp(2.9rem,7.2vw,6.1rem)] leading-[0.93] text-ink">
          <SplitWords text="Learn skills that move you" />
          <span className="block"><SplitWords text="forward." delay={0.35} wordClassName="bg-gradient-to-b from-[#ffb08f] via-brand to-[#e8451a] bg-clip-text text-transparent" /></span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-center text-[17px] leading-relaxed text-ink-soft sm:text-lg">
          Hands-on courses in AI, Claude and Python, taught in Hinglish, built around real projects, finished with something you can actually show.
        </p>

        <div className="fade-up mt-7 flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.35s" }}>
          <Link href="/courses" onClick={() => track("cta_click", { where: "hero" })}
            className="group inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-[15px] font-semibold text-[#1a0a02] shadow-[0_14px_44px_-8px_rgba(255,105,61,.8)] transition hover:bg-[var(--brand-orange-press)]">
            Explore courses <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link href="#worlds" className="rounded-full px-5 py-3.5 text-[15px] font-medium text-ink/70 transition hover:text-ink">Step through a door ↓</Link>
        </div>
        <p className="fade-up mt-5 text-center text-[14px] text-ink-soft">
          Join <b className="font-semibold text-ink">7,200+</b> learners building skills for what&apos;s next.
        </p>

        <div id="worlds" className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pt-6 pb-8 sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0">
          {liveCourses.map((c, i) => (
            <motion.div key={c.slug} style={{ y: wide ? ys[i] : 0 }} initial={{ opacity: 0, y: 70 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.12, duration: 0.9 }}
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
