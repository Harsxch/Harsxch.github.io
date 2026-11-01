import { FolderTree } from "lucide-react";
import type { Course } from "@/content/courses";
import { Accordion } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { ClaudeHero, CommitLog, InternshipPipeline } from "./claude-parts";
import { Certificate, FinalCta, PhaseMatrix, PlanCards, SectionHead, TeacherCard } from "./kit";
import { CourseProof } from "@/components/proof";

const wrap = "mx-auto max-w-[1240px] px-4 sm:px-6";
const SHIP = [
  ["portfolio/", "A live portfolio website"],
  ["ai-app/", "An AI-powered app"],
  ["research/", "A data / research project"],
  ["profile/", "A recruiter-ready resume, LinkedIn & GitHub"],
  ["practice/", "Real interview practice"],
];

export function ClaudePage({ course }: { course: Course }) {
  return (
    <>
      <ClaudeHero course={course} />
      <CourseProof />

      <section className="border-y border-c-line bg-c-surface/50">
        <dl className="mx-auto grid max-w-[1240px] grid-cols-2 divide-c-line sm:px-6 md:grid-cols-4 md:divide-x">
          {course.stats!.map((s) => (
            <div key={s.label} className="px-5 py-8 md:px-8">
              <dt className="order-2 mt-1 text-xs text-c-muted">{s.label}</dt>
              <dd className="text-3xl font-semibold text-c-accent sm:text-4xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${wrap} grid gap-12 py-24 sm:py-36 lg:grid-cols-[0.8fr_1.2fr]`}>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHead eyebrow="The curriculum · git log --oneline" title={<>Five commits from <span className="text-c-accent ">zero</span> to hired-ready.</>} lead="Open a phase to see what ships in it. Phases 1–2 are in both batches; 3–5 are in the full batch." />
        </div>
        <CommitLog course={course} />
      </section>

      <section className={`${wrap} py-12 sm:py-24`}>
        <SectionHead eyebrow="Phase 5 · Get internships" title="A pipeline, not a prayer." lead="You learn the search, the applications, the outreach, the tracker and the interview prep, then run them like a system. (Illustration of the five steps.)" />
        <div className="mt-12"><InternshipPipeline /></div>
      </section>

      <section className={`${wrap} py-24 sm:py-32`}>
        <div className="grid gap-10 rounded-[32px] border border-c-line bg-c-surface p-6 sm:p-10 lg:grid-cols-[1fr_1fr]">
          <SectionHead eyebrow="What you'll walk away with" title={<>What you <span className="text-c-accent ">ship</span>.</>} />
          <Reveal>
            <ul className="space-y-1 text-[14px] sm:text-[15px]">
              {SHIP.map(([f, d]) => (
                <li key={f} className="flex items-baseline gap-4 border-b border-c-line py-3.5 last:border-0">
                  <FolderTree className="size-4 shrink-0 translate-y-0.5 text-c-accent" /><span className="w-24 shrink-0 text-c-accent">{f}</span><span className="text-c-fg/85">{d}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-c-muted">No course can guarantee placement. This is the work that improves your odds.</p>
          </Reveal>
        </div>
      </section>

      <section id="plans" className={`${wrap} scroll-mt-20 py-12 sm:py-24`}>
        <SectionHead eyebrow="Plans" title={<>Pick your <span className="text-c-accent ">batch</span>.</>} />
        <div className="mt-12"><PlanCards course={course} /></div>
        <div className="mt-14"><h3 className="font-display mb-6 text-3xl">Compare plans and features</h3><PhaseMatrix course={course} /></div>
        <p className="mt-6 text-[15px] text-c-muted"><b className="text-c-fg">Who can join?</b> {course.whoCanJoin}</p>
      </section>

      <section className={`${wrap} py-24 sm:py-32`}><Certificate course={course} /></section>

      <section className={`${wrap} py-12 sm:py-20`}><TeacherCard course={course} align="right" /></section>

      <section className={`${wrap} grid gap-12 py-24 lg:grid-cols-[0.7fr_1.3fr]`}>
        <SectionHead eyebrow="FAQ" title="Questions, answered." />
        <Accordion items={course.faqs} variant="mono" />
      </section>

      <section className={`${wrap} pb-28 md:pb-24`}><FinalCta course={course} line="Ship something. Then apply." /></section>
    </>
  );
}
