import type { Course } from "@/content/courses";
import { Reveal } from "@/components/ui/reveal";
import { DevTodo } from "@/components/ui/dev-todo";
import { Certificate, FinalCta, PhaseMatrix, PlanCards, SectionHead, TeacherCard } from "./kit";
import { CourseProof } from "@/components/proof";
import { DsaPlayground, FileExplorer, PythonHero } from "./python-parts";

const wrap = "mx-auto max-w-[1240px] px-4 sm:px-6";
const mono = "font-bold tracking-[-0.04em]";

export function PythonPage({ course }: { course: Course }) {
  return (
    <>
      <PythonHero course={course} />
      <CourseProof />

      <section className="border-y border-c-line bg-c-surface/50">
        <dl className="mx-auto grid max-w-[1240px] grid-cols-2 sm:px-6 md:grid-cols-4">
          {course.stats!.map((s) => (
            <div key={s.label} className="border-c-line px-5 py-8 md:border-l md:px-8 md:first:border-l-0">
              <dd className="text-3xl font-bold text-c-accent sm:text-4xl">{s.value}</dd>
              <dt className="mt-1 text-xs text-c-muted">{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      <section className={`${wrap} py-24 sm:py-36`}>
        <SectionHead titleClass={mono} eyebrow="01 · the curriculum" title={<>30 classes. <span className="text-c-accent">4 phases.</span></>} lead={`${course.phaseLabel}. Click through the files. Each one is a topic, and the plan it belongs to.`} />
        <div className="mt-12"><FileExplorer course={course} /></div>
      </section>

      <section className={`${wrap} py-12 sm:py-24`}>
        <SectionHead titleClass={mono} eyebrow="02 · phase 2 · solve" title={<>Think in <span className="text-c-accent">algorithms</span>.</>} lead="Searching, sorting, stacks and queues. Play with two of them. (Illustrative demos, not class footage.)" />
        <div className="mt-12"><DsaPlayground /></div>
      </section>

      <section className={`${wrap} py-24 sm:py-32`}>
        <Reveal className="relative overflow-hidden rounded-2xl border border-c-accent/30 bg-[#070d08] p-7 sm:p-12">
          <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(125,255,90,.25),transparent_65%)]" />
          <p className="text-xs tracking-widest text-c-accent uppercase">03 · phase 4 · showcase</p>
          <h2 className="mt-5 max-w-[16ch] text-[clamp(1.84rem,3.74vw,3.12rem)] leading-[1.02] font-bold tracking-[-0.04em]">Project: <span className="text-c-accent">StudySprint</span></h2>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-c-fg/80">Build your academic command center, the final project of the course.</p>
          <p className="mt-8 font-mono text-sm text-c-muted"><span className="text-c-accent">$</span> python studysprint.py<span className="caret" /></p>
        </Reveal>
      </section>

      <section id="plans" className={`${wrap} scroll-mt-20 py-12 sm:py-24`}>
        <SectionHead titleClass={mono} eyebrow="04 · plans" title={<>Pick your <span className="text-c-accent">build</span>.</>} />
        <div className="mt-12"><PlanCards course={course} /></div>
        <div className="mt-14"><h3 className={`${mono} mb-6 text-2xl`}>Compare plans and features</h3><PhaseMatrix course={course} /></div>
        <p className="mt-6 text-[14px] text-c-muted"><b className="text-c-fg">Who can join?</b> {course.whoCanJoin}</p>
        <p className="mt-2 text-sm text-c-muted">{course.language} · weekly Saturday doubt class · {course.languageNote}</p>
      </section>

      <section className={`${wrap} py-24 sm:py-32`}><TeacherCard course={course} /></section>
      <section className={`${wrap} py-12 sm:py-20`}><Certificate course={course} /></section>
      <section className={`${wrap} pb-4`}>{course.faqs.length === 0 && <DevTodo>FAQs not provided for Python + DSA Mastery</DevTodo>}</section>

      <section className={`${wrap} pt-12 pb-28 md:pb-24`}><FinalCta course={course} line="print('Hello, career.')" /></section>
    </>
  );
}
