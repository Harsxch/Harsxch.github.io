"use client";
import { motion } from "framer-motion";
import { Image as ImageIcon, Mic, PenTool, Search, Video, Workflow } from "lucide-react";
import { useEffect, useState } from "react";
import type { ThemeId } from "@/content/courses";

/**
 * Animated, code-drawn scenes for the large homepage course panels. No stock imagery, no invented numbers:
 * every scene is an illustration of the course idea. Motion is neutralised by the global reduced-motion rules.
 */
export function PanelArt({ theme }: { theme: ThemeId }) {
  const Scene = SCENES[theme];
  if (!Scene) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <Scene />
    </div>
  );
}

function useTick(ms: number, mod: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN((v) => (v + 1) % mod), ms);
    return () => clearInterval(id);
  }, [ms, mod]);
  return n;
}

/* ───────────────────────────── AI INCOME ───────────────────────────── */
const ORBIT = [PenTool, ImageIcon, Video, Mic, Workflow, Search];
const CHIPS: [string, string, string, number][] = [
  ["Write", "8%", "66%", 0], ["Design", "22%", "82%", 1.2], ["Automate", "64%", "74%", 2.1], ["Research", "62%", "20%", 0.7],
];

function IncomeScene() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_70%_85%,rgba(255,181,46,.34),transparent_65%),radial-gradient(40%_40%_at_20%_10%,rgba(255,122,26,.16),transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.09] [background-image:linear-gradient(var(--c-accent)_1px,transparent_1px),linear-gradient(90deg,var(--c-accent)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(75%_75%_at_65%_45%,#000,transparent)]" />
      <svg viewBox="0 0 600 600" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id="pi-line" x1="0" x2="1"><stop offset="0" stopColor="#ff7a1a" /><stop offset="1" stopColor="#ffe08a" /></linearGradient>
          <linearGradient id="pi-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#ffb52e" stopOpacity=".28" /><stop offset="1" stopColor="#ffb52e" stopOpacity="0" /></linearGradient>
        </defs>
        <motion.path d="M-20 530 C 90 510, 170 440, 250 400 S 400 310, 470 220 S 560 100, 650 40 V 620 H -20Z" fill="url(#pi-area)"
          initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1, 0] }} transition={{ duration: 6, repeat: Infinity, times: [0, 0.4, 0.85, 1] }} />
        <motion.path d="M-20 530 C 90 510, 170 440, 250 400 S 400 310, 470 220 S 560 100, 650 40" fill="none" stroke="url(#pi-line)" strokeWidth="4" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: [0, 1, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.55, 1] }} />
        {[[250, 400, 0.18], [470, 220, 0.34], [590, 78, 0.52]].map(([x, y, t], i) => (
          <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 1, 0], scale: [0, 1, 1, 0.6] }}
            transition={{ duration: 6, repeat: Infinity, times: [t, t + 0.06, 0.9, 1] }} style={{ transformOrigin: `${x}px ${y}px` }}>
            <circle cx={x} cy={y} r="20" fill="#ffb52e" opacity=".18" /><circle cx={x} cy={y} r="6.5" fill="#ffe08a" />
          </motion.g>
        ))}
      </svg>

      <div className="absolute top-[42%] left-[46%] aspect-square w-[50%] -translate-x-1/2 -translate-y-1/2">
        <i className="absolute inset-0 rounded-full border border-dashed border-c-accent/25" />
        <i className="absolute inset-[16%] rounded-full border border-dashed border-c-accent/20" />
        <div className="absolute inset-0 animate-[spin_36s_linear_infinite]">
          {ORBIT.map((Icon, i) => {
            const a = (i / ORBIT.length) * Math.PI * 2;
            return (
              <span key={i} className="absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-c-line bg-c-surface/90 text-c-accent shadow-lg backdrop-blur"
                style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%` }}>
                <span className="animate-[spin_36s_linear_infinite_reverse]"><Icon className="size-5" /></span>
              </span>
            );
          })}
        </div>
        <motion.div animate={{ rotateY: 360 }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }} style={{ transformStyle: "preserve-3d" }}
          className="absolute top-1/2 left-1/2 grid size-[26%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-br from-[#ffe08a] via-[#ffb52e] to-[#ff7a1a] shadow-[0_0_60px_-4px_rgba(255,181,46,.7)]">
          <span className="text-[clamp(1.4rem,3vw,2.4rem)] font-bold text-[#3a2000]">₹</span>
        </motion.div>
      </div>

      {CHIPS.map(([t, l, tp, d]) => (
        <span key={t} className="absolute rounded-full border border-c-line bg-c-surface/80 px-3.5 py-1.5 text-[13px] text-c-fg/85 backdrop-blur" style={{ left: l, top: tp, animation: `float-y ${5 + d}s ease-in-out ${d}s infinite` }}>{t}</span>
      ))}
    </>
  );
}

/* ───────────────────────────── CLAUDE ───────────────────────────── */
const TERM = [
  ["❯ claude", "text-c-fg"], ["✻ build my portfolio site", "text-c-accent"], ["  ⎿ Reading resume.md", "text-c-muted"],
  ["  ⎿ Writing app/page.tsx", "text-c-muted"], ["✓ Portfolio ready", "text-emerald-400"], ["> cold email to a founder", "text-c-fg"], ["✓ Saved outreach/email-01.md", "text-emerald-400"],
] as const;
const STEPS = ["Search", "Apply", "Outreach", "Track", "Interview"];

function ClaudeScene() {
  const t = useTick(900, TERM.length + 3);
  const step = useTick(1500, STEPS.length);
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_75%_90%,rgba(217,119,87,.3),transparent_65%)]" />
      <div className="absolute top-[22%] right-[10%] left-[12%] overflow-hidden rounded-2xl border border-c-line bg-black/45 shadow-2xl backdrop-blur">
        <div className="flex gap-1.5 border-b border-c-line px-4 py-3"><i className="size-2.5 rounded-full bg-[#ff5f57]" /><i className="size-2.5 rounded-full bg-[#febc2e]" /><i className="size-2.5 rounded-full bg-[#28c840]" /></div>
        <div className="min-h-[15rem] p-5 font-mono text-[13px] leading-7">
          {TERM.slice(0, Math.min(t, TERM.length)).map(([x, c], i) => (<motion.p key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={c}>{x}</motion.p>))}
          <p className="caret text-c-accent">❯ </p>
        </div>
      </div>
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: "linear" }} className="absolute top-[11%] left-[41%] size-12 text-c-accent">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>
      </motion.div>
      <div className="absolute right-[8%] bottom-[9%] left-[12%] flex flex-wrap gap-2">
        {STEPS.map((s, i) => (
          <span key={s} className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition-colors duration-500 ${i === step ? "border-c-accent bg-c-accent text-c-on" : "border-c-line bg-c-surface/70 text-c-muted"}`}>{i + 1} · {s}</span>
        ))}
      </div>
    </>
  );
}

