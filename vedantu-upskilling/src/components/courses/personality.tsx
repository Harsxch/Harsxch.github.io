import type { Course } from "@/content/courses";
import { Reveal } from "@/components/ui/reveal";
import { PersonalityHero, Threads } from "./personality-parts";
import { SectionHead } from "./kit";
import { SoonNotify } from "./soon-notify";

const wrap = "mx-auto max-w-[1240px] px-4 sm:px-6";

export function PersonalityPage({ course }: { course: Course }) {
  return (
    <>
      <PersonalityHero course={course} />
      <section className={`${wrap} py-24 sm:py-36`}>
        <SectionHead eyebrow="The themes" title={<>Five things people notice <span className="text-c-accent italic">before</span> you say a word.</>} />
        <div className="mt-14"><Threads items={course.positioning!} /></div>
        <Reveal className="mt-10 max-w-xl text-[15px] leading-relaxed text-c-muted">These are the themes this course is built around. The full curriculum, teacher, price and start date will be announced at launch.</Reveal>
      </section>
      <SoonNotify course={course} title="Be first in the room." />
    </>
  );
}
