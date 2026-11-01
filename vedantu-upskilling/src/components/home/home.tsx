import { Hero } from "./hero";
import { Statement } from "./statement";
import { CourseStack } from "./course-stack";
import { Why } from "./why";
import { Marquee } from "./marquee";
import { Voices } from "./voices";
import { Upcoming } from "./upcoming";
import { FinalCta } from "./final-cta";

export function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <CourseStack />
      <Why />
      <Marquee />
      <Voices />
      <Upcoming />
      <FinalCta />
    </>
  );
}
