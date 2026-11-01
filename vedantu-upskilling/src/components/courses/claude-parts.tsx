"use client";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Check, ChevronRight, GitCommitHorizontal, Lock } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { type Course, inr } from "@/content/courses";
import { EnrolButton } from "@/components/ui/enrol";

/* ──────────────────────────── HERO: an AI developer workspace ──────────────────────────── */
const SCRIPT: { t: string; c?: string }[] = [
  { t: "❯ claude", c: "text-c-fg" },
  { t: "✻ Welcome to Claude Code", c: "text-c-accent" },
  { t: "> build my portfolio website with 3 projects" },
  { t: "  ⎿ Reading resume.md", c: "text-c-muted" },
  { t: "  ⎿ Writing app/page.tsx", c: "text-c-muted" },
  { t: "  ⎿ Added: Projects · About · Contact", c: "text-c-muted" },
  { t: "✓ Portfolio ready", c: "text-emerald-400" },
  { t: "> write a cold email to a startup founder" },
  { t: "  ⎿ Drafting 3 sentences…", c: "text-c-muted" },
  { t: "✓ Saved to outreach/email-01.md", c: "text-emerald-400" },
];

export function ClaudeHero({ course }: { course: Course }) {
  const [n, setN] = useState(5);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v >= SCRIPT.length + 3 ? 1 : v + 1)), 900);
    return () => clearInterval(id);
  }, []);
  const p = course.plans.find((x) => x.recommended)!;
  const t = course.teachers[0];
  const shown = SCRIPT.slice(0, Math.min(n, SCRIPT.length));
  const ready = n >= 7;
  return (
    <section className="relative isolate overflow-hidden bg-c-bg">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_85%_10%,rgba(217,119,87,.22),transparent_65%),radial-gradient(40%_40%_at_0%_100%,rgba(217,119,87,.1),transparent_70%)]" />
      <div className="mx-auto grid min-h-[100svh] max-w-[1240px] items-center gap-12 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-[12px] tracking-wide text-c-accent">~/vedantu/claude-mastery <span className="text-c-muted">main</span></p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="font-display mt-5 text-[clamp(2.76rem,4.91vw,4.52rem)] leading-[0.92]">
            <span className="block">Claude Mastery</span><span className="block text-c-accent ">for Internships</span>
          </motion.h1>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-c-fg/85">
            <span className="text-c-accent">{"//"}</span> {course.tagline}
          </p>
          <ul className="mt-7 space-y-2 text-[14px] text-c-fg/85">
            {course.highlights.map((h) => (<li key={h} className="flex gap-3"><ChevronRight className="mt-0.5 size-4 shrink-0 text-c-accent" />{h}</li>))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <EnrolButton course={course} plan={p} where="hero" className="inline-flex h-14 items-center gap-3 rounded-xl bg-c-accent px-8 text-[15px] font-semibold text-c-on transition hover:brightness-110">
              $ enrol <span className="opacity-70">--full-batch</span> · {inr(p.price)}
            </EnrolButton>
            {t?.photo && (
              <span className="flex items-center gap-3 text-sm text-c-muted">
                <span className="relative size-11 overflow-hidden rounded-full ring-1 ring-c-line"><Image src={t.photo} alt="" fill sizes="44px" className="object-cover object-top" /></span>
                Taught by <b className="font-medium text-c-fg">{t.name}</b>
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-c-line bg-black/40 shadow-[0_40px_100px_-30px_rgba(217,119,87,.35)] backdrop-blur">
            <div className="flex items-center gap-2 border-b border-c-line px-4 py-3">
              <i className="size-3 rounded-full bg-[#ff5f57]" /><i className="size-3 rounded-full bg-[#febc2e]" /><i className="size-3 rounded-full bg-[#28c840]" />
              <span className="mx-auto font-mono text-xs text-c-muted">claude · illustrative session</span>
            </div>
            <div className="min-h-[19rem] p-5 font-mono text-[13px] leading-7 sm:text-sm" aria-hidden>
              {shown.map((l, i) => (<motion.p key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={l.c ?? "text-c-fg/90"}>{l.t}</motion.p>))}
              <p className="caret text-c-accent">❯ </p>
            </div>
          </div>
          <AnimatePresence>
            {ready && (
              <motion.div initial={{ opacity: 0, y: 30, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: -2 }} exit={{ opacity: 0 }} transition={{ type: "spring", stiffness: 120, damping: 16 }}
                className="absolute -right-2 -bottom-10 w-[58%] overflow-hidden rounded-xl border border-c-line bg-c-surface shadow-2xl sm:-right-8">
                <div className="flex gap-1.5 border-b border-c-line px-3 py-2"><i className="size-2 rounded-full bg-c-accent" /><i className="size-2 rounded-full bg-c-accent/50" /><span className="ml-2 h-2 flex-1 rounded bg-c-fg/10" /></div>
                <div className="space-y-2 p-4"><p className="font-display text-xl">Your name.</p><p className="h-2 w-2/3 rounded bg-c-fg/15" />
                  <div className="grid grid-cols-3 gap-2 pt-2">{[0, 1, 2].map((k) => (<i key={k} className="aspect-[4/3] rounded-md bg-c-accent/25" />))}</div></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────── CURRICULUM AS A GIT LOG ─────────────────────── */
export function CommitLog({ course }: { course: Course }) {
  const [open, setOpen] = useState(0);
  return (
    <ol className="relative space-y-3 before:absolute before:top-3 before:bottom-3 before:left-[19px] before:w-px before:bg-c-line sm:space-y-4">
      {course.phases.map((ph, i) => {
        const isOpen = open === i;
        const full = ph.items.some((x) => !x.plans.includes("batch"));
        return (
          <li key={ph.n} className="relative pl-14">
            <span className={`absolute top-3 left-0 grid size-10 place-items-center rounded-full border bg-c-bg transition ${isOpen ? "border-c-accent text-c-accent" : "border-c-line text-c-muted"}`}><GitCommitHorizontal className="size-5" /></span>
            <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? -1 : i)}
              className={`w-full rounded-2xl border p-5 text-left transition sm:p-6 ${isOpen ? "border-c-accent/50 bg-c-surface2" : "border-c-line bg-c-surface hover:border-c-accent/30"}`}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
                <span className="text-c-accent">phase-0{ph.n}</span>
                <span className="text-c-muted">{ph.items.length} topics</span>
                <span className={`ml-auto rounded px-2 py-0.5 text-[11px] ${full ? "bg-c-accent/15 text-c-accent" : "bg-emerald-400/10 text-emerald-300"}`}>{full ? "full batch" : "both batches"}</span>
              </div>
              <p className="mt-2 text-[clamp(1.2rem,1.87vw,1.48rem)] font-medium">feat: {ph.title}</p>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden font-mono text-[13px] leading-7 sm:text-sm">
                    <li className="pt-4" />
                    {ph.items.map((it) => {
                      const both = it.plans.includes("batch");
                      return (
                        <li key={it.label} className={`flex gap-3 ${both ? "text-emerald-300/90" : "text-c-accent/90"}`}>
                          <span aria-hidden>+</span><span className="text-c-fg/85">{it.label}</span>
                          {!both && <Lock className="mt-1.5 size-3 shrink-0 text-c-muted" aria-label="Full batch only" />}
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/* ─────────────────────── PHASE 5 AS A LIVE KANBAN ─────────────────────── */
const COLS = [["Search", "Smart internship search & shortlisting"], ["Apply", "Targeted internship applications"], ["Outreach", "Cold email & LinkedIn outreach"], ["Track", "Internship application tracking system"], ["Interview", "Final interview-cracking preparation"]];

export function InternshipPipeline() {
  const [step, setStep] = useState(0);
  useEffect(() => { const id = setInterval(() => setStep((s) => (s + 1) % COLS.length), 1700); return () => clearInterval(id); }, []);
  return (
    <LayoutGroup>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {COLS.map(([k, d], i) => (
          <div key={k} className={`min-h-[220px] min-w-[200px] rounded-2xl border p-4 transition-colors sm:min-w-0 ${i === step ? "border-c-accent/50 bg-c-surface2" : "border-c-line bg-c-surface"}`}>
            <p className="text-[11px] tracking-widest text-c-accent uppercase">{String(i + 1).padStart(2, "0")} · {k}</p>
            <p className="mt-2 text-[13px] leading-snug text-c-muted">{d}</p>
            <div className="mt-4 space-y-2">
              {i <= step && i > step - 2 && i !== step && <div className="h-9 rounded-lg border border-dashed border-c-line" />}
              {i === step && (
                <motion.div layoutId="card" transition={{ type: "spring", stiffness: 260, damping: 26 }} className="rounded-lg bg-c-accent p-3 text-[13px] font-medium text-c-on shadow-lg">
                  <span className="flex items-center gap-2"><Check className="size-3.5" /> Your application</span>
                  <span className="mt-2 block h-1.5 w-2/3 rounded bg-c-on/30" />
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>
    </LayoutGroup>
  );
}
