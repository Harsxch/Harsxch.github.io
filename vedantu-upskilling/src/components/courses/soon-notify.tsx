import type { Course } from "@/content/courses";
import { NotifyForm } from "@/components/ui/notify-form";
import { Reveal } from "@/components/ui/reveal";

/** Coming-soon capture. No enrolment, no price: the course isn't open. */
export function SoonNotify({ course, title, titleClass = "font-display" }: { course: Course; title: string; titleClass?: string }) {
  return (
    <section id="notify" className="mx-auto max-w-[1240px] scroll-mt-20 px-4 pb-28 sm:px-6 md:pb-24">
      <Reveal className="relative overflow-hidden rounded-[40px] border border-c-line bg-c-surface p-7 sm:p-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_90%_120%,var(--c-accent),transparent_70%)] opacity-20" />
        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <p className="font-mono text-[11px] tracking-[0.22em] text-c-accent uppercase">Launching soon</p>
            <h2 className={`${titleClass} mt-4 text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.98]`}>{title}</h2>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-c-muted">Curriculum, price and start date will be announced at launch. Leave your details and we&apos;ll tell you first.</p>
          </div>
          <NotifyForm course={course} />
        </div>
      </Reveal>
    </section>
  );
}
