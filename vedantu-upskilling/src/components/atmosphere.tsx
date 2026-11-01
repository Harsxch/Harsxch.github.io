"use client";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * "First Light": the page background is a living sky. Vedantu navy at the top of the page, a sunrise that
 * climbs as you scroll, a tint that follows whichever course world you hover, and embers drifting upward.
 * Course pages bring their own backdrop, so this unmounts there.
 */
export function Atmosphere() {
  const path = usePathname();
  const { scrollYProgress } = useScroll();
  const sunY = useTransform(scrollYProgress, [0, 1], [122, 42]);
  const sunR = useTransform(scrollYProgress, [0, 1], [58, 118]);
  const sun = useMotionTemplate`radial-gradient(${sunR}% ${sunR}% at 50% ${sunY}%, rgba(255,105,61,.62), rgba(255,105,61,.2) 36%, transparent 68%)`;
  if (path.startsWith("/courses/")) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#00141c]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#000c13_0%,#01202b_58%,#03303f_100%)]" />
      <motion.div style={{ background: sun }} className="absolute inset-0" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(60% 55% at 82% 26%, color-mix(in srgb, var(--atmos) 42%, transparent), transparent 70%), radial-gradient(50% 45% at 12% 70%, color-mix(in srgb, var(--atmos) 24%, transparent), transparent 70%)" }} />
      <Embers />
      <div className="noise absolute inset-0" />
    </div>
  );
}

function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, last = 0;
    const low = innerWidth < 700 || (navigator.hardwareConcurrency ?? 8) <= 4;
    const N = low ? 20 : 40;
    // one pre-rendered glow sprite instead of a blurred arc per particle per frame
    const sp = document.createElement("canvas"); sp.width = sp.height = 48;
    const sc = sp.getContext("2d")!; const g = sc.createRadialGradient(24, 24, 0, 24, 24, 24);
    g.addColorStop(0, "rgba(255,190,110,1)"); g.addColorStop(0.25, "rgba(255,120,60,.55)"); g.addColorStop(1, "rgba(255,105,61,0)");
    sc.fillStyle = g; sc.fillRect(0, 0, 48, 48);
    const P = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), s: 0.4 + Math.random() * 1.9, v: 0.012 + Math.random() * 0.03, ph: Math.random() * 6.28, a: 0.25 + Math.random() * 0.6 }));
    const size = () => { const d = low ? 1 : Math.min(window.devicePixelRatio || 1, 1.25); w = c.width = innerWidth * d; h = c.height = innerHeight * d; };
    const draw = (t: number) => {
      if (low && t - last < 30) { raf = requestAnimationFrame(draw); return; }
      const dt = Math.min(64, t - last); last = t;
      ctx.clearRect(0, 0, w, h);
      for (const p of P) {
        p.y -= (p.v * dt) / 1000; p.x += Math.sin(t / 1800 + p.ph) * 0.00022 * dt;
        if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        const tw = 0.55 + 0.45 * Math.sin(t / 700 + p.ph);
        const r = p.s * (w / 1400 + 0.6) * 3.2;
        ctx.globalAlpha = p.a * tw; ctx.drawImage(sp, p.x * w - r, p.y * h - r, r * 2, r * 2);
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    size(); addEventListener("resize", size); raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 size-full" />;
}

/** Tint the whole sky to a world's colour (used on hover). Pass null to return to Vedantu orange. */
export function setAtmos(color: string | null) {
  if (typeof document !== "undefined") document.documentElement.style.setProperty("--atmos", color ?? "#ff693d");
}
