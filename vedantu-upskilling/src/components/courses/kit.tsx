import { Check, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { type Course, type Plan, entryPlan, inr, recommendedPlan, savePct, upgradeItems } from "@/content/courses";
import { ProofPill } from "@/components/proof";
import { EnrolButton } from "@/components/ui/enrol";
import { DevTodo } from "@/components/ui/dev-todo";
import { Reveal } from "@/components/ui/reveal";
import { CertificateTilt } from "./kit-client";

export function SectionHead({
  eyebrow, title, lead, className = "", titleClass = "font-display",
}: { eyebrow: string; title: React.ReactNode; lead?: string; className?: string; titleClass?: string }) {
  return (
    <Reveal className={`max-w-3xl ${className}`}>
      <p className={`text-[11px] tracking-[0.22em] text-c-accent uppercase`}>{eyebrow}</p>
      <h2 className={`${titleClass} mt-4 text-[clamp(2.02rem,4.06vw,3.43rem)] leading-[0.98]`}>{title}</h2>
      {lead && <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-c-muted">{lead}</p>}
    </Reveal>
  );
}

const includedItems = (c: Course, p: Plan) =>
  c.phases.flatMap((ph) => ph.items.filter((i) => i.plans.includes(p.id)).map((i) => i.label));

/** Per-course pricing treatment: same typography everywhere, identity through colour, edge and motion. */
const FLAVOR: Record<string, { badge: string; radius: string; glow: string; header?: (n: string) => string }> = {
  "ai-income": { badge: "Recommended", radius: "rounded-[32px]", glow: "shadow-[0_0_120px_-30px_#ffb52e]" },
  claude: { badge: "Recommended", radius: "rounded-2xl", glow: "shadow-[0_0_100px_-34px_#d97757]", header: (n) => `claude plan --recommended  # ${n}` },
  python: { badge: "Most recommended", radius: "rounded-xl", glow: "shadow-[0_0_110px_-30px_#7dff5a]", header: (n) => `plan = "${n}"  # recommended` },
  "ai-study": { badge: "All 4 phases", radius: "rounded-[36px]", glow: "shadow-[0_0_110px_-32px_#ffa63d]" },
};

/**
 * Pricing. With two plans the recommended one is larger, lit and leads with exactly what it adds on top of the
 * entry plan (derived from the real phase data, nothing invented). The entry plan stays fully visible and buyable.
 */
export function PlanCards({ course }: { course: Course }) {
  const rec = recommendedPlan(course);
  const ent = entryPlan(course);
  const f = FLAVOR[course.theme] ?? FLAVOR["ai-income"];
  const recPct = savePct(rec);
  const extra = upgradeItems(course);
  const recItems = includedItems(course, rec);
  const entItems = ent ? includedItems(course, ent) : [];
  const SHOW = 7;

  const RecCard = (
    <div id={`plan-${rec.id}`} className={`relative isolate flex flex-col overflow-hidden ${f.radius} border border-c-accent/60 bg-c-surface2 p-7 sm:p-10 ${f.glow} ${ent ? "order-1 md:order-2" : ""}`}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_80%_0%,var(--c-accent),transparent_70%)] opacity-[0.16]" />
      <i className="pointer-events-none absolute inset-y-0 -z-10 w-1/3 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" style={{ animation: "sweep 5s ease-in-out infinite" }} />
      {f.header && <p className="mb-5 -mx-1 rounded-lg bg-black/30 px-3 py-2 font-mono text-[12px] text-c-muted">{f.header(rec.name)}</p>}
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-c-accent px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-c-on uppercase">{ent ? f.badge : "Everything included"}</span>
        {recPct && <span className="rounded-md bg-c-accent/15 px-2 py-1 text-xs font-semibold text-c-accent">Save {recPct}%</span>}
      </div>
      <h3 className="mt-5 text-[22px] font-semibold tracking-tight">{rec.name}</h3>
      {rec.tagline && <p className="mt-1 text-[15px] text-c-muted">{rec.tagline}</p>}
      <div className="mt-6 flex items-end gap-3">
        <span className="tabular text-[clamp(3.6rem,7vw,5.4rem)] leading-[0.9] font-semibold tracking-[-0.045em]">{inr(rec.price)}</span>
        {rec.mrp && <span className="tabular pb-2 text-lg text-c-muted line-through">{inr(rec.mrp)}</span>}
      </div>
      <p className="mt-2 text-xs text-c-muted">incl. GST · one-time · checkout on Vedantu</p>
      <EnrolButton course={course} plan={rec} where="plans" className="mt-7 inline-flex h-14 items-center justify-center rounded-full bg-c-accent px-8 text-base font-semibold text-c-on transition hover:brightness-110">
        {course.ctaLabel} · {inr(rec.price)}
      </EnrolButton>
      <div className="mt-8 border-t border-c-line pt-6">
        {ent && extra.length > 0 ? (
          <>
            <p className="text-[13px] font-semibold tracking-wide text-c-accent uppercase">Everything in {ent.name}, plus {extra.length} more</p>
            <ul className="mt-4 space-y-3 text-[15px]">
              {extra.slice(0, SHOW).map((t) => (<li key={t} className="flex gap-3"><Plus className="mt-0.5 size-4 shrink-0 text-c-accent" /><span className="text-c-fg/95">{t}</span></li>))}
              {extra.length > SHOW && <li className="pl-7 text-c-muted">+ {extra.length - SHOW} more in the comparison below</li>}
            </ul>
          </>
        ) : (
          <ul className="space-y-3 text-[15px]">
            {recItems.slice(0, 8).map((t) => (<li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-c-accent" /><span className="text-c-fg/95">{t}</span></li>))}
            {recItems.length > 8 && <li className="pl-7 text-c-muted">+ {recItems.length - 8} more</li>}
          </ul>
        )}
      </div>
    </div>
  );

  if (!ent) return <div className="max-w-2xl">{RecCard}</div>;

  const EntCard = (
    <div className={`order-2 flex flex-col md:order-1 ${f.radius} border border-c-line bg-c-surface p-7 sm:p-9`}>
      <h3 className="text-lg font-semibold">{ent.name}</h3>
      {ent.tagline && <p className="mt-1 text-sm text-c-muted">{ent.tagline}</p>}
      <div className="mt-6 flex items-end gap-3">
        <span className="tabular text-[clamp(2.4rem,4vw,3.2rem)] leading-none font-semibold tracking-[-0.04em]">{inr(ent.price)}</span>
        {ent.mrp && <span className="tabular pb-1 text-base text-c-muted line-through">{inr(ent.mrp)}</span>}
      </div>
      <p className="mt-1.5 text-xs text-c-muted">incl. GST</p>
      <EnrolButton course={course} plan={ent} where="plans" className="mt-6 inline-flex h-12 items-center justify-center rounded-full border border-c-line bg-c-fg/5 px-6 text-[15px] font-semibold text-c-fg transition hover:bg-c-fg/10">
        {course.ctaLabel} · {inr(ent.price)}
      </EnrolButton>
      <ul className="mt-6 space-y-2.5 border-t border-c-line pt-5 text-[14.5px]">
        {entItems.slice(0, 5).map((t) => (<li key={t} className="flex gap-3"><Check className="mt-0.5 size-4 shrink-0 text-c-muted" /><span className="text-c-fg/85">{t}</span></li>))}
        {entItems.length > 5 && <li className="pl-7 text-c-muted">+ {entItems.length - 5} more</li>}
      </ul>
      {extra.length > 0 && (
        <a href={`#plan-${rec.id}`} className="mt-auto pt-6 text-[14px] font-medium text-c-accent underline-offset-4 hover:underline">
          Want the full journey? {inr(rec.price)} adds {extra.length} more →
        </a>
      )}
    </div>
  );

  return (
    <div>
      <ProofPill className="mb-6" />
      <div className="grid items-stretch gap-5 md:grid-cols-[0.82fr_1.18fr]">
        {EntCard}
        {RecCard}
      </div>
    </div>
  );
}

/** "Compare plans and features" grouped by phase. Fully accessible table. */
export function PhaseMatrix({ course }: { course: Course }) {
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
            <PhaseRows key={ph.n} course={course} ph={ph} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PhaseRows({ course, ph }: { course: Course; ph: Course["phases"][number] }) {
  return (
    <>
      <tr className="border-t border-c-line bg-c-fg/[0.03]">
        <th scope="rowgroup" colSpan={course.plans.length + 1} className="px-6 py-3 text-left text-[13px] font-semibold">
          <span className={`mr-3 text-c-accent`}>PHASE {ph.n}</span>{ph.title}
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
        <p className="text-[11px] tracking-[0.2em] text-c-accent uppercase">Your teacher</p>
        <h3 className="mt-3 text-[clamp(1.66rem,2.65vw,2.18rem)] leading-tight font-semibold tracking-tight">{t.name}</h3>
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
        <p className="text-[11px] tracking-[0.2em] text-c-accent uppercase">Sample certificate</p>
        <h2 className="font-display mt-4 text-[clamp(2.02rem,3.59vw,2.96rem)] leading-[0.98]">Finish it. Frame it.</h2>
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
      <h2 className="font-display relative mx-auto max-w-[16ch] text-[clamp(2.39rem,5.15vw,4.37rem)] leading-[0.95]">{line}</h2>
      <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
        <EnrolButton course={course} plan={p} where="final" className="inline-flex h-14 items-center rounded-full bg-c-accent px-9 text-base font-semibold text-c-on transition hover:brightness-110">
          {course.ctaLabel}{p ? ` · ${inr(p.price)}` : ""}
        </EnrolButton>
      </div>
      <p className="relative mt-5 text-xs text-c-muted">Prices include GST · Checkout on Vedantu</p>
      <ProofPill className="relative mt-3" />
    </div>
  );
}

export function Portrait({ src, alt }: { src: string; alt: string }) {
  return <Image src={src} alt={alt} fill priority sizes="(max-width: 768px) 70vw, 380px" className="object-cover" />;
}
