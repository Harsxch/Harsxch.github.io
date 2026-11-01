import { ENROLLED } from "@/content/site";

/**
 * Social proof. ENROLLED is a cumulative figure across ALL courses (see content/site.ts).
 * The wording always names "all courses" / "programmes" so it can never read as a per-course number.
 */

/** Understated one-liner for heroes, pricing and CTAs. Inherits colour from its container. */
export function ProofPill({ className = "", text }: { className?: string; text?: string }) {
  return (
    <p className={`inline-flex items-center gap-2 text-[13px] text-c-muted ${className}`}>
      <span aria-hidden className="relative flex size-2">
        <i className="absolute inline-flex size-full animate-ping rounded-full bg-c-accent opacity-50" />
        <i className="relative inline-flex size-2 rounded-full bg-c-accent" />
      </span>
      {text ?? <><b className="font-semibold text-c-fg">{ENROLLED.value}</b> {ENROLLED.short}</>}
    </p>
  );
}

/** Slim band shown right under a course hero. Transparent about the scope of the number. */
export function CourseProof() {
  return (
    <section aria-label="Social proof" className="border-y border-c-line bg-c-surface/40">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-4 text-center text-[14px] text-c-muted sm:px-6">
        <b className="tabular text-[17px] font-semibold text-c-fg">{ENROLLED.value}</b>
        <span>{ENROLLED.label}.</span>
      </div>
    </section>
  );
}

/** Homepage credibility strip. Only the enrolment figure is numeric; the rest is qualitative. */
export function CredibilityStrip() {
  const items = [
    [ENROLLED.value, "students enrolled across all our courses"],
    ["Vedantu", "the learning ecosystem behind every course"],
    ["Practical", "skill-first, project-led learning"],
  ];
  return (
    <section aria-label="Why trust us" className="px-4 sm:px-6">
      <dl className="mx-auto grid max-w-[1100px] divide-y divide-hairline border-y border-hairline sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {items.map(([k, v]) => (
          <div key={k} className="px-2 py-6 text-center sm:px-8 sm:py-8">
            <dt className="font-display tabular text-[clamp(1.9rem,3.4vw,2.6rem)] leading-none">{k}</dt>
            <dd className="mt-2 text-[14px] text-ink-soft">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
