import type { Course } from "@/content/courses";
import { DevTodo } from "@/components/ui/dev-todo";
import { Certificate, FinalCta, PlanCards, SectionHead, TeacherCard } from "./kit";
import { StudyHero, StudyStages, StudyToys } from "./ai-study-parts";

const wrap = "mx-auto max-w-[1240px] px-4 sm:px-6";
const soft = "font-soft font-semibold tracking-[-0.03em]";

export function AiStudyPage({ course }: { course: Course }) {
  return (
    <>
      <StudyHero course={course} />

      <section className={`${wrap} py-24 sm:py-36`}>
        <SectionHead titleClass={soft} eyebrow="Your 4-phase journey · from beginner to pro" title={<>Four stages to <span className="text-c-accent">study smarter</span>.</>} lead="From “what is AI?” to a personalised study plan. Swipe through the stages." />
        <div className="mt-12"><StudyStages course={course} /></div>
      </section>

      <section className={`${wrap} py-12 sm:py-24`}>
        <SectionHead titleClass={soft} eyebrow="Try the idea" title={<>Your notes, <span className="text-c-accent">maps</span> and quizzes. Made by you, with AI.</>} />
        <div className="mt-12"><StudyToys /></div>
      </section>

      <section className={`${wrap} py-24 sm:py-32`}>
        <div className="grid items-center gap-10 rounded-[40px] bg-c-accent p-8 text-c-on sm:p-14 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="font-hand text-3xl opacity-80">Who can join?</p>
            <p className="font-soft mt-3 text-[clamp(1.6rem,3.2vw,2.6rem)] leading-tight font-semibold tracking-[-0.02em]">{course.whoCanJoin}</p>
          </div>
          <div className="rounded-3xl bg-c-on/10 p-6 text-sm leading-relaxed"><b>{course.audienceTag}</b> · {course.language}<br />Easy to understand for beginners. Practical activities and assignments throughout.</div>
        </div>
      </section>

      <section id="plans" className={`${wrap} scroll-mt-20 py-12 sm:py-24`}>
        <SectionHead titleClass={soft} eyebrow="Enrol" title={<>One course. <span className="text-c-accent">All</span> four phases.</>} />
        <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-[minmax(0,34rem)_1fr]">
          <PlanCards course={course} />
          <div className="relative hidden overflow-hidden rounded-[28px] bg-[#fff3e4] p-9 text-[#1d0f02] lg:block">
            <p className="font-hand text-3xl text-[#d4570d]">Everything in one batch</p>
            <ol className="font-soft mt-6 space-y-4 text-[clamp(1.4rem,2.2vw,1.9rem)] leading-tight font-semibold tracking-[-0.02em]">
              {course.phases.map((ph) => (<li key={ph.n} className="flex gap-4"><span className="font-hand text-3xl leading-none text-[#d4570d]">{ph.n}</span>{ph.title}</li>))}
            </ol>
            <p className="mt-8 text-sm opacity-70">{course.audienceTag} · {course.language} · practical activities and assignments</p>
          </div>
        </div>
      </section>

      <section className={`${wrap} py-24 sm:py-32`}><TeacherCard course={course} /></section>
      <section className={`${wrap} py-12 sm:py-20`}><Certificate course={course} /></section>
      <section className={`${wrap} pb-4`}>{course.faqs.length === 0 && <DevTodo>FAQs not provided for AI Study Mastery</DevTodo>}</section>

      <section className={`${wrap} pt-12 pb-28 md:pb-24`}><FinalCta course={course} line="Study smart. Starting today." /></section>
    </>
  );
}
