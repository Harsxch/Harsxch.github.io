"use client";
import { motion, useMotionValue, useSpring, useTransform, useScroll, useMotionValueEvent } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { type Course, inr, topPlan } from "@/content/courses";
import { EnrolButton } from "@/components/ui/enrol";

/** 3D-tilting sample certificate. */
export function CertificateTilt({ src, alt }: { src: string; alt: string }) {
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const rx = useSpring(useTransform(y, [0, 1], [8, -8]), { stiffness: 140, damping: 16 });
  const ry = useSpring(useTransform(x, [0, 1], [-10, 10]), { stiffness: 140, damping: 16 });
  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          x.set((e.clientX - r.left) / r.width);
          y.set((e.clientY - r.top) / r.height);
        }}
        onPointerLeave={() => { x.set(0.5); y.set(0.5); }}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative overflow-hidden rounded-2xl shadow-[0_40px_80px_-30px_rgba(0,0,0,.8)] ring-1 ring-white/10"
      >
        <Image src={src} alt={alt} width={1630} height={1040} sizes="(max-width: 768px) 92vw, 640px" className="h-auto w-full" />
        <motion.i
          style={{ x: useTransform(x, [0, 1], ["-60%", "60%"]) }}
          className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent mix-blend-overlay"
        />
      </motion.div>
    </div>
  );
}

/** Mobile bottom CTA bar. Appears once the hero has scrolled away. */
export function StickyBar({ course }: { course: Course }) {
  const [show, setShow] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setShow(v > 640));
  const p = topPlan(course);
  return (
    <motion.div
      initial={false}
      animate={{ y: show ? 0 : 120, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-c-line bg-c-bg/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl md:hidden"
      aria-hidden={!show}
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] text-c-muted">{course.shortName}{p ? ` · ${p.name}` : ""}</p>
          {p && <p className="tabular text-xl leading-tight font-semibold">{inr(p.price)}</p>}
        </div>
        <EnrolButton course={course} where="sticky" className="shrink-0 rounded-full bg-c-accent px-6 py-3 text-[15px] font-semibold text-c-on">
          {course.status === "live" ? "Enrol now" : "Notify me"}
        </EnrolButton>
      </div>
    </motion.div>
  );
}
