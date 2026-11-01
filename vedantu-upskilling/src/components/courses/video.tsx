import type { Course } from "@/content/courses";
import { SectionHead } from "./kit";
import { SoonNotify } from "./soon-notify";
import { Scrubber, VideoHero } from "./video-parts";

const wrap = "mx-auto max-w-[1400px] px-4 sm:px-8";

export function VideoPage({ course }: { course: Course }) {
  return (
    <>
      <VideoHero course={course} />
      <section className={`${wrap} py-24 sm:py-36`}>
        <SectionHead titleClass="font-display" eyebrow="The reel" title="Six themes. One timeline." lead="Drag the playhead. These are the themes the course is built around. The full curriculum, teacher, price and start date come at launch." />
        <div className="mt-12"><Scrubber items={course.positioning!} /></div>
      </section>
      <SoonNotify course={course} title="Be in the first cut." titleClass="font-display" />
    </>
  );
}
