"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import type { Faq } from "@/content/courses";

/** Accessible, animated FAQ accordion. Themed via CSS variables (falls back to ink/brand). */
export function Accordion({ items, variant = "line" }: { items: Faq[]; variant?: "line" | "mono" | "soft" }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div className="divide-y divide-[var(--c-line,var(--hairline))] border-y border-[var(--c-line,var(--hairline))]">
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-start gap-5 py-5 text-left sm:py-6"
              >
                <span
                  className={`mt-1 w-7 shrink-0 text-xs tabular opacity-50 `}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`flex-1 text-[17px] leading-snug font-medium sm:text-lg ${variant === "soft" ? "font-display" : ""}`}>
                  {f.q}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 135 : 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-current/20 opacity-70 group-hover:opacity-100"
                >
                  <Plus className="size-4" />
                </motion.span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-${i}`}
                  role="region"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-3xl pr-12 pb-6 pl-12 text-[15px] leading-relaxed opacity-75 sm:pl-12">{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