/* ───────────────────────────── PYTHON ───────────────────────────── */
const CODE: [string, string][] = [
  ["# 30 classes → 1 real project", "text-[#4d7a52]"], ["class StudySprint:", "text-[#7dff5a]"], ["    def plan(self):", "text-[#8fe3ff]"],
  ["        return sorted(tasks)", "text-[#d8f0d4]"], ["", ""], ["print(StudySprint().plan())", "text-[#ffd479]"],
];

function PythonScene() {
  const t = useTick(800, CODE.length + 4);
  const [bars, setBars] = useState([70, 28, 90, 44, 62, 20, 84, 36, 55, 12]);
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setBars((b) => {
        const x = [...b]; const k = i;
        if (k >= x.length - 1) { setI(0); return x.every((v, j) => !j || x[j - 1] <= v) ? [70, 28, 90, 44, 62, 20, 84, 36, 55, 12] : x; }
        if (x[k] > x[k + 1]) [x[k], x[k + 1]] = [x[k + 1], x[k]];
        setI(k + 1); return x;
      });
    }, 320);
    return () => clearInterval(id);
  }, [i]);
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(65%_60%_at_25%_95%,rgba(125,255,90,.22),transparent_65%)]" />
      <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(var(--c-accent)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="absolute top-[21%] right-[10%] left-[11%] overflow-hidden rounded-xl border border-c-line bg-[#070d08]/90 shadow-[0_0_80px_-24px_var(--c-accent)]">
        <div className="flex items-center justify-between border-b border-c-line px-4 py-2.5 font-mono text-xs text-c-muted"><span>main.py</span><span className="rounded bg-c-accent px-2 py-0.5 text-c-on">▶ run</span></div>
        <div className="min-h-[13rem] p-4 font-mono text-[13px] leading-6">
          {CODE.slice(0, Math.min(t, CODE.length)).map(([x, c], k) => (<motion.div key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex"><span className="w-6 shrink-0 text-[#3d5a41]">{k + 1}</span><span className={`whitespace-pre ${c}`}>{x}</span></motion.div>))}
          <span className="caret" />
        </div>
      </div>
      <div className="absolute right-[10%] bottom-[8%] flex h-[26%] items-end gap-1.5">
        {bars.map((h, k) => (<motion.i key={k} layout transition={{ type: "spring", stiffness: 400, damping: 32 }} className="w-4 rounded-t" style={{ height: `${h}%`, background: k === i || k === i + 1 ? "#ffd479" : "var(--c-accent)", opacity: 0.85 }} />))}
      </div>
      {["{ }", "def", "[ ]", "→"].map((x, k) => (<span key={x} className="absolute font-mono text-lg text-c-accent/50" style={{ left: `${10 + k * 9}%`, bottom: `${10 + (k % 2) * 8}%`, animation: `float-y ${5 + k}s ease-in-out ${k * 0.6}s infinite` }}>{x}</span>))}
    </>
  );
}

/* ───────────────────────────── AI STUDY ───────────────────────────── */
const NODES: [string, number, number][] = [["Notes", 24, 36], ["Quiz", 72, 40], ["Maths", 20, 74], ["Plan", 76, 74]];

function StudyScene() {
  const flip = useTick(2600, 2);
  const done = useTick(1300, 5);
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(65%_55%_at_70%_10%,rgba(255,166,61,.3),transparent_65%)]" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full">
        {NODES.map(([n, x, y]) => (<motion.line key={n} x1="50" y1="54" x2={x} y2={y} stroke="var(--c-accent)" strokeOpacity=".5" strokeDasharray="1.4 1.8" strokeWidth=".35" vectorEffect="non-scaling-stroke" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />))}
      </svg>
      <motion.div animate={{ scale: [1, 1.07, 1] }} transition={{ duration: 3.2, repeat: Infinity }} className="absolute top-[54%] left-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-c-accent text-lg font-bold text-c-on shadow-[0_0_70px_-6px_var(--c-accent)]">Topic</motion.div>
      {NODES.map(([n, x, y], k) => (
        <span key={n} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-c-accent/60 bg-c-surface px-4 py-2 text-sm text-c-fg" style={{ left: `${x}%`, top: `${y}%`, animation: `float-y ${5 + k * 0.7}s ease-in-out ${k * 0.5}s infinite` }}>{n}</span>
      ))}
      <motion.div animate={{ rotateX: flip ? 180 : 0 }} transition={{ duration: 0.7 }} style={{ transformStyle: "preserve-3d", perspective: 800 }} className="absolute top-[16%] right-[12%] h-20 w-40">
        <span className="absolute inset-0 grid place-items-center rounded-2xl bg-[#fff3e4] px-3 text-center text-[13px] font-medium text-[#1d0f02] [backface-visibility:hidden]">Area of a circle?</span>
        <span className="absolute inset-0 grid place-items-center rounded-2xl bg-c-accent px-3 text-center text-sm font-semibold text-c-on [backface-visibility:hidden] [transform:rotateX(180deg)]">π × r²</span>
      </motion.div>
      <div className="absolute bottom-[9%] left-[10%] w-44 rounded-2xl border border-c-line bg-c-bg/80 p-4 backdrop-blur">
        <p className="text-[11px] tracking-widest text-c-accent uppercase">Study plan</p>
        {["Maths", "Science", "English", "Revise"].map((x, k) => (
          <p key={x} className="mt-2 flex items-center gap-2 text-[13px]"><span className={`grid size-4 place-items-center rounded border text-[10px] transition-colors duration-500 ${k < done ? "border-c-accent bg-c-accent text-c-on" : "border-c-line"}`}>{k < done ? "✓" : ""}</span>{x}</p>
        ))}
      </div>
    </>
  );
}

const SCENES: Partial<Record<ThemeId, () => React.JSX.Element>> = {
  "ai-income": IncomeScene,
  claude: ClaudeScene,
  python: PythonScene,
  "ai-study": StudyScene,
};
