import { Reveal } from "@/components/ui/reveal";

const ROWS = [
  ["Taught the way you actually talk.", "Hinglish teaching, with English-medium options where it helps. Concepts first, jargon second."],
  ["Build it, don't just watch it.", "Portfolio sites, AI apps, data dashboards, a StudySprint command center. Every path ends in something real."],
  ["Learn on your phone.", "The AI Income course is built to work on a phone; if a laptop is needed, the lecture says so up front."],
  ["Finish with proof.", "Completion certificates, graded tests, and a project you can put in front of a recruiter."],
];

export function Why() {
  return (
    <section id="why" className="scroll-mt-20 px-4 py-24 sm:px-6 sm:py-36">
      <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[11px] tracking-[0.2em] text-brand uppercase">Why learn with Vedantu</p>
          <h2 className="font-display mt-5 text-[clamp(2.39rem,4.68vw,3.9rem)] leading-[0.95]">
            Less lecture.<br />More <span className="text-brand ">leverage.</span>
          </h2>
        </div>
        <ol className="divide-y divide-hairline border-y border-hairline">
          {ROWS.map(([t, d], i) => (
            <li key={t}>
              <Reveal delay={i * 0.05} className="grid gap-2 py-7 sm:grid-cols-[3.5rem_1fr] sm:py-9">
                <span className="text-sm text-ink-soft tabular">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-[clamp(1.56rem,2.5vw,2.03rem)] leading-tight">{t}</h3>
                  <p className="mt-2 max-w-xl text-[16px] leading-relaxed text-ink-soft">{d}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
