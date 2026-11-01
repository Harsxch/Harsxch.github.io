"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { courses, inr, startPrice } from "@/content/courses";
import { TileArt } from "@/components/art/tile-art";
import { track } from "@/lib/analytics";
import { titleClass } from "@/lib/theme-type";

const FILTERS = [["all", "All"], ["live", "Live now"], ["coming-soon", "Launching soon"]] as const;
// asymmetric bento spans (lg: 6 cols)
const SPAN = ["lg:col-span-4", "lg:col-span-2", "lg:col-span-2", "lg:col-span-4", "lg:col-span-3", "lg:col-span-3"];

export function CoursesGrid() {
  const [f, setF] = useState<(typeof FILTERS)[number][0]>("all");
  const list = courses.filter((c) => f === "all" || c.status === f);
  return (
    <div>
      <div role="tablist" aria-label="Filter courses" className="flex gap-2">
        {FILTERS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)}
            className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${f === k ? "border-ink bg-ink text-white" : "border-black/10 text-ink-soft hover:border-black/30"}`}>
            {l}
          </button>
        ))}
      </div>
      <motion.div layout className="mt-8 grid gap-4 lg:auto-rows-[minmax(460px,auto)] lg:grid-cols-6">
        <AnimatePresence mode="popLayout">
          {list.map((c, i) => {
            const soon = c.status === "coming-soon";
            const big = f === "all" ? SPAN[courses.indexOf(c)] : f === "live" ? SPAN[i] : "lg:col-span-3";
            return (
              <motion.div key={c.slug} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }} className={big}>
                <Link href={`/courses/${c.slug}`} data-theme={c.theme}
                  onClick={() => track("course_card_click", { course: c.slug, where: "listing" })}
                  className="group relative isolate flex h-full min-h-[440px] flex-col justify-end overflow-hidden rounded-[32px] bg-c-bg p-6 text-c-fg ring-1 ring-black/10 sm:p-8">
                  <TileArt theme={c.theme} lift="tall" className="transition duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                  <div className="relative">
                    <div className="mb-3 flex items-center gap-2">
                      {soon ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-c-fg/30 px-3 py-1 text-[11px] tracking-[0.16em] uppercase backdrop-blur"><Lock className="size-3" /> Launching soon</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-c-accent px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-c-on uppercase">
                          <i className="size-1.5 rounded-full bg-c-on" /> {c.badge ?? "Live now"}
                        </span>
                      )}
                      {c.audienceTag && <span className="rounded-full border border-c-fg/25 px-3 py-1 text-[11px] text-c-fg/80">{c.audienceTag}</span>}
                    </div>
                    <h2 className={`${titleClass[c.theme]} text-[clamp(1.9rem,3.6vw,3.2rem)] leading-[0.98] ${c.theme === "python" ? "text-[clamp(1.5rem,2.6vw,2.2rem)]" : ""}`}>{c.title}</h2>
                    <p className="mt-2 max-w-md text-[14.5px] leading-snug text-c-fg/75">{c.blurb}</p>
                    <div className="mt-5 flex items-center justify-between text-sm">
                      <span className="tabular font-medium">{soon ? "Notify me at launch" : `from ${inr(startPrice(c) ?? 0)}`}</span>
                      <span className="grid size-10 place-items-center rounded-full bg-c-fg text-c-bg transition group-hover:rotate-45"><ArrowUpRight className="size-5" /></span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
