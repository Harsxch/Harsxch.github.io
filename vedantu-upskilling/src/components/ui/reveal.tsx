"use client";
import { motion, type HTMLMotionProps } from "framer-motion";

type Props = HTMLMotionProps<"div"> & { delay?: number; y?: number; once?: boolean };

/** Scroll-triggered fade/rise. Honors reduced motion via MotionConfig. */
export function Reveal({ delay = 0, y = 24, once = true, children, ...rest }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word headline reveal. Pure CSS so the headline paints before JavaScript loads; text stays readable to screen readers. */
export function SplitWords({ text, className, wordClassName = "", delay = 0, as: Tag = "span" }: { text: string; className?: string; wordClassName?: string; delay?: number; as?: "span" | "h1" | "h2" | "h3" }) {
  return (
    <Tag className={className}>
      <span className="sr-only">{text}</span>
      {text.split(" ").map((w, i, a) => (
        <span key={i} aria-hidden>
          <span className="inline-block overflow-hidden pb-[0.12em] align-bottom">
            <span className={`inline-block ${wordClassName}`} style={{ animation: `word-up 0.9s cubic-bezier(0.22,1,0.36,1) ${delay + i * 0.06}s both` }}>{w}</span>
          </span>
          {i < a.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
