import { Check, Minus } from "lucide-react";
import Image from "next/image";
import { type Course, type Plan, inr, savePct } from "@/content/courses";
import { EnrolButton } from "@/components/ui/enrol";
import { DevTodo } from "@/components/ui/dev-todo";
import { Reveal } from "@/components/ui/reveal";
import { CertificateTilt } from "./kit-client";

export function SectionHead({
  eyebrow, title, lead, className = "", titleClass = "font-display", mono = false,
}: { eyebrow: string; title: React.ReactNode; lead?: string; className?: string; titleClass?: string; mono?: boolean }) {
  return (
    <Reveal className={`max-w-3xl ${className}`}>
      <p className={`text-[11px] tracking-[0.22em] text-c-accent uppercase ${mono ? "font-mono" : "font-mono"}`}>{eyebrow}</p>
      <h2 className={`${titleClass} mt-4 text-[clamp(2.2rem,5.2vw,4.4rem)] leading-[0.98]`}>{title}</h2>
      {lead && <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-c-muted">{lead}</p>}
    </Reveal>
  );
}

const includedItems = (c: Course, p: Plan) =>
  c.phases.flatMap((ph) => ph.items.filter((i) => i.plans.includes(p.id)).map((i) => i.label));

/** Pricing: one card per plan. The recommended plan is lit; the other recedes. */
export function PlanCards({ course, shape = "round" }: { course: Course; shape?: "round" | "square" }) {
  const r = shape === "round" ? "rounded-[28px]" : "rounded-lg";
  return (
    <div className={`grid gap-4 ${course.plans.length > 1 ? "md:grid-cols-2" : "max-w-xl"}`}>
      {course.plans.map((p) => {
        const items = includedItems(course, p);
        const pct = savePct(p);
        return (
          <div key={p.id} className={`relative flex flex-col ${r} border p-7 sm:p-9 ${p.recommended
            ? "border-c-accent/60 bg-c-surface2 shadow-[0_0_80px_-30px_var(--c-accent)]" : "border-c-line bg-c-surface"}`}>
            {p.recommended && course.plans.length > 1 && (
              <span className="absolute -top-3 left-7 rounded-full bg-c-accent px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-c-on uppercase">Recommended</span>
            )}
            <h3 className="text-lg font-semibold">{p.name}</h3>
            {p.tagline && <p className="mt-1 text-sm text-c-muted">{p.tagline}</p>}
            <div className="mt-6 flex items-end gap-3">
              <span className="tabular text-[clamp(2.8rem,5vw,4rem)] leading-none font-semibold tracking-tight">{inr(p.price)}</span>
              {p.mrp && <span className="tabular pb-2 text-base text-c-muted line-through">{inr(p.mrp)}</span>}
              {pct && <span className="mb-2 rounded-md bg-c-accent/15 px-2 py-0.5 text-xs font-semibold text-c-accent">Save {pct}%</span>}
            </div>
            <p className="mt-1 text-xs text-c-muted">incl. GST</p>
            <EnrolButton course={course} plan={p} where="plans"
              className={`mt-7 inline-flex h-13 items-center justify-center rounded-full px-6 text-[15px] font-semibold transition hover:brightness-110 ${p.recommended ? "bg-c-accent text-c-on" : "border border-c-line bg-c-fg/5 text-c-fg"}`}>
              {course.ctaLabel} · {p.name}
            </EnrolButton>
            <ul className="mt-7 space-y-2.5 border-t border-c-line pt-6 text-[14.5px]">
              {items.slice(0, 6).map((t) => (
                <li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-c-accent" /><span className="text-c-fg/90">{t}</span></li>
              ))}
              {items.length > 6 && <li className="pl-7 text-c-muted">+ {items.length - 6} more in the comparison below</li>}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** "Compare plans and features" grouped by phase. Fully accessible table. */
export function PhaseMatrix({ course, mono = false }: { course: Course; mono?: boolean }) {
  const cols = course.plans;
  return (
    <div className="relative overflow-x-auto rounded-3xl border border-c-line bg-c-surface">
      <table className="w-full min-w-[34rem] text-left text-[14.5px]">
        <caption className="sr-only">Compare plans and features for {course.title}</caption>
        <thead>
          <tr className="border-b border-c-line">
            <th scope="col" className="p-5 pl-6 text-xs font-medium tracking-[0.16em] text-c-muted uppercase">{course.phaseLabel}</th>
            {cols.map((p) => (
              <th key={p.id} scope="col" className={`w-32 p-5 text-center text-sm font-semibold ${p.recommended ? "bg-c-accent/10 text-c-accent" : ""}`}>
                {p.name}<br /><span className="tabular text-xs font-normal opacity-70">{inr(p.price)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {course.phases.map((ph) => (
            <PhaseRows key={ph.n} course={course} ph={ph} mono={mono} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhaseRows({ course, ph, mono }: { course: Course; ph: Course["phases"][number]; mono: boolean }) {
  return (
    <>
      <tr className="border-t border-c-line bg-c-fg/[0.03]">
        <th scope="rowgroup" colSpan={course.plans.length + 1} className="px-6 py-3 text-left text-[13px] font-semibold">
          <span className={`mr-3 text-c-accent ${mono ? "font-mono" : "font-mono"}`}>PHASE {ph.n}</span>{ph.title}
        </th>
      </tr>
      {ph.items.map((it) => (
        <tr key={it.label} className="border-t border-c-line/60">
          <th scope="row" className="py-3 pr-4 pl-6 font-normal text-c-fg/90">{it.label}</th>
          {course.plans.map((p) => {
            const yes = it.plans.includes(p.id);
            return (
              <td key={p.id} className={`p-3 text-center ${p.recommended ? "bg-c-accent/[0.06]" : ""}`}>
                {yes ? <Check className="mx-auto size-4 text-c-accent" aria-hidden /> : <Minus className="mx-auto size-4 text-c-muted/50" aria-hidden />}
                <span className="sr-only">{yes ? "Included" : "Not included"}</span>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

export function TeacherCard({ course, align = "left" }: { course: Course; align?: "left" | "right" }) {
  const t = course.teachers[0];
  if (!t) return null;
  return (
    <Reveal className={`grid items-center gap-8 overflow-hidden rounded-[32px] border border-c-line bg-c-surface p-5 sm:p-8 md:grid-cols-[minmax(0,320px)_1fr] ${align === "right" ? "md:[&>*:first-child]:order-2" : ""}`}>
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-c-surface2">
        {t.photo && <Image src={t.photo} alt={t.name} fill sizes="(max-width: 768px) 90vw, 320px" className="object-cover" />}
      </div>
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-c-accent uppercase">Your teacher</p>
        <h3 className="mt-3 text-[clamp(1.8rem,3.4vw,2.8rem)] leading-tight font-semibold tracking-tight">{t.name}</h3>
        {t.role && <p className="mt-1 text-c-muted">{t.role}</p>}
        {t.bullets ? (
          <ul className="mt-6 space-y-3 text-[15px]">
            {t.bullets.map((b) => (
              <li key={b} className="flex gap-3"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-c-accent" /><span className="text-c-fg/90">{b}</span></li>
            ))}
          </ul>
        ) : (
          <p className="mt-5"><DevTodo>teacher bio / credentials not provided</DevTodo></p>
        )}
      </div>
    </Reveal>
  );
}

export function Certificate({ course }: { course: Course }) {
  const c = course.certificate;
  if (!c) return null;
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.15fr]">
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-c-accent uppercase">Sample certificate</p>
        <h2 className="font-display mt-4 text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[0.98]">Finish it. Frame it.</h2>
        <p className="mt-5 max-w-md text-[16px] leading-relaxed text-c-muted">
          A Vedantu certificate of course completion for <strong className="font-medium text-c-fg">{c.label}</strong>.
          {c.note ? ` ${c.note}` : ""}
        </p>
      </div>
      <CertificateTilt src={c.image} alt={`Sample Vedantu certificate of course completion for ${c.label}, presented to ${c.recipient}`} />
    </div>
  );
}

export function FinalCta({ course, line }: { course: Course; line: string }) {
  const p = course.plans.find((x) => x.recommended) ?? course.plans[0];
  return (
    <div className="relative overflow-hidden rounded-[40px] border border-c-line bg-c-surface px-6 py-20 text-center sm:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_50%_130%,var(--c-accent),transparent_70%)] opacity-25" />
      <h2 className="font-display relative mx-auto max-w-[16ch] text-[clamp(2.6rem,6.6vw,5.6rem)] leading-[0.95]">{line}</h2>
      <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
        <EnrolButton course={course} plan={p} where="final" className="inline-flex h-14 items-center rounded-full bg-c-accent px-9 text-base font-semibold text-c-on transition hover:brightness-110">
          {course.ctaLabel}{p ? ` · ${inr(p.price)}` : ""}
        </EnrolButton>
      </div>
      <p className="relative mt-5 text-xs text-c-muted">Prices include GST · Checkout on Vedantu</p>
    </div>
  );
}

export function Portrait({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill priority sizes="(max-width: 768px) 70vw, 380px" className="object-cover" />;
}
