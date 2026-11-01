"use client";
import { ArrowUpRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { type Course, type Plan, inr } from "@/content/courses";
import { withAttribution } from "@/lib/attribution";
import { track } from "@/lib/analytics";
import { NotifyForm } from "./notify-form";

type Props = {
  course: Course;
  plan?: Plan;
  label?: string;
  className?: string;
  children?: React.ReactNode;
  /** where the click came from, for analytics */
  where?: string;
};

/**
 * The one enrol button. If the plan has a checkoutUrl it links out (with creator/UTM params appended).
 * If checkout isn't connected yet it opens an honest dialog instead of pretending to take payment.
 */
export function EnrolButton({ course, plan, label, className = "", children, where = "cta" }: Props) {
  const p = plan ?? course.plans.find((x) => x.recommended) ?? course.plans[0];
  const [open, setOpen] = useState(false);
  // Attribution lives in the browser, so it is appended to the link just before it can be used
  // (hover, focus, touch, click), never during SSR.
  const stamp = (e: React.SyntheticEvent<HTMLAnchorElement>) => {
    if (p?.checkoutUrl) e.currentTarget.href = withAttribution(p.checkoutUrl);
  };
  const text = children ?? label ?? course.ctaLabel;

  if (course.status === "coming-soon") {
    return (
      <a
        href="#notify"
        onClick={() => track("cta_click", { course: course.slug, where })}
        className={className}
      >
        {text}
      </a>
    );
  }

  if (p?.checkoutUrl) {
    return (
      <a
        href={p.checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={stamp}
        onFocus={stamp}
        onTouchStart={stamp}
        onClick={(e) => {
          stamp(e);
          track("checkout_click", { course: course.slug, variant: p.id, where });
        }}
        className={className}
      >
        {text}
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          track("cta_click", { course: course.slug, variant: p?.id, where });
          setOpen(true);
        }}
        className={className}
      >
        {text}
      </button>
      {open && <PendingDialog course={course} plan={p} onClose={() => setOpen(false)} />}
    </>
  );
}

function PendingDialog({ course, plan, onClose }: { course: Course; plan?: Plan; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    const onCancel = () => onClose();
    d?.addEventListener("close", onCancel);
    return () => d?.removeEventListener("close", onCancel);
  }, [onClose]);

  return (
    <dialog
      ref={ref}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(92vw,30rem)] rounded-3xl border border-white/10 bg-[#111] p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] tracking-widest text-white/50 uppercase">Checkout not connected yet</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{course.title}</h2>
            {plan && (
              <p className="mt-1 text-white/60">
                {plan.name} · {inr(plan.price)} incl. GST
              </p>
            )}
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="rounded-full border border-white/15 p-2 hover:bg-white/10">
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          This site hands you over to Vedantu&apos;s checkout, and that link isn&apos;t wired in yet. Leave your details and
          we&apos;ll reach out when enrolment is live.
        </p>
        <div className="mt-5">
          <NotifyForm course={course} kind="enrol_interest" dark />
        </div>
        <p className="mt-4 flex items-center gap-1 text-xs text-white/40">
          <ArrowUpRight className="size-3" /> Integration point: set <code className="font-mono">checkoutUrl</code> in content/courses.ts
        </p>
      </div>
    </dialog>
  );
}
