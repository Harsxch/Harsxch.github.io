import { type Course, entryPlan, inr, recommendedPlan } from "@/content/courses";

/**
 * Price display for cards. Two-plan courses lead with the recommended price and show the
 * entry price as a clear alternative. Single-plan courses show one price. Coming-soon shows no price.
 */
export function PriceBlock({ course, size = "md", className = "", showLabel = true }: { course: Course; size?: "sm" | "md" | "lg"; className?: string; showLabel?: boolean }) {
  if (course.status === "coming-soon") {
    return <p className={`text-sm font-medium opacity-80 ${className}`}>Launching soon</p>;
  }
  const rec = recommendedPlan(course);
  const ent = entryPlan(course);
  const big = size === "lg" ? "text-[clamp(2.39rem,3.43vw,2.81rem)]" : size === "md" ? "text-[1.9rem]" : "text-[1.55rem]";
  return (
    <div className={className}>
      <p className={`tabular leading-none font-semibold tracking-tight ${big}`}>{inr(rec.price)}</p>
      {ent ? (
        <p className="mt-1.5 text-[13px] text-c-fg/70">
          {showLabel && <span className="mr-1.5 rounded bg-c-accent/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-c-accent uppercase">Recommended</span>}
          or {inr(ent.price)} · {ent.name}
        </p>
      ) : (
        <p className="mt-1.5 text-[13px] text-c-fg/70">incl. GST</p>
      )}
    </div>
  );
}
