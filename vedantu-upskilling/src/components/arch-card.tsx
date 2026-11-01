"use client";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";
import type { Course } from "@/content/courses";
import { TileArt } from "@/components/art/tile-art";
import { setAtmos } from "@/components/atmosphere";
import { PriceBlock } from "@/components/price-block";
import { track } from "@/lib/analytics";
import { dotColor, titleClass } from "@/lib/theme-type";

/**
 * A doorway into a course world. Arched like a window, it tilts toward the pointer, lights its own colour
 * around the edge, and tints the whole page sky while you hover it.
 * Text is always white: the art sits under a dark fade so it reads on every course palette.
 */
export function ArchCard({ course: c, variant = "hero", where }: { course: Course; variant?: "hero" | "listing"; where: string }) {
  const soon = c.status === "coming-soon";
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const ry = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 160, damping: 18 });
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 160, damping: 18 });
  const col = dotColor[c.theme];
  const listing = variant === "listing";

  return (
    <div style={{ perspective: 1000 }} className="group">
      <motion.div
        data-theme={c.theme}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const r = e.currentTarget.getBoundingClientRect();
          mx.set((e.clientX - r.left) / r.width);
          my.set((e.clientY - r.top) / r.height);
        }}
        onPointerEnter={(e) => e.pointerType === "mouse" && setAtmos(col)}
        onPointerLeave={() => { mx.set(0.5); my.set(0.5); setAtmos(null); }}
        className="relative"
      >
        <i aria-hidden className="pointer-events-none absolute -inset-3 -z-10 rounded-t-[999px] rounded-b-[40px] opacity-0 blur-2xl transition duration-700 group-hover:opacity-70" style={{ background: col }} />
        <Link
          href={`/courses/${c.slug}`}
          onClick={() => track("course_card_click", { course: c.slug, where })}
          className={`relative block overflow-hidden rounded-t-[999px] rounded-b-[30px] bg-c-bg text-white ring-1 ring-white/15 transition duration-500 group-hover:ring-white/40 ${listing ? "aspect-[3/4.25]" : "aspect-[3/4.35]"} ${soon ? "saturate-[0.55] group-hover:saturate-100" : ""}`}
        >
          <TileArt theme={c.theme} lift="tall" className="transition duration-700 group-hover:scale-[1.06]" />
          <i aria-hidden className="absolute inset-2.5 rounded-t-[999px] rounded-b-[22px] border border-white/10 transition group-hover:border-white/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className={`absolute inset-x-0 bottom-0 ${listing ? "p-6 sm:p-7" : "p-5 sm:p-6"}`}>
            <div className="mb-2.5 flex items-center gap-2">
              {soon ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-2.5 py-1 text-[10.5px] tracking-[0.16em] uppercase backdrop-blur"><Lock className="size-3" /> Launching soon</span>
              ) : (
                c.badge && <span className="rounded-full px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.14em] text-black uppercase" style={{ background: col }}>{c.badge}</span>
              )}
              {c.audienceTag && <span className="rounded-full border border-white/25 px-2.5 py-1 text-[10.5px] text-white/80">{c.audienceTag}</span>}
            </div>
            <h2 className={`${titleClass[c.theme]} ${listing ? "text-[clamp(1.5rem,2.4vw,2rem)]" : "text-[clamp(1.35rem,1.9vw,1.7rem)]"} leading-[1.05]`}>{c.title}</h2>
            {listing && <p className="mt-2 text-[14px] leading-snug text-white/70">{c.blurb}</p>}
            <div className="mt-3.5 flex items-end justify-between gap-3 text-white">
              <PriceBlock course={c} size={listing ? "md" : "sm"} showLabel={listing} />
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white text-black transition duration-300 group-hover:rotate-45" style={{ background: soon ? undefined : col }}><ArrowUpRight className="size-[18px]" /></span>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
