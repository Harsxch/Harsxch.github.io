"use client";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useEffect, useState } from "react";
import type { Course } from "@/content/courses";

const WORDS = ["Communicate.", "Be confident.", "Show presence."];

export function PersonalityHero({ course }: { course: Course }) {
  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const bg = useMotionTemplate`radial-gradient(520px circle at ${mx}% ${my}%, rgba(232,201,160,.22), transparent 60%)`;
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % WORDS.length), 2600); return () => clearInterval(id); }, []);
  return (
    <section
      onPointerMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); mx.set(((e.clientX - r.left) / r.width) * 100); my.set(((e.clientY - r.top) / r.height) * 100); }}
      className="noise relative isolate flex min-h-[100svh] items-center overflow-hidden bg-c-bg"
    >
      <motion.div style={{ background: bg }} className="absolute inset-0 -z-10" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-[#6d366c]/30 to-transparent" />
      <div className="mx-auto w-full max-w-[1240px] px-4 pt-28 pb-24 sm:px-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-c-line px-4 py-1.5 text-[12px] tracking-[0.2em] text-c-accent uppercase"><i className="size-1.5 animate-pulse rounded-full bg-c-accent" />Launching soon</p>
        <h1 className="font-display mt-8 text-[clamp(1.29rem,1.87vw,1.56rem)] text-c-muted">Personality Development</h1>
        <div className="font-display relative mt-2 h-[clamp(4.6rem,12.48vw,10.92rem)] text-[clamp(3.68rem,10.92vw,9.75rem)] leading-[0.95] whitespace-nowrap text-c-fg " aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.span key={i} initial={{ opacity: 0, y: 40, filter: "blur(14px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -30, filter: "blur(10px)" }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="absolute inset-0 bg-gradient-to-r from-c-fg via-c-accent to-c-accent2 bg-clip-text text-transparent">{WORDS[i]}</motion.span>
          </AnimatePresence>
        </div>
        <p className="mt-10 max-w-md text-[17px] leading-relaxed text-c-muted">{course.tagline} {course.blurb}</p>
        <a href="#notify" className="mt-9 inline-flex h-14 items-center gap-2 rounded-full bg-c-accent px-8 text-base font-semibold text-c-on transition hover:brightness-110">Notify me at launch <ArrowDown className="size-4" /></a>
        <div className="mt-16 flex h-14 items-center gap-[5px]" aria-hidden>
          {Array.from({ length: 56 }).map((_, k) => (
            <i key={k} className="w-[3px] rounded-full bg-c-accent/70" style={{ height: "100%", transformOrigin: "center", animation: `wave ${1.2 + (k % 7) * 0.18}s ease-in-out ${k * 0.04}s infinite alternate` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes wave{from{transform:scaleY(.12)}to{transform:scaleY(1)}}`}</style>
    </section>
  );
}

export function Threads({ items }: { items: string[] }) {
  return (
    <ol className="divide-y divide-c-line border-y border-c-line">
      {items.map((t, i) => (
        <motion.li key={t} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10%" }} transition={{ duration: 0.8, delay: i * 0.05 }} className="group relative">
          <div className="flex items-baseline gap-6 py-7 transition-all duration-500 group-hover:pl-6 sm:gap-10 sm:py-10">
            <span className="text-sm text-c-muted tabular">0{i + 1}</span>
            <span className="font-display text-[clamp(2.02rem,5.46vw,4.68rem)] leading-none  transition-colors duration-500 group-hover:text-c-accent">{t}</span>
          </div>
          <i className="absolute bottom-0 left-0 h-px w-0 bg-c-accent transition-all duration-700 group-hover:w-full" />
        </motion.li>
      ))}
    </ol>
  );
}
