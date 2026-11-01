"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import type { ThemeId } from "@/content/courses";

/**
 * Six living backdrops, one per course world. Each is a different SYSTEM, not a different colour:
 *  ai-income  a flow field of income streaming toward a rising point
 *  claude     a blueprint table of sketches, arrows and annotations
 *  python     a graph being walked, one node at a time
 *  ai-study   a student's paper notebook with a highlighter
 *  personality aurora light and a stage spotlight
 *  video      film light-leaks, grain and sprocket-hole edges
 * They are fixed behind the page, so scrolling slides content over a world that stays put.
 */
export function Backdrop({ theme }: { theme: ThemeId }) {
  const Scene = SCENES[theme];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-c-bg">
      <Scene />
    </div>
  );
}

/* ── shared canvas runner: pauses off-screen, respects reduced motion, caps DPR ── */
function Canvas({ init, frame, fade = 0 }: { init: (w: number, h: number) => unknown; frame: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, s: never) => void; fade?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, state: unknown, alive = true;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); w = c.width = innerWidth * d; h = c.height = innerHeight * d; state = init(w, h); };
    const loop = (t: number) => {
      if (!alive) return;
      if (fade) { ctx.globalCompositeOperation = "destination-out"; ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = "source-over"; } else ctx.clearRect(0, 0, w, h);
      frame(ctx, w, h, t, state as never);
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    size(); addEventListener("resize", size); raf = requestAnimationFrame(loop);
    return () => { alive = false; cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, [init, frame, fade]);
  return <canvas ref={ref} className="absolute inset-0 size-full" />;
}

/* ───────────────────────── AI INCOME: flow field ───────────────────────── */
type Flow = { x: number; y: number; a: number; v: number; hot: boolean }[];
const flowInit = (w: number, h: number): Flow => Array.from({ length: 150 }, () => ({ x: Math.random() * w, y: Math.random() * h, a: 0.25 + Math.random() * 0.6, v: 0.5 + Math.random() * 1.4, hot: Math.random() < 0.08 }));
const flowFrame = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, P: Flow) => {
  const k = w / 1400 + 0.5;
  for (const p of P) {
    const ang = -0.62 + Math.sin(p.x * 0.0031 + t * 0.00018) * 0.55 + Math.cos(p.y * 0.0042 - t * 0.00013) * 0.5;
    const nx = p.x + Math.cos(ang) * p.v * k * 1.6, ny = p.y + Math.sin(ang) * p.v * k * 1.6;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(nx, ny);
    ctx.strokeStyle = p.hot ? `rgba(255,236,170,${p.a})` : `rgba(255,${150 + (p.y / h) * 60 | 0},40,${p.a * 0.75})`;
    ctx.lineWidth = (p.hot ? 2.4 : 1.2) * k; ctx.lineCap = "round"; ctx.stroke();
    p.x = nx; p.y = ny;
    if (p.x > w + 20 || p.y < -20 || p.x < -20 || p.y > h + 20) { p.x = Math.random() * w * 0.6; p.y = h * (0.5 + Math.random() * 0.55); }
  }
};
function FlowScene() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(55%_50%_at_88%_8%,rgba(255,181,46,.3),transparent_70%),radial-gradient(45%_45%_at_5%_100%,rgba(255,122,26,.16),transparent_70%)]" />
      <Canvas init={flowInit} frame={flowFrame} fade={0.075} />
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_50%,transparent,rgba(9,7,5,.55))]" />
    </>
  );
}

