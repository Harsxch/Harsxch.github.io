"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, BookOpenCheck, Brain, ListChecks, Target } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Course, inr } from "@/content/courses";
import { EnrolButton } from "@/components/ui/enrol";

/* ───────────────────────── HERO: a study desk ───────────────────────── */
const STEPS = ["Step 1 · Read the question again", "Step 2 · Write what is given", "Step 3 · Pick the formula", "Step 4 · Solve, then check the unit"];

export function StudyHero({ course }: { course: Course }) {
  const [k, setK] = useState(0);
  useEffect(() => { const id = setInterval(() => setK((v) => (v + 1) % (STEPS.length + 2)), 1100); return () => clearInterval(id); }, []);
  const p = course.plans[0];
  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_80%_0%,rgba(255,166,61,.25),transparent_65%),radial-gradient(50%_50%_at_0%_100%,rgba(255,127,80,.14),transparent_70%)]" />
      <div className="mx-auto grid min-h-[100svh] max-w-[1240px] items-center gap-12 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-c-accent/15 px-4 py-1.5 text-[13px] font-medium text-c-accent"><Brain className="size-4" />{course.eyebrow}</p>
          <h1 className="font-display mt-6 text-[clamp(2.94rem,6.24vw,5.15rem)] leading-[0.94] font-semibold tracking-[-0.035em]">
            AI Study <span className="relative inline-block">Mastery
              <motion.svg viewBox="0 0 300 20" className="absolute -bottom-2 left-0 w-full overflow-visible text-c-accent" aria-hidden>
                <motion.path d="M4 12 C 60 2, 120 18, 180 8 S 270 12, 296 6" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 1 }} />
              </motion.svg></span>
          </h1>
          <p className="font-display mt-8 max-w-md text-[clamp(1.29rem,2.03vw,1.56rem)] leading-snug text-c-fg/90">{course.tagline}</p>
          <ul className="mt-7 space-y-3 text-[16.5px]">
            {course.highlights.map((h) => (<li key={h} className="flex gap-3 text-c-fg/85"><span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-c-accent text-c-on"><BookOpenCheck className="size-3" /></span>{h}</li>))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <EnrolButton course={course} plan={p} where="hero" className="inline-flex h-14 items-center gap-2 rounded-full bg-c-accent px-9 text-base font-semibold text-c-on shadow-[0_14px_40px_-14px_var(--c-accent)] transition hover:brightness-110">
              Enrol now · {inr(p.price)}
            </EnrolButton>
            <span className="text-sm text-c-muted">{course.audienceTag} · {course.language}</span>
          </div>
        </div>

        <div className="relative mx-auto h-[28rem] w-full max-w-[34rem] sm:h-[32rem]" aria-hidden>
          <motion.div initial={{ opacity: 0, rotate: -9, y: 30 }} animate={{ opacity: 1, rotate: -4, y: 0 }} transition={{ delay: 0.2, duration: 0.9 }}
            className="absolute top-4 left-0 w-[62%] rounded-2xl bg-[#fff3e4] p-5 text-[#1d0f02] shadow-2xl">
            <p className="font-semibold text-2xl">Revision notes</p>
            <div className="mt-3 space-y-2">{[90, 72, 84, 55].map((w, i) => (<i key={i} className="block h-1.5 rounded-full bg-[#1d0f02]/15" style={{ width: `${w}%` }} />))}</div>
            <p className="font-semibold mt-4 text-xl text-[#d4570d]">a² + b² = c² ✓</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }}
            className="absolute top-24 right-0 w-[68%] rounded-2xl border border-c-line bg-c-surface2 p-5 shadow-2xl sm:top-28">
            <p className="rounded-xl bg-c-fg/10 px-3.5 py-2 text-sm">Explain this question step by step</p>
            <div className="mt-3 space-y-2 text-sm">
              {STEPS.slice(0, Math.min(k, STEPS.length)).map((s) => (<motion.p key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl bg-c-accent px-3.5 py-2 font-medium text-c-on">{s}</motion.p>))}
              {k < STEPS.length && <p className="flex gap-1 pl-2">{[0, 1, 2].map((d) => (<i key={d} className="size-1.5 animate-bounce rounded-full bg-c-muted" style={{ animationDelay: `${d * 0.15}s` }} />))}</p>}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9, type: "spring" }}
            className="absolute bottom-0 left-[8%] w-[56%] rounded-2xl border border-c-accent/40 bg-c-bg p-4 shadow-2xl">
            <p className="flex items-center gap-2 text-xs tracking-widest text-c-accent uppercase"><Target className="size-3.5" /> Study plan</p>
            {["Maths · 40 min", "Science · 30 min", "Revise · 20 min"].map((t, i) => (<p key={t} className="mt-2 flex items-center gap-2 text-sm"><span className={`grid size-4 place-items-center rounded border ${i < 2 ? "border-c-accent bg-c-accent" : "border-c-line"}`} />{t}</p>))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Four study stages (snap carousel) ───────────────────────── */
const TINTS = [["#fff3e4", "#1d0f02"], ["#ffd9b0", "#2a1304"], ["#ffbf8a", "#2a1304"], ["#ffa63d", "#1d0f02"]];

export function StudyStages({ course }: { course: Course }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6" tabIndex={0} aria-label="Four study stages">
        {course.phases.map((ph, i) => (
          <article key={ph.n} className="relative min-h-[28rem] w-[84%] shrink-0 snap-center overflow-hidden rounded-[32px] p-7 sm:w-[26rem] sm:p-9" style={{ background: TINTS[i][0], color: TINTS[i][1] }}>
            <p className="font-semibold text-3xl opacity-70">Stage {ph.n}</p>
            <h3 className="font-display mt-1 text-[clamp(1.56rem,2.03vw,1.72rem)] leading-tight font-semibold tracking-[-0.02em]">{ph.title}</h3>
            {ph.kicker && <p className="mt-2 text-[14.5px] opacity-75">{ph.kicker}</p>}
            <ul className="mt-6 space-y-3 text-[15px]">
              {ph.items.map((it) => (<li key={it.label} className="flex gap-3"><ListChecks className="mt-0.5 size-4 shrink-0" />{it.label}</li>))}
            </ul>
            <span className="font-display pointer-events-none absolute -right-3 -bottom-10 text-[11rem] leading-none font-semibold opacity-[0.12]">{ph.n}</span>
          </article>
        ))}
      </div>
      <p className="mt-2 flex items-center gap-2 text-sm text-c-muted">Swipe <ArrowRight className="size-4" /></p>
    </div>
  );
}

/* ───────────────────────── Flashcards + mind map (illustrative) ───────────────────────── */
const CARDS = [["SI unit of force?", "Newton (N)"], ["What does a noun name?", "A person, place, thing or idea"], ["Area of a circle?", "π × r²"]];
const MAPS: Record<string, string[]> = { Maths: ["Algebra", "Geometry", "Mensuration", "Statistics"], Science: ["Physics", "Chemistry", "Biology", "Experiments"], English: ["Grammar", "Writing", "Literature", "Comprehension"] };

export function StudyToys() {
  const [flip, setFlip] = useState<number | null>(null);
  const [subj, setSubj] = useState("Maths");
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-[32px] border border-c-line bg-c-surface p-7 sm:p-9">
        <p className="font-semibold text-3xl text-c-accent">Mind map creator</p>
        <p className="mt-1 text-sm text-c-muted">Pick a subject. A topic turns into branches. (Illustrative demo.)</p>
        <div className="mt-5 flex gap-2">{Object.keys(MAPS).map((k) => (<button key={k} onClick={() => setSubj(k)} aria-pressed={k === subj} className={`rounded-full px-4 py-2 text-sm transition ${k === subj ? "bg-c-accent text-c-on" : "border border-c-line text-c-fg/80"}`}>{k}</button>))}</div>
        <div className="relative mt-6 h-72">
          <svg viewBox="0 0 400 280" className="absolute inset-0 size-full">
            <AnimatePresence mode="wait">
              <motion.g key={subj} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {MAPS[subj].map((n, i) => {
                  const a = (i / 4) * Math.PI * 2 + Math.PI / 4; const x = 200 + Math.cos(a) * 130; const y = 140 + Math.sin(a) * 92;
                  return (<g key={n}>
                    <motion.line x1="200" y1="140" x2={x} y2={y} stroke="var(--c-accent)" strokeOpacity=".55" strokeDasharray="4 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.15 * i }} />
                    <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + 0.12 * i, type: "spring" }} style={{ transformOrigin: `${x}px ${y}px` }}>
                      <rect x={x - 52} y={y - 16} width="104" height="32" rx="16" fill="var(--c-surface2)" stroke="var(--c-accent)" strokeOpacity=".6" /><text x={x} y={y + 5} textAnchor="middle" fontSize="14" fill="var(--c-fg)">{n}</text></motion.g></g>);
                })}
                <circle cx="200" cy="140" r="40" fill="var(--c-accent)" /><text x="200" y="146" textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--c-on)">{subj}</text>
              </motion.g>
            </AnimatePresence>
          </svg>
        </div>
      </div>
      <div className="rounded-[32px] border border-c-line bg-c-surface p-7 sm:p-9">
        <p className="font-semibold text-3xl text-c-accent">Quiz & flashcards</p>
        <p className="mt-1 text-sm text-c-muted">Tap a card to flip it. (Illustrative demo.)</p>
        <div className="mt-6 grid gap-3">
          {CARDS.map(([q, a], i) => (
            <button key={q} onClick={() => setFlip(flip === i ? null : i)} aria-label={`Flashcard: ${q}`} className="relative h-24 [perspective:900px] text-left">
              <motion.div animate={{ rotateX: flip === i ? 180 : 0 }} transition={{ duration: 0.55 }} style={{ transformStyle: "preserve-3d" }} className="absolute inset-0">
                <span className="absolute inset-0 flex items-center rounded-2xl bg-[#fff3e4] px-6 text-lg font-medium text-[#1d0f02] [backface-visibility:hidden]">{q}</span>
                <span className="absolute inset-0 flex items-center rounded-2xl bg-c-accent px-6 text-lg font-semibold text-c-on [backface-visibility:hidden] [transform:rotateX(180deg)]">{a}</span>
              </motion.div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
