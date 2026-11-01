"use client";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef } from "react";

const TEXT =
  "Vedantu Upskilling is where students learn the skills class never got to, in Hinglish, through projects, and with a finish line you can put on a resume.";

function Word({ w, range, p }: { w: string; range: [number, number]; p: MotionValue<number> }) {
  const o = useTransform(p, range, [0.14, 1]);
  return <motion.span style={{ opacity: o }} className="inline-block pr-[0.28em]">{w}</motion.span>;
}

export function Statement() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.55"] });
  const words = TEXT.split(" ");
  return (
    <section className="px-4 py-24 sm:px-6 sm:py-40">
      <div ref={ref} className="mx-auto max-w-[1100px]">
        <p className="font-display text-[clamp(1.84rem,4.06vw,3.43rem)] leading-[1.06] text-ink">
          {words.map((w, i) => (
            <Word key={i} w={w} p={scrollYProgress} range={[i / words.length, Math.min(1, (i + 3) / words.length)]} />
          ))}
        </p>
      </div>
    </section>
  );
}