/* ───────────────────────── PYTHON: a graph being walked ───────────────────────── */
type G = { nodes: { x: number; y: number; d: number }[]; cols: number; rows: number; t0: number; sx: number; sy: number; gap: number };
const graphInit = (w: number, h: number): G => {
  const gap = Math.max(70, w / 18), cols = Math.ceil(w / gap) + 1, rows = Math.ceil(h / gap) + 1;
  const nodes = Array.from({ length: cols * rows }, (_, i) => ({ x: (i % cols) * gap + (Math.sin(i * 12.9) * gap) / 5, y: Math.floor(i / cols) * gap + (Math.cos(i * 7.7) * gap) / 5, d: 0 }));
  return { nodes, cols, rows, t0: 0, sx: Math.floor(cols * 0.7), sy: Math.floor(rows * 0.3), gap };
};
const graphFrame = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, g: G) => {
  const cycle = 9000, local = t % cycle;
  if (local < 40 || g.t0 === 0) { g.t0 = t - local; g.sx = (Math.random() * g.cols) | 0; g.sy = (Math.random() * g.rows) | 0; }
  const r = (local / cycle) * (g.cols + g.rows) * 1.25;
  const lit = (i: number) => { const dx = (i % g.cols) - g.sx, dy = Math.floor(i / g.cols) - g.sy; const d = Math.abs(dx) + Math.abs(dy); return { d, v: Math.exp(-(((d - r) / 2.2) ** 2)) + (d < r ? 0.16 : 0) }; };
  ctx.lineWidth = 1;
  for (let i = 0; i < g.nodes.length; i++) {
    const a = g.nodes[i], { v } = lit(i);
    for (const j of [i + 1, i + g.cols]) {
      if (j >= g.nodes.length || (j === i + 1 && (i + 1) % g.cols === 0)) continue;
      const b = g.nodes[j], vb = lit(j).v, e = Math.max(v, vb);
      ctx.strokeStyle = `rgba(125,255,90,${0.05 + e * 0.5})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
    ctx.beginPath(); ctx.fillStyle = v > 0.6 ? `rgba(220,255,200,${Math.min(1, v)})` : `rgba(125,255,90,${0.12 + v * 0.7})`;
    ctx.arc(a.x, a.y, 2 + v * 4.5, 0, 6.283); ctx.fill();
  }
};
function PythonScene() {
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_20%_100%,rgba(125,255,90,.16),transparent_70%)]" />
      <Canvas init={graphInit} frame={graphFrame} />
      <div className="absolute inset-0 bg-[radial-gradient(85%_70%_at_50%_45%,transparent,rgba(5,8,6,.7))]" />
    </>
  );
}

/* ───────────────────────── CLAUDE: blueprint table ───────────────────────── */
function ClaudeScene() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 3000], [0, -160]);
  const y2 = useTransform(scrollY, [0, 3000], [0, -90]);
  const draw = { stroke: "var(--c-accent)", fill: "none", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeDasharray: "6 7" };
  return (
    <>
      <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_80%_92%,rgba(217,119,87,.24),transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(var(--c-accent)_1px,transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(80%_80%_at_50%_40%,#000,transparent)]" />
      <motion.svg style={{ y: y1 }} viewBox="0 0 400 600" className="absolute top-[6%] -left-[14%] h-[78vh] w-[32vw] min-w-[260px] opacity-40 [mask-image:linear-gradient(90deg,#000_30%,transparent_85%)]">
        <rect x="30" y="40" width="300" height="190" rx="10" {...draw} /><path d="M30 70H330" {...draw} /><circle cx="52" cy="55" r="4" {...draw} /><circle cx="68" cy="55" r="4" {...draw} /><circle cx="84" cy="55" r="4" {...draw} />
        <rect x="52" y="92" width="120" height="14" rx="3" {...draw} /><rect x="52" y="120" width="190" height="9" rx="3" {...draw} /><rect x="52" y="140" width="90" height="62" rx="6" {...draw} /><rect x="156" y="140" width="90" height="62" rx="6" {...draw} />
        <path d="M200 232 C 230 300, 150 330, 190 400" {...draw}><animate attributeName="stroke-dashoffset" from="0" to="-130" dur="9s" repeatCount="indefinite" /></path>
        <path d="M184 392 L190 404 L198 394" {...draw} strokeDasharray="0" />
        <text x="204" y="300" fill="var(--c-accent)" fontSize="13" opacity=".8" fontFamily="var(--font-mono)">prompt → build</text>
        <rect x="70" y="420" width="220" height="110" rx="10" {...draw} /><path d="M92 450h80M92 472h140M92 494h110" {...draw} />
      </motion.svg>
      <motion.svg style={{ y: y2 }} viewBox="0 0 400 600" className="absolute top-[18%] -right-[14%] h-[80vh] w-[32vw] min-w-[260px] opacity-35 [mask-image:linear-gradient(270deg,#000_30%,transparent_85%)]">
        <path d="M60 80 C 150 40, 240 120, 330 70" {...draw}><animate attributeName="stroke-dashoffset" from="0" to="-130" dur="11s" repeatCount="indefinite" /></path>
        <text x="70" y="62" fill="var(--c-accent)" fontSize="13" opacity=".85" fontFamily="var(--font-mono)">idea</text>
        <rect x="80" y="150" width="240" height="150" rx="8" {...draw} /><path d="M80 182H320M130 150V300" {...draw} />
        <text x="96" y="172" fill="var(--c-accent)" fontSize="12" opacity=".8" fontFamily="var(--font-mono)">search · apply · reach out</text>
        <path d="M200 330 L200 400" {...draw} /><path d="M190 392 L200 406 L210 392" {...draw} strokeDasharray="0" />
        <circle cx="200" cy="460" r="46" {...draw} /><path d="M178 462 l16 16 l30 -34" {...draw} strokeDasharray="0" strokeWidth={2.2} />
        <text x="166" y="540" fill="var(--c-accent)" fontSize="13" opacity=".85" fontFamily="var(--font-mono)">shipped</text>
      </motion.svg>
    </>
  );
}

/* ───────────────────────── AI STUDY: the paper notebook ───────────────────────── */
function StudyScene() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 3000], [0, -220]);
  return (
    <>
      <div className="absolute inset-0 [background-image:repeating-linear-gradient(to_bottom,transparent_0_35px,rgba(70,110,160,.17)_35px_36px)]" />
      <div className="absolute inset-y-0 left-[6.5%] w-[2px] bg-[#e0645a]/35 max-sm:left-[4%]" /><div className="absolute inset-y-0 left-[7.2%] w-px bg-[#e0645a]/25 max-sm:left-[4.6%]" />
      <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_85%_0%,rgba(255,170,60,.25),transparent_65%),radial-gradient(60%_50%_at_5%_100%,rgba(212,95,0,.1),transparent_70%)]" />
      <motion.div style={{ y }} className="absolute inset-0">
        {[["8%", "22%", "18vw", -4, 0], ["64%", "46%", "22vw", 3, 1.6], ["18%", "74%", "16vw", -2, 3.1]].map(([l, t, w, r, d], i) => (
          <i key={i} className="absolute h-[22px] rounded-sm bg-[#ffb52e]/45 mix-blend-multiply" style={{ left: String(l), top: String(t), width: String(w), transform: `rotate(${r}deg)`, animation: `float-y ${7 + i}s ease-in-out ${d}s infinite` }} />
        ))}
        {[["88%", "14%", "★"], ["10%", "48%", "a² + b² = c²"], ["80%", "70%", "∑"], ["44%", "88%", "✓ done"], ["70%", "26%", "→ revise"]].map(([l, t, s], i) => (
          <span key={i} className="absolute text-[clamp(1rem,1.8vw,1.6rem)] font-semibold text-[#1b2a38]/20" style={{ left: l, top: t, animation: `float-y ${8 + i}s ease-in-out ${i * 0.9}s infinite`, transform: `rotate(${(i % 2 ? 1 : -1) * (3 + i)}deg)` }}>{s}</span>
        ))}
      </motion.div>
      <div className="noise absolute inset-0 opacity-60" />
    </>
  );
}

/* ───────────────────────── PERSONALITY: aurora + spotlight ───────────────────────── */
function AuroraScene() {
  return (
    <>
      <style>{`@keyframes drift-a{0%,100%{transform:translate(-8%,-4%) scale(1)}50%{transform:translate(10%,8%) scale(1.25)}}@keyframes drift-b{0%,100%{transform:translate(6%,6%) scale(1.15)}50%{transform:translate(-12%,-6%) scale(.9)}}`}</style>
      <i className="absolute -top-[18%] -left-[10%] size-[70vmax] rounded-full bg-[#6d366c]/60 blur-[110px]" style={{ animation: "drift-a 22s ease-in-out infinite" }} />
      <i className="absolute top-[10%] -right-[14%] size-[60vmax] rounded-full bg-[#c98bc9]/30 blur-[120px]" style={{ animation: "drift-b 28s ease-in-out infinite" }} />
      <i className="absolute -bottom-[25%] left-[20%] size-[55vmax] rounded-full bg-[#e8c9a0]/22 blur-[120px]" style={{ animation: "drift-a 34s ease-in-out infinite reverse" }} />
      <div className="absolute inset-x-0 top-0 h-[70vh] bg-[conic-gradient(from_180deg_at_50%_-10%,transparent_35%,rgba(232,201,160,.16)_48%,transparent_52%,rgba(232,201,160,.12)_58%,transparent_66%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_40%,transparent,rgba(21,10,21,.65))]" /><div className="noise absolute inset-0" />
    </>
  );
}

/* ───────────────────────── VIDEO: light leaks and film edges ───────────────────────── */
function FilmScene() {
  return (
    <>
      <style>{`@keyframes leak{0%{transform:translateX(-30%) rotate(8deg);opacity:0}25%,70%{opacity:.9}100%{transform:translateX(130%) rotate(8deg);opacity:0}}`}</style>
      <i className="absolute -top-[20%] left-0 h-[150%] w-[38%] bg-gradient-to-r from-transparent via-[#ff3b30]/35 to-transparent blur-3xl" style={{ animation: "leak 14s ease-in-out infinite" }} />
      <i className="absolute -top-[20%] left-0 h-[150%] w-[30%] bg-gradient-to-r from-transparent via-[#5bd3ff]/25 to-transparent blur-3xl" style={{ animation: "leak 19s ease-in-out 6s infinite" }} />
      {(["left-1.5", "right-1.5"] as const).map((s) => (<i key={s} className={`absolute inset-y-0 ${s} w-4 opacity-[0.22] [background-image:repeating-linear-gradient(to_bottom,#fff_0_14px,transparent_14px_30px)] [mask-image:linear-gradient(90deg,transparent,#000_30%,#000_70%,transparent)] max-sm:hidden`} />))}
      <div className="absolute inset-0 bg-[radial-gradient(90%_75%_at_50%_45%,transparent,rgba(0,0,0,.72))]" />
      <div className="absolute -inset-[50%] opacity-[0.09]" style={{ animation: "grain 0.9s steps(4) infinite", backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")" }} />
    </>
  );
}

const SCENES: Record<ThemeId, () => React.JSX.Element> = {
  "ai-income": FlowScene,
  claude: ClaudeScene,
  python: PythonScene,
  "ai-study": StudyScene,
  personality: AuroraScene,
  video: FilmScene,
};
