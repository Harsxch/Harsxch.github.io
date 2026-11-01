"use client";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { getCourse } from "@/content/courses";

const PICK = ["Akshat Raj", "Anil Rane", "Rishabh Bhatt", "Vivek", "Anchal Saroj", "Utkarsh Dubey"];

export function Voices() {
  const all = getCourse("ai-income-mastery")!.reviews.filter((r) => PICK.includes(r.name));
  const [i, setI] = useState(0);
  const r = all[i];
  return (
    <section data-theme="ai-income" className="noise relative overflow-hidden bg-c-bg px-4 py-24 text-c-fg sm:px-6 sm:py-36">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[700px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,181,46,.18),transparent_65%)]" />
      <div className="relative mx-auto max-w-[1100px]">
        <p className="font-mono text-[11px] tracking-[0.2em] text-c-accent uppercase">In their words · AI Income Mastery students</p>
        <div className="mt-8 min-h-[16rem] sm:min-h-[19rem]" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={r.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45 }}
            >
              <p className="font-display text-[clamp(1.8rem,4.4vw,3.6rem)] leading-[1.1]">“{r.text}”</p>
              <footer className="mt-6 text-[15px] text-c-muted">— {r.name}</footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>
        <div role="tablist" aria-label="Student reviews" className="mt-10 flex flex-wrap gap-2">
          {all.map((x, k) => (
            <button
              key={x.name}
              role="tab"
              aria-selected={k === i}
              onClick={() => setI(k)}
              className={`rounded-full border px-4 py-2 text-[13px] transition ${k === i ? "border-c-accent bg-c-accent text-c-on" : "border-c-line text-c-muted hover:text-c-fg"}`}
            >
              {x.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
