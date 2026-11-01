import type { Course } from "@/content/courses";
import { Accordion } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { IncomeHero, IncomeNumbers, IncomePath, PromptStudio, ReviewsWall } from "./ai-income-parts";
import { FinalCta, PhaseMatrix, PlanCards, SectionHead, TeacherCard } from "./kit";

const wrap = "mx-auto max-w-[1240px] px-4 sm:px-6";

export function AiIncomePage({ course }: { course: Course }) {
  return (
    <>
      <IncomeHero course={course} />
      <IncomeNumbers stats={course.stats!} />
      <IncomePath course={course} />

      <section className={`${wrap} py-24 sm:py-36`}><PromptStudio /></section>

      <section id="plans" className={`${wrap} scroll-mt-20 py-20 sm:py-32`}>
        <SectionHead eyebrow="Choose your batch" title={<>Two ways in. <span className="text-c-accent italic">One</span> goes all the way.</>} lead="Batch only covers learning and practice. The full batch adds live doubts, projects, a job-ready profile and the earning phase." />
        <div className="mt-14"><PlanCards course={course} /></div>
        <Reveal className="mt-14"><h3 className="font-display mb-6 text-3xl">Compare plans and features</h3><PhaseMatrix course={course} /></Reveal>
        <p className="mt-6 text-[15px] text-c-muted"><b className="text-c-fg">Who can join?</b> {course.whoCanJoin}</p>
      </section>

      <section className="border-y border-c-line bg-c-surface/40 py-24 sm:py-32">
        <div className={wrap}>
          <SectionHead eyebrow="Student reviews" title={<>What learners <span className="text-c-accent italic">built</span> with it.</>} lead="Real messages from students of this batch." />
        </div>
        <div className="mt-12"><ReviewsWall course={course} /></div>
      </section>

      <section className={`${wrap} py-24 sm:py-32`}>
        <SectionHead eyebrow="Your teacher" title="Learn from Harsh Priyam." />
        <div className="mt-10"><TeacherCard course={course} /></div>
      </section>

      <section className={`${wrap} grid gap-12 py-12 sm:py-24 lg:grid-cols-[0.7fr_1.3fr]`}>
        <SectionHead eyebrow="FAQ" title="Questions, answered." />
        <Accordion items={course.faqs} />
      </section>

      <section className={`${wrap} pb-28 md:pb-24`}><FinalCta course={course} line="Make AI pay you back." /></section>
    </>
  );
}
