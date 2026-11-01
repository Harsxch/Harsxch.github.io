import type { ThemeId } from "@/content/courses";

/**
 * Original, code-drawn artwork for each course world. Pure SVG/CSS, no stock imagery.
 * Rendered absolutely inside a positioned parent; colours come from the surrounding data-theme.
 */
export function TileArt({ theme, className = "", lift = false, big = false }: { theme: ThemeId; className?: string; lift?: boolean | "tall"; big?: boolean }) {
  const Art = ART[theme];
  // lift: keep the art in the upper part of a tile so it never sits under the title.
  // big: the art is drawn for tile size; scale it up when it fills a large panel.
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 overflow-hidden ${lift === "tall" ? "bottom-[48%]" : lift ? "bottom-[34%]" : "bottom-0"} ${className}`}>
      <div className={`relative size-full ${big ? "origin-center scale-[1.18] lg:scale-[1.45]" : ""}`}><Art /></div>
    </div>
  );
}

/* ───────────── AI Income: lit stage, rising revenue curve, orbiting nodes ───────────── */
function Income() {
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="size-full">
      <defs>
        <radialGradient id="inc-glow" cx="70%" cy="85%" r="75%">
          <stop offset="0%" stopColor="#ffb52e" stopOpacity=".55" />
          <stop offset="45%" stopColor="#ff7a1a" stopOpacity=".16" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="inc-line" x1="0" x2="1">
          <stop offset="0" stopColor="#ff7a1a" />
          <stop offset="1" stopColor="#ffd36b" />
        </linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#inc-glow)" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={i} x1="0" x2="400" y1={90 + i * 62} y2={90 + i * 62} stroke="#ffb52e" strokeOpacity=".07" />
      ))}
      <path d="M-10 430 C 70 420, 110 360, 170 330 S 260 250, 300 190 S 370 90, 420 40" fill="none" stroke="url(#inc-line)" strokeWidth="3" strokeLinecap="round" />
      <path d="M-10 430 C 70 420, 110 360, 170 330 S 260 250, 300 190 S 370 90, 420 40 V 520 H -10Z" fill="url(#inc-line)" opacity=".07" />
      {[[170, 330], [300, 190], [378, 82]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="16" fill="#ffb52e" opacity=".14" style={{ transformOrigin: `${x}px ${y}px`, animation: `pulse-ring 3s ${i * 0.8}s infinite` }} />
          <circle cx={x} cy={y} r="5" fill="#ffd36b" />
        </g>
      ))}
      <circle cx="110" cy="150" r="46" fill="none" stroke="#ffb52e" strokeOpacity=".22" strokeDasharray="2 7" />
      <circle cx="110" cy="150" r="72" fill="none" stroke="#ffb52e" strokeOpacity=".12" strokeDasharray="2 9" />
      <circle cx="152" cy="132" r="4" fill="#ffd36b" />
      <circle cx="84" cy="206" r="3" fill="#ff7a1a" />
      <text x="200" y="118" textAnchor="middle" fill="#ffd36b" opacity=".8" fontSize="12" fontFamily="var(--font-mono)">prompt → tool → income</text>
    </svg>
  );
}

/* ───────────── Claude: terminal workspace ───────────── */
function ClaudeArt() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_80%_100%,rgba(217,119,87,.28),transparent_60%)]">
      <div className="absolute top-[25%] right-[9%] left-[12%] rounded-xl border border-[#d97757]/25 bg-black/35 p-3 font-mono text-[10px] leading-5 whitespace-nowrap text-[#f2e8dc]/80 shadow-2xl backdrop-blur">
        <div className="mb-2 flex gap-1.5">
          <i className="size-2 rounded-full bg-[#d97757]" /><i className="size-2 rounded-full bg-[#d97757]/50" /><i className="size-2 rounded-full bg-[#d97757]/25" />
        </div>
        <p><span className="text-[#d97757]">❯</span> claude</p>
        <p className="text-[#e9a07f]">✻ build my portfolio site</p>
        <p className="opacity-60">  ⎿ Writing index.tsx…</p>
        <p className="opacity-60">  ⎿ Added 3 projects</p>
        <p><span className="text-[#d97757]">❯</span> <span className="caret" /></p>
      </div>
      <div className="absolute bottom-[10%] left-[18%] size-14 text-[#d97757]" style={{ animation: "float-y 6s ease-in-out infinite" }}>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></svg>
      </div>
    </div>
  );
}

/* ───────────── Python: syntax-highlighted editor ───────────── */
function PythonArt() {
  const k = "text-[#7dff5a]", f = "text-[#b9f6ff]", s = "text-[#ffd479]", c = "text-white/35";
  return (
    <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_20%_100%,rgba(125,255,90,.2),transparent_60%)]">
      <div className="absolute inset-x-[11%] top-[23%] rounded-xl border border-[#7dff5a]/20 bg-black/50 p-3 font-mono text-[10px] leading-5 whitespace-nowrap shadow-2xl">
        <p className={c}># 30 classes → 1 real project</p>
        <p><span className={k}>def</span> <span className={f}>sort_it</span>(xs):</p>
        <p>&nbsp;&nbsp;<span className={k}>for</span> i <span className={k}>in</span> <span className={f}>range</span>(<span className={f}>len</span>(xs)):</p>
        <p>&nbsp;&nbsp;&nbsp;&nbsp;<span className={k}>if</span> xs[i] &gt; xs[i+<span className={s}>1</span>]:</p>
        <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;xs[i], xs[i+<span className={s}>1</span>] = ...</p>
        <p><span className={k}>print</span>(<span className={s}>&quot;StudySprint&quot;</span>)<span className="caret" /></p>
      </div>
      <div className="absolute right-[10%] bottom-[10%] flex items-end gap-1.5">
        {[28, 52, 36, 70, 44, 60].map((h, i) => (
          <i key={i} className="w-3 rounded-sm bg-[#7dff5a]" style={{ height: h, opacity: 0.35 + i * 0.1 }} />
        ))}
      </div>
    </div>
  );
}

/* ───────────── AI Study: notes, mind map, flashcard ───────────── */
function StudyArt() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(100%_70%_at_75%_0%,rgba(255,166,61,.22),transparent_60%)]">
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="size-full">
        <g stroke="#ffa63d" strokeOpacity=".5" strokeWidth="1.5" fill="none" strokeDasharray="3 5">
          <path d="M200 230 C 168 218, 140 198, 118 178" /><path d="M200 230 C 236 214, 268 192, 290 170" />
          <path d="M200 230 C 140 300, 110 330, 90 380" /><path d="M200 230 C 270 300, 310 320, 340 360" />
        </g>
        <circle cx="200" cy="230" r="34" fill="#ffa63d" /><text x="200" y="236" textAnchor="middle" fontSize="15" fontWeight="700" fill="#1d0f02">Topic</text>
        {[[118, 178, "Notes"], [290, 170, "Quiz"], [96, 372, "Maths"], [330, 352, "Plan"]].map(([x, y, t]) => (
          <g key={String(t)}>
            <rect x={Number(x) - 36} y={Number(y) - 16} width="72" height="32" rx="16" fill="#0e1d26" stroke="#ffa63d" strokeOpacity=".6" />
            <text x={Number(x)} y={Number(y) + 5} textAnchor="middle" fontSize="13" fill="#fff3e4">{t}</text>
          </g>
        ))}
        <g transform="rotate(-6 200 440)"><rect x="110" y="410" width="180" height="64" rx="10" fill="#fff3e4" opacity=".95" />
          <text x="200" y="448" textAnchor="middle" fontSize="22" fontFamily="var(--font-semibold)" fill="#1d0f02">a² + b² = c²  ✓</text></g>
      </svg>
    </div>
  );
}

/* ───────────── Personality: spotlight + waveform + serif glyph ───────────── */
function PersonalityArt() {
  return (
    <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_0%,rgba(232,201,160,.28),transparent_70%)]">
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="size-full">
        <path d="M200 0 L120 330 H280Z" fill="#e8c9a0" opacity=".08" />
        <text x="200" y="300" textAnchor="middle" fontSize="190" fontFamily="var(--font-display)" fill="#e8c9a0" opacity=".9">Aa</text>
        <g stroke="#c98bc9" strokeLinecap="round" strokeWidth="3">
          {Array.from({ length: 27 }).map((_, i) => {
            const h = 8 + Math.abs(Math.sin(i * 0.7) * 38) + (i % 3) * 5;
            return <line key={i} x1={36 + i * 12.5} x2={36 + i * 12.5} y1={400 - h} y2={400 + h} opacity={0.35 + (h / 70) * 0.6} />;
          })}
        </g>
      </svg>
    </div>
  );
}

/* ───────────── Video: timeline, clips, playhead, letterbox ───────────── */
function VideoArt() {
  return (
    <div className="absolute inset-0 bg-black">
      <div className="absolute inset-x-0 top-0 h-[7%] bg-black" /><div className="absolute inset-x-0 bottom-0 h-[7%] bg-black" />
      <div className="absolute inset-x-[7%] top-[13%] h-[34%] rounded-md bg-gradient-to-br from-[#1d2a36] via-[#2b1f2a] to-[#3a1a18]">
        <div className="absolute inset-0 bg-[radial-gradient(60%_80%_at_70%_30%,rgba(255,59,48,.35),transparent_60%)]" />
        <i className="absolute right-3 bottom-3 font-mono text-[10px] text-white/70">00:12:08</i>
      </div>
      <div className="absolute inset-x-[7%] bottom-[12%] space-y-1.5">
        {[[[0, 30, "#5bd3ff"], [34, 24, "#5bd3ff99"], [62, 30, "#5bd3ff"]], [[6, 40, "#ff3b30"], [50, 38, "#ff3b3099"]], [[0, 70, "#ffffff22"], [74, 22, "#ffffff22"]]].map((row, r) => (
          <div key={r} className="relative h-5 rounded bg-white/5">
            {row.map(([l, w, bg], i) => (
              <i key={i} className="absolute top-0 h-5 rounded-sm" style={{ left: `${l}%`, width: `${w}%`, background: String(bg) }} />
            ))}
          </div>
        ))}
        <i className="absolute -top-2 -bottom-2 left-[44%] w-px bg-[#ff3b30]" style={{ boxShadow: "0 0 10px #ff3b30", animation: "float-y 5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

const ART: Record<ThemeId, () => React.JSX.Element> = {
  "ai-income": Income,
  claude: ClaudeArt,
  python: PythonArt,
  "ai-study": StudyArt,
  personality: PersonalityArt,
  video: VideoArt,
};
