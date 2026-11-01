"use client";
import { AnimatePresence, animate, motion, useInView, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Image as ImageIcon, Mic, PenTool, Search, Sparkles, Video, Workflow } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { type Course, inr, savePct } from "@/content/courses";
import { EnrolButton } from "@/components/ui/enrol";
import { SplitWords } from "@/components/ui/reveal";

/* ───────────────────────────────── HERO ───────────────────────────────── */
const ORBIT = [PenTool, ImageIcon, Video, Mic, Workflow, Search];

export function IncomeHero({ course }: { course: Course }) {
  const p = course.plans.find((x) => x.recommended)!;
  const t = course.teachers[0];
  return (
    <section className="noise relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_80%_20%,rgba(255,181,46,.22),transparent_65%),radial-gradient(50%_50%_at_10%_100%,rgba(255,122,26,.14),transparent_70%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.07] [background-image:linear-gradient(var(--c-accent)_1px,transparent_1px),linear-gradient(90deg,var(--c-accent)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(70%_70%_at_60%_40%,#000,transparent)]" />
      <div className="mx-auto grid min-h-[100svh] max-w-[1240px] items-center gap-10 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-c-line bg-c-surface/60 px-4 py-1.5 text-[12px] tracking-wide text-c-accent backdrop-blur">
            <Sparkles className="size-3.5" /> {course.eyebrow}
            {course.badge && <b className="ml-1 rounded-full bg-c-accent px-2 py-0.5 text-[10px] text-c-on uppercase">{course.badge}</b>}
          </motion.p>
          <h1 className="font-display mt-6 text-[clamp(3.31rem,7.8vw,6.55rem)] leading-[0.88] [text-wrap:balance]">
            <span className="block bg-gradient-to-b from-[#fff6df] via-[#ffd36b] to-c-accent2 bg-clip-text text-transparent">
              <SplitWords text="AI Income" />
            </span>
            <span className="block bg-gradient-to-b from-[#ffd36b] to-c-accent2 bg-clip-text text-transparent ">
              <SplitWords text="Mastery" delay={0.25} />
            </span>
          </h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="font-display mt-4 text-[clamp(1.47rem,2.5vw,1.95rem)] text-c-fg/90 ">
            {course.tagline}
          </motion.p>
          <motion.ul initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }} className="mt-7 grid gap-2.5 text-[16px] sm:grid-cols-2">
            {course.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2.5 text-c-fg/85"><Sparkles className="mt-1 size-4 shrink-0 text-c-accent" />{h}</li>
            ))}
          </motion.ul>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-9 flex flex-wrap items-center gap-5">
            <div className="rounded-xl border border-dashed border-c-accent/50 px-4 py-2.5">
              <p className="text-[11px] tracking-wide text-c-muted uppercase">At just</p>
              <p className="tabular flex items-baseline gap-2"><b className="text-3xl font-semibold text-c-accent">{inr(p.price)}</b><s className="text-sm text-c-muted">{inr(p.mrp!)}</s></p>
            </div>
            <EnrolButton course={course} plan={p} where="hero" className="inline-flex h-14 items-center rounded-full bg-gradient-to-b from-[#ffc65a] to-c-accent2 px-9 text-base font-semibold text-c-on shadow-[0_14px_40px_-12px_rgba(255,122,26,.7)] transition hover:brightness-110">
              Enrol now
            </EnrolButton>
            <a href="#path" className="flex items-center gap-2 text-sm text-c-muted transition hover:text-c-fg">See the 5 phases <ArrowDown className="size-4" /></a>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-[4/5] w-full max-w-[440px]">
          <svg viewBox="0 0 440 550" className="absolute inset-0 size-full overflow-visible" aria-hidden>
            <defs><linearGradient id="ig" x1="0" x2="1"><stop offset="0" stopColor="#ff7a1a" /><stop offset="1" stopColor="#ffd36b" /></linearGradient></defs>
            <motion.path d="M-40 520 C 60 500, 120 430, 190 400 S 330 300, 380 200 S 440 70, 500 20" fill="none" stroke="url(#ig)" strokeWidth="3" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 2.4, ease: "easeInOut" }} />
          </svg>
          <div className="absolute inset-[6%] rounded-t-[999px] rounded-b-[40px] bg-gradient-to-b from-c-accent/30 to-c-accent2/5 blur-2xl" />
          <div className="absolute inset-x-[8%] top-[6%] bottom-0 overflow-hidden rounded-t-[999px] rounded-b-[36px] border border-c-accent/30 bg-c-surface">
            {t?.photo && <Image src={t.photo} alt={`${t.name}, your AI Income Mastery instructor`} fill priority sizes="(max-width:768px) 80vw, 400px" className="object-cover object-top" />}
            <div className="absolute inset-0 bg-gradient-to-t from-c-bg/80 via-transparent to-transparent" />
            <p className="absolute inset-x-0 bottom-5 text-center text-sm text-c-fg/90">Taught by <b>{t?.name}</b></p>
          </div>
          <div className="absolute inset-0 animate-[spin_40s_linear_infinite]">
            {ORBIT.map((Icon, i) => {
              const a = (i / ORBIT.length) * Math.PI * 2;
              return (
                <span key={i} className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-c-line bg-c-surface/90 text-c-accent shadow-lg backdrop-blur"
                  style={{ left: `${50 + Math.cos(a) * 52}%`, top: `${44 + Math.sin(a) * 50}%` }}>
                  <span className="animate-[spin_40s_linear_infinite_reverse]"><Icon className="size-5" /></span>
                </span>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ───────────────────────────────── NUMBERS ───────────────────────────────── */
function CountUp({ value }: { value: string }) {
  const m = value.match(/^([\d,]+)(.*)$/);
  const target = m ? Number(m[1].replace(/,/g, "")) : 0;
  const numeric = !!m;
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView || !numeric) return;
    const c = animate(0, target, { duration: 1.8, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, target, numeric]);
  if (!m) return <span>{value}</span>;
  return <span ref={ref} className="tabular">{(inView ? n : 0).toLocaleString("en-IN")}{m[2]}</span>;
}

export function IncomeNumbers({ stats }: { stats: { value: string; label: string }[] }) {
  return (
    <section aria-label="By the numbers" className="border-y border-c-line bg-c-surface/60">
      <dl className="mx-auto grid max-w-[1240px] grid-cols-2 gap-px bg-c-line sm:px-6 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-c-bg px-5 py-10 sm:py-14">
            <dt className="order-2 mt-3 text-sm text-c-muted">{s.label}</dt>
            <dd className="font-display bg-gradient-to-b from-[#fff6df] to-c-accent2 bg-clip-text text-[clamp(2.39rem,4.37vw,3.59rem)] leading-none text-transparent"><CountUp value={s.value} /></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ───────────────────────── PINNED INCOME PATH (5 phases) ───────────────────────── */
export function IncomePath({ course }: { course: Course }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);
  const n = course.phases.length;
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(n - 1, Math.max(0, Math.floor(v * n * 0.999)))));
  const ph = course.phases[active];
  const draw = useTransform(scrollYProgress, [0.02, 0.98], [0, 1]);
  const pts = course.phases.map((_, i) => [40 + (i / (n - 1)) * 520, 300 - (i / (n - 1)) * 240 - Math.sin(i * 1.4) * 14] as const);
  const d = pts.map(([x, y], i) => (i ? `L${x} ${y}` : `M${x} ${y}`)).join(" ");

  return (
    <section id="path" ref={ref} aria-label="The five-phase journey" className="relative scroll-mt-14" style={{ height: `${n * 85}vh` }}>
      <div className="sticky top-14 flex h-[calc(100svh-3.5rem)] items-center overflow-hidden">
        <div className="mx-auto grid w-full max-w-[1240px] items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-c-accent uppercase">{course.phaseLabel}</p>
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45 }}>
                <p className="font-display mt-5 text-[clamp(4.6rem,10.92vw,8.58rem)] leading-[0.8] text-c-accent/25">0{ph.n}</p>
                <h2 className="font-display -mt-6 text-[clamp(2.58rem,5.46vw,4.37rem)] leading-none sm:-mt-10">{ph.title}</h2>
                <ul className="mt-6 space-y-2.5 text-[16px] text-c-fg/85">
                  {ph.items.map((it) => (
                    <li key={it.label} className="flex items-start gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-c-accent" />
                      <span>{it.label}{!it.plans.includes("batch") && <em className="ml-2 rounded-full border border-c-accent/40 px-2 py-0.5 text-[10px] tracking-wider text-c-accent">Full batch</em>}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="relative">
            <svg viewBox="0 0 600 340" className="w-full overflow-visible" role="img" aria-label="A rising path through the five phases from Learn to Earn">
              <defs><linearGradient id="path-g" x1="0" x2="1"><stop offset="0" stopColor="#ff7a1a" /><stop offset="1" stopColor="#ffd36b" /></linearGradient></defs>
              <path d={d} fill="none" stroke="var(--c-line)" strokeWidth="2" strokeDasharray="3 8" />
              <motion.path d={d} fill="none" stroke="url(#path-g)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
              {pts.map(([x, y], i) => (
                <g key={i}>
                  <circle cx={x} cy={y} r={i === active ? 16 : 9} fill={i <= active ? "var(--c-accent)" : "var(--c-surface2)"} stroke="var(--c-accent)" strokeOpacity={i <= active ? 1 : 0.3} style={{ transition: "all .4s" }} />
                  {i === active && <circle cx={x} cy={y} r="16" fill="var(--c-accent)" opacity=".4" style={{ transformOrigin: `${x}px ${y}px`, animation: "pulse-ring 2s infinite" }} />}
                  <text x={x} y={y + (i % 2 ? 40 : -26)} textAnchor="middle" fontSize="15" fill={i <= active ? "var(--c-fg)" : "var(--c-muted)"} style={{ transition: "fill .4s" }}>{course.phases[i].title}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────── PROMPT STUDIO (interactive) ───────────────────────────── */
const GOALS = [
  { k: "Resume", prompt: "Act as a recruiter. Rewrite my resume bullets for an internship application. Keep each under 20 words and start with a strong verb.", out: ["Led a 4-person team to…", "Built a quiz app that…", "Analysed data to cut…"] },
  { k: "YouTube Short", prompt: "Write a 30-second Shorts script that teaches beginners one idea about content writing. Hook in the first 3 seconds.", out: ["Hook · 0–3s", "Idea · 3–20s", "Call to action · 20–30s"] },
  { k: "Freelance pitch", prompt: "Draft a short pitch to a local brand offering to write their Instagram captions. Mention one specific improvement.", out: ["Opening line", "What I'd change", "Simple next step"] },
  { k: "Quiz app", prompt: "Plan a JEE chapter-wise quiz app for my phone. List the screens, the data I need and the first version I can build in a weekend.", out: ["Screens · 4", "Data · questions.json", "MVP · weekend build"] },
];

export function PromptStudio() {
  const [g, setG] = useState(0);
  const [n, setN] = useState(0);
  useEffect(() => {
    const full = GOALS[g].prompt.length;
    const id = setInterval(() => setN((v) => { if (v >= full) { clearInterval(id); return v; } return v + 2; }), 22);
    return () => clearInterval(id);
  }, [g]);
  const typed = GOALS[g].prompt.slice(0, n);
  const done = n >= GOALS[g].prompt.length;
  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-[11px] tracking-[0.22em] text-c-accent uppercase">Try the idea</p>
        <h2 className="font-display mt-4 text-[clamp(2.02rem,3.9vw,3.12rem)] leading-[0.98]">One good prompt. <span className="text-c-accent ">Many outcomes.</span></h2>
        <p className="mt-5 max-w-md text-c-muted">Pick a goal. See what a structured prompt looks like. This is an illustrative sample, not course material.</p>
        <div role="tablist" aria-label="Pick a goal" className="mt-7 flex flex-wrap gap-2">
          {GOALS.map((x, i) => (
            <button key={x.k} role="tab" aria-selected={i === g} onClick={() => { setG(i); setN(0); }}
              className={`rounded-full border px-4 py-2 text-[14px] transition ${i === g ? "border-c-accent bg-c-accent text-c-on" : "border-c-line text-c-fg/80 hover:border-c-accent/50"}`}>{x.k}</button>
          ))}
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-c-line bg-c-surface">
        <div className="flex items-center gap-2 border-b border-c-line px-5 py-3"><i className="size-2.5 rounded-full bg-c-accent" /><i className="size-2.5 rounded-full bg-c-accent/40" /><i className="size-2.5 rounded-full bg-c-accent/20" /><span className="ml-3 text-xs text-c-muted">prompt.txt · sample</span></div>
        <div className="p-6 sm:p-8">
          <p className="min-h-[7.5rem] text-[16px] leading-relaxed text-c-fg" aria-live="polite">{typed}<span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-c-accent align-middle" /></p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {GOALS[g].out.map((o, i) => (
              <motion.div key={`${g}-${o}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: done ? 1 : 0.15, y: done ? 0 : 12 }} transition={{ delay: done ? i * 0.12 : 0 }}
                className="rounded-2xl border border-c-line bg-c-surface2 p-4 text-sm text-c-fg/90">
                <span className="mb-2 block h-1 w-8 rounded bg-c-accent" />{o}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────── REVIEWS (two marquee rows) ───────────────────────────── */
function ReviewRow({ items, rev }: { items: Course["reviews"]; rev?: boolean }) {
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      <div className="flex w-max shrink-0 gap-4 py-2 pr-4 group-hover:[animation-play-state:paused]" style={{ animation: `marquee ${items.length * 9}s linear infinite ${rev ? "reverse" : ""}` }}>
        {[...items, ...items].map((r, i) => (
          <figure key={i} className="w-[320px] shrink-0 rounded-3xl border border-c-line bg-c-surface p-6">
            <blockquote className="text-[14.5px] leading-relaxed text-c-fg/90">“{r.text}”</blockquote>
            <figcaption className="mt-4 flex items-center gap-3 text-sm">
              <span className="grid size-8 place-items-center rounded-full bg-c-accent/20 text-xs font-semibold text-c-accent">{r.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}</span>{r.name}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

export function ReviewsWall({ course }: { course: Course }) {
  const a = course.reviews.filter((_, i) => i % 2 === 0);
  const b = course.reviews.filter((_, i) => i % 2 === 1);
  return (
    <div className="space-y-4">
      <ReviewRow items={a} />
      <ReviewRow items={b} rev />
    </div>
  );
}

export { savePct };
