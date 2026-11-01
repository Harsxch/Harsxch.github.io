"use client";
import { AnimatePresence, motion } from "framer-motion";
import { FileCode2, Folder, FolderOpen, Play, Shuffle } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { type Course, inr } from "@/content/courses";
import { EnrolButton } from "@/components/ui/enrol";

/* tiny Python syntax highlighter (good enough for the demo snippets) */
const KW = new Set(["def", "return", "class", "print", "for", "in", "if", "self", "import", "from"]);
function hl(src: string) {
  return src.split("\n").map((line, li) => {
    const parts = line.match(/(#.*$|f?"[^"]*"|\b\d+\b|\b[A-Za-z_]\w*\b|\s+|.)/g) ?? [];
    return (
      <div key={li} className="flex">
        <span className="w-8 shrink-0 pr-4 text-right text-[#3d5a41] select-none">{li + 1}</span>
        <span className="whitespace-pre">
          {parts.map((t, i) => {
            let c = "text-[#d8f0d4]";
            if (t.startsWith("#")) c = "text-[#4d7a52] ";
            else if (/^f?"/.test(t)) c = "text-[#ffd479]";
            else if (/^\d+$/.test(t)) c = "text-[#ff9f6b]";
            else if (KW.has(t)) c = "text-[#7dff5a]";
            else if (/^[A-Za-z_]\w*$/.test(t) && line.slice(line.indexOf(t) + t.length).startsWith("(")) c = "text-[#8fe3ff]";
            return <span key={i} className={c}>{t}</span>;
          })}
        </span>
      </div>
    );
  });
}

const SNIPS = [
  { code: '# class 1\nprint("Hello, Vedantu")', out: "Hello, Vedantu" },
  { code: "# functions\ndef streak(days):\n    return sum(days)\n\nprint(streak([2, 3, 4]))", out: "9" },
  { code: '# the big project\nclass StudySprint:\n    def __init__(self, subject):\n        self.subject = subject\n\n    def plan(self):\n        return f"{self.subject}: 3 sessions"\n\nprint(StudySprint("DSA").plan())', out: "DSA: 3 sessions" },
];

export function PythonHero({ course }: { course: Course }) {
  const [s, setS] = useState(0);
  const [i, setI] = useState(0);
  const [ran, setRan] = useState(false);
  const snip = SNIPS[s];
  useEffect(() => {
    if (i < snip.code.length) { const t = setTimeout(() => setI(i + 1), 34); return () => clearTimeout(t); }
    const a = setTimeout(() => setRan(true), 500);
    const b = setTimeout(() => { setRan(false); setI(0); setS((v) => (v + 1) % SNIPS.length); }, 3600);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [i, snip.code.length]);
  const p = course.plans.find((x) => x.recommended)!;
  const t = course.teachers[0];
  return (
    <section className="relative isolate overflow-hidden bg-c-bg">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(55%_55%_at_15%_90%,rgba(125,255,90,.16),transparent_70%),radial-gradient(40%_40%_at_90%_0%,rgba(53,194,74,.12),transparent_70%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.06] [background-image:radial-gradient(var(--c-accent)_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="mx-auto grid min-h-[100svh] max-w-[1240px] items-center gap-10 px-4 pt-28 pb-16 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-md border border-c-line bg-c-surface px-3 py-1.5 text-xs text-c-accent"><i className="size-1.5 animate-pulse rounded-full bg-c-accent" />{course.eyebrow}</p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            className="mt-6 text-[clamp(1.93rem,3.67vw,3.35rem)] leading-[1.04] font-bold tracking-[-0.05em]">
            <span className="block"><span className="text-c-accent">Python</span> + DSA</span><span className="block">Mastery</span>
          </motion.h1>
          <p className="mt-5 text-[clamp(0.97rem,1.4vw,1.05rem)] text-c-fg/80">{course.tagline}</p>
          <ul className="mt-7 space-y-2.5 text-[14px]">
            {course.highlights.map((h) => (<li key={h} className="flex gap-3 text-c-fg/85"><span className="text-c-accent">{">>>"}</span>{h}</li>))}
          </ul>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <EnrolButton course={course} plan={p} where="hero" className="inline-flex h-14 items-center gap-3 rounded-lg bg-c-accent px-8 text-[15px] font-bold text-c-on shadow-[0_0_50px_-8px_var(--c-accent)] transition hover:brightness-110">
              <Play className="size-4 fill-current" /> run enrol() · {inr(p.price)}
            </EnrolButton>
            {t.photo && (
              <span className="flex items-center gap-3 text-sm text-c-muted"><span className="relative size-11 overflow-hidden rounded-full ring-1 ring-c-line"><Image src={t.photo} alt="" fill sizes="44px" className="object-cover object-top" /></span>
                with <b className="font-medium text-c-fg">{t.name}</b></span>
            )}
          </div>
        </div>
        <div className="overflow-hidden rounded-xl border border-c-line bg-[#070d08] shadow-[0_0_100px_-30px_var(--c-accent)]">
          <div className="flex items-center justify-between border-b border-c-line px-4 py-2.5 font-mono text-xs text-c-muted">
            <span className="flex items-center gap-2"><FileCode2 className="size-3.5 text-c-accent" /> main.py</span>
            <span className={`flex items-center gap-1.5 rounded px-2 py-0.5 ${ran ? "bg-c-accent text-c-on" : "bg-c-fg/10"}`}><Play className="size-3 fill-current" />{ran ? "ran" : "run"}</span>
          </div>
          <div className="min-h-[17rem] p-4 font-mono text-[13px] leading-6 sm:text-sm" aria-label="Animated code sample" role="img">{hl(snip.code.slice(0, i))}<span className="caret" /></div>
          <div className="border-t border-c-line bg-black/50 px-4 py-3 font-mono text-sm">
            <span className="text-c-muted">output ▸ </span><span className={`text-c-accent transition ${ran ? "opacity-100" : "opacity-0"}`}>{snip.out}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Curriculum as a file explorer ───────────────────────── */
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 34);

export function FileExplorer({ course }: { course: Course }) {
  const [open, setOpen] = useState<number[]>([1]);
  const [sel, setSel] = useState<[number, number]>([0, 0]);
  const ph = course.phases[sel[0]];
  const it = ph.items[sel[1]];
  return (
    <div className="grid overflow-hidden rounded-2xl border border-c-line bg-c-surface lg:grid-cols-[minmax(0,22rem)_1fr]">
      <div className="border-b border-c-line p-3 font-mono text-[13px] lg:border-r lg:border-b-0" role="tree" aria-label="Curriculum files">
        <p className="px-2 py-2 text-[11px] tracking-widest text-c-muted uppercase">explorer · python-dsa-mastery</p>
        {course.phases.map((p, pi) => {
          const o = open.includes(p.n);
          return (
            <div key={p.n}>
              <button type="button" role="treeitem" aria-selected={false} aria-expanded={o} onClick={() => setOpen(o ? open.filter((x) => x !== p.n) : [...open, p.n])}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-c-fg/5">
                {o ? <FolderOpen className="size-4 text-c-accent" /> : <Folder className="size-4 text-c-accent" />}
                <span>{String(p.n).padStart(2, "0")}_{p.title.toLowerCase()}/</span>
              </button>
              {o && p.items.map((x, xi) => {
                const active = sel[0] === pi && sel[1] === xi;
                return (
                  <button key={x.label} type="button" role="treeitem" aria-selected={active} onClick={() => setSel([pi, xi])}
                    className={`ml-6 flex w-[calc(100%-1.5rem)] items-center gap-2 rounded-md px-2 py-1.5 text-left transition ${active ? "bg-c-accent/15 text-c-accent" : "text-c-fg/70 hover:bg-c-fg/5"}`}>
                    <FileCode2 className="size-3.5 shrink-0" /><span className="truncate">{slug(x.label)}.py</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="min-h-[18rem] p-6 sm:p-9">
        <AnimatePresence mode="wait">
          <motion.div key={`${sel[0]}-${sel[1]}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="font-mono">
            <div className="flex items-center justify-between text-xs text-c-muted">
              <span>phase {ph.n} / {ph.title.toLowerCase()} / {slug(it.label)}.py</span>
              <span className="rounded bg-c-accent/15 px-2 py-0.5 text-c-accent">{sel[1] + 1} of {ph.items.length}</span>
            </div>
            <p className="mt-6 text-[clamp(1.29rem,2.18vw,1.72rem)] leading-snug font-semibold"><span className="text-c-muted"># </span>{it.label}</p>
            <div className="mt-8 grid gap-2 text-sm">
              {course.plans.map((p) => {
                const yes = it.plans.includes(p.id);
                return (
                  <div key={p.id} className={`flex items-center justify-between rounded-lg border px-4 py-3 ${yes ? "border-c-accent/40 bg-c-accent/10" : "border-c-line opacity-50"}`}>
                    <span>{p.name}</span><span className={yes ? "text-c-accent" : "text-c-muted"}>{yes ? "✓ included" : "✕ not included"}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-8 flex h-1.5 gap-1" aria-hidden>{ph.items.map((_, k) => (<i key={k} className={`flex-1 rounded-full ${k <= sel[1] ? "bg-c-accent" : "bg-c-fg/10"}`} />))}</div>
            <button type="button" onClick={() => setSel(sel[1] + 1 < ph.items.length ? [sel[0], sel[1] + 1] : [(sel[0] + 1) % course.phases.length, 0])}
              className="mt-6 rounded-lg border border-c-line px-4 py-2 text-sm text-c-fg/80 transition hover:border-c-accent/60 hover:text-c-accent">next file →</button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ───────────────────────── DSA playground: sorting + stack ───────────────────────── */
const seed = () => [64, 22, 88, 35, 52, 14, 76, 41, 95, 28, 60, 8];

export function DsaPlayground() {
  const [a, setA] = useState(seed);
  const [cmp, setCmp] = useState<[number, number] | null>(null);
  const [run, setRun] = useState(false);
  const arr = useRef(a);
  const st = useRef({ i: 0, j: 0 });
  useEffect(() => { arr.current = a; }, [a]);

  const shuffle = useCallback(() => { setRun(false); setCmp(null); st.current = { i: 0, j: 0 }; setA([...seed()].sort(() => Math.random() - 0.5)); }, []);
  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => {
      const x = [...arr.current]; const { i, j } = st.current; const n = x.length;
      if (i >= n - 1) { setRun(false); setCmp(null); return; }
      setCmp([j, j + 1]);
      if (x[j] > x[j + 1]) { [x[j], x[j + 1]] = [x[j + 1], x[j]]; setA(x); }
      st.current = j + 1 >= n - 1 - i ? { i: i + 1, j: 0 } : { i, j: j + 1 };
    }, 55);
    return () => clearInterval(id);
  }, [run]);

  const [stack, setStack] = useState<string[]>(["a", "b"]);
  const sorted = a.every((v, i) => i === 0 || a[i - 1] <= v);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <div className="rounded-2xl border border-c-line bg-c-surface p-6 sm:p-8">
        <div className="flex items-center justify-between font-mono text-xs text-c-muted"><span>bubble_sort(arr)</span><span>{sorted ? "✓ sorted" : run ? "sorting…" : "unsorted"}</span></div>
        <div className="mt-6 flex h-52 items-end gap-1.5 sm:gap-2" role="img" aria-label="Bar chart animating a bubble sort">
          {a.map((v, i) => (
            <motion.i key={i} layout transition={{ type: "spring", stiffness: 400, damping: 30 }} className="flex-1 rounded-t-md"
              style={{ height: `${v}%`, background: cmp?.includes(i) ? "#ffd479" : sorted ? "var(--c-accent)" : "var(--c-accent2)", opacity: cmp?.includes(i) ? 1 : 0.8 }} />
          ))}
        </div>
        <div className="mt-6 flex gap-3 font-mono text-sm">
          <button onClick={() => (sorted ? shuffle() : setRun((r) => !r))} className="inline-flex items-center gap-2 rounded-lg bg-c-accent px-5 py-2.5 font-semibold text-c-on"><Play className="size-4 fill-current" />{sorted ? "reset" : run ? "pause" : "sort()"}</button>
          <button onClick={shuffle} className="inline-flex items-center gap-2 rounded-lg border border-c-line px-5 py-2.5 hover:border-c-accent/50"><Shuffle className="size-4" />shuffle</button>
        </div>
      </div>
      <div className="rounded-2xl border border-c-line bg-c-surface p-6 sm:p-8">
        <p className="font-mono text-xs text-c-muted">stack = []  # last in, first out</p>
        <div className="mt-6 flex h-52 flex-col-reverse gap-1.5 overflow-hidden rounded-lg border border-dashed border-c-line p-2">
          <AnimatePresence initial={false}>
            {stack.map((s, i) => (
              <motion.div key={s + i} layout initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 40 }}
                className={`rounded-md px-4 py-2 font-mono text-sm ${i === stack.length - 1 ? "bg-c-accent text-c-on" : "bg-c-fg/10"}`}>{s}{i === stack.length - 1 && <span className="float-right opacity-70">← top</span>}</motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="mt-6 flex gap-3 font-mono text-sm">
          <button onClick={() => setStack((s) => (s.length < 6 ? [...s, String.fromCharCode(99 + (s.length % 20))] : s))} className="rounded-lg bg-c-accent px-5 py-2.5 font-semibold text-c-on">push()</button>
          <button onClick={() => setStack((s) => s.slice(0, -1))} className="rounded-lg border border-c-line px-5 py-2.5 hover:border-c-accent/50">pop()</button>
        </div>
      </div>
    </div>
  );
}
