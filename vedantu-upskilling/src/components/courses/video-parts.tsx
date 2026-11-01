"use client";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Course } from "@/content/courses";

const tc = (f: number) => { const s = Math.floor(f / 24); return `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}:${String(f % 24).padStart(2, "0")}`; };

export function VideoHero({ course }: { course: Course }) {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden bg-black">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_70%_30%,rgba(255,59,48,.28),transparent_65%),radial-gradient(60%_60%_at_20%_80%,rgba(91,211,255,.14),transparent_70%)]" />
      <div className="pointer-events-none absolute -inset-[50%] -z-10 opacity-[0.09]" style={{ animation: "grain 0.9s steps(4) infinite", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />
      <div className="h-[7vh] bg-black" />
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8">
        <p className="flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-c-fg/70 uppercase"><i className="size-2.5 animate-pulse rounded-full bg-c-accent" /> REC · Launching soon</p>
        <h1 className="font-cine mt-5 text-[clamp(3.4rem,11vw,10rem)] leading-[0.98] tracking-[0.005em] uppercase">
          <motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="block overflow-hidden">Cut.</motion.span>
          <motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} className="block overflow-hidden text-transparent [-webkit-text-stroke:2px_var(--c-fg)]">Pace.</motion.span>
          <motion.span initial={{ y: "100%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.24, ease: [0.22, 1, 0.36, 1] }} className="block overflow-hidden text-c-accent">Tell it.</motion.span>
        </h1>
        <p className="mt-8 max-w-md text-[16px] leading-relaxed text-c-fg/70">{course.blurb}</p>
        <a href="#notify" className="mt-8 inline-flex h-14 items-center rounded-none border border-c-fg/40 px-8 font-mono text-sm tracking-[0.2em] uppercase transition hover:bg-c-fg hover:text-black">Notify me at launch</a>
      </div>
      <motion.div aria-hidden initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 1 }}
        className="absolute top-[18%] right-[4%] hidden aspect-video w-[38%] overflow-hidden border border-c-fg/15 bg-gradient-to-br from-[#16202b] via-[#241824] to-[#3a1512] lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_70%_30%,rgba(255,59,48,.4),transparent_62%)]" />
        <i className="absolute inset-y-0 left-1/3 w-px bg-white/10" /><i className="absolute inset-y-0 left-2/3 w-px bg-white/10" />
        <i className="absolute inset-x-0 top-1/3 h-px bg-white/10" /><i className="absolute inset-x-0 top-2/3 h-px bg-white/10" />
        <span className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.3em] text-white/70 uppercase">● REC</span>
        <span className="absolute right-4 bottom-3 font-mono text-xs text-white/70">00:00:12:08</span>
        <i className="absolute top-1/2 left-1/2 size-6 -translate-x-1/2 -translate-y-1/2 border border-white/60" />
      </motion.div>
      <div className="relative mx-auto mt-10 mb-[7vh] w-full max-w-[1400px] px-4 sm:px-8" aria-hidden>
        <div className="space-y-1.5">
          {[[[0, 26, "#5bd3ff"], [28, 20, "#5bd3ffaa"], [50, 34, "#5bd3ff"], [86, 12, "#5bd3ff88"]], [[4, 38, "#ff3b30"], [44, 28, "#ff3b30aa"], [74, 22, "#ff3b30"]], [[0, 100, "#ffffff18"]]].map((row, r) => (
            <div key={r} className="relative h-7 rounded-sm bg-white/[0.04]">{row.map(([l, w, bg], i) => (<i key={i} className="absolute top-0 h-7 rounded-sm" style={{ left: `${l}%`, width: `${w}%`, background: String(bg) }} />))}</div>
          ))}
        </div>
        <motion.i initial={{ left: "0%" }} animate={{ left: "100%" }} transition={{ duration: 9, repeat: Infinity, ease: "linear" }} className="absolute -top-3 -bottom-3 w-px bg-c-accent" style={{ boxShadow: "0 0 14px var(--c-accent)" }} />
      </div>
    </section>
  );
}

/** Scrubbable timeline: the six themes as clips. Drag the playhead to jump between them. */
export function Scrubber({ items }: { items: string[] }) {
  const [f, setF] = useState(0);
  const total = 24 * 60; // 60s demo timeline
  const clips = useMemo(() => items.map((t, i) => ({ t, s: (i * total) / items.length, e: ((i + 1) * total) / items.length })), [items, total]);
  const now = clips.find((c) => f >= c.s && f < c.e) ?? clips[clips.length - 1];
  const pct = (f / total) * 100;
  return (
    <div className="border border-c-line bg-c-surface">
      <div className="relative aspect-video overflow-hidden bg-black sm:aspect-[21/9]">
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_70%_30%,rgba(255,59,48,.3),transparent_65%)]" />
        <motion.p key={now.t} initial={{ opacity: 0, y: 14, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.4 }}
          className="font-cine absolute inset-0 grid place-items-center px-6 text-center text-[clamp(2.6rem,9vw,8rem)] leading-none tracking-[0.01em] uppercase" aria-live="polite">{now.t}</motion.p>
        <span className="absolute right-4 bottom-3 font-mono text-xs text-c-fg/70 tabular">{tc(f)}</span>
        <span className="absolute top-3 left-4 font-mono text-[10px] tracking-[0.3em] text-c-fg/50 uppercase">Illustrative preview</span>
      </div>
      <div className="relative px-4 pt-6 pb-5 sm:px-6">
        <div className="relative space-y-1.5">
          {[0, 1].map((tr) => (
            <div key={tr} className="relative h-9 bg-white/[0.04]">
              {clips.filter((_, i) => i % 2 === tr).map((c) => (
                <span key={c.t} className={`absolute top-0 flex h-9 items-center overflow-hidden px-2.5 font-mono text-[11px] whitespace-nowrap transition-colors ${c.t === now.t ? "bg-c-accent text-white" : "bg-c-fg/10 text-c-fg/70"}`} style={{ left: `${(c.s / total) * 100}%`, width: `${((c.e - c.s) / total) * 100}%` }}>{c.t}</span>
              ))}
            </div>
          ))}
          <i className="pointer-events-none absolute -top-2 -bottom-2 w-px bg-c-accent" style={{ left: `${pct}%`, boxShadow: "0 0 12px var(--c-accent)" }} />
        </div>
        <label className="sr-only" htmlFor="scrub">Scrub the timeline</label>
        <input id="scrub" type="range" min={0} max={total - 1} value={f} onChange={(e) => setF(Number(e.target.value))} className="mt-5 w-full accent-[#ff3b30]" />
      </div>
    </div>
  );
}
