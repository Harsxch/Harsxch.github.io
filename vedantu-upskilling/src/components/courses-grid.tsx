"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { courses } from "@/content/courses";
import { ArchCard } from "@/components/arch-card";

const FILTERS = [["all", "All"], ["live", "Live now"], ["coming-soon", "Launching soon"]] as const;

export function CoursesGrid() {
  const [f, setF] = useState<(typeof FILTERS)[number][0]>("all");
  const list = courses.filter((c) => f === "all" || c.status === f);
  return (
    <div>
      <div role="tablist" aria-label="Filter courses" className="flex flex-wrap gap-2">
        {FILTERS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={f === k} onClick={() => setF(k)}
            className={`rounded-full border px-4 py-2 text-[13px] font-medium transition ${f === k ? "border-white bg-white text-black" : "border-white/15 text-ink-soft hover:border-white/40 hover:text-ink"}`}>{l}</button>
        ))}
      </div>
      <motion.div layout className="mt-12 grid gap-x-7 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((c, i) => (
            <motion.div key={c.slug} layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }} className={i % 3 === 1 ? "lg:mt-14" : ""}>
              <ArchCard course={c} variant="listing" where="listing" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
