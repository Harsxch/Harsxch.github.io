const ITEMS = [
  "A live portfolio website", "An AI-powered app", "A 10,000+ prompt library", "A recruiter-ready resume",
  "StudySprint, your academic command center", "A personalised study plan", "A data & research project", "A completion certificate",
];

/** Things students walk away with. Every item is taken from a course's own page. */
export function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section aria-label="What you walk away with" className="overflow-hidden border-y border-white/10 bg-navy py-10 text-white sm:py-14">
      <p className="mb-6 px-6 text-center text-[11px] tracking-[0.2em] text-white/50 uppercase">What you walk away with</p>
      <div className="flex w-max gap-12 whitespace-nowrap" style={{ animation: "marquee 48s linear infinite" }}>
        {row.map((t, i) => (
          <span key={i} className="font-display flex items-center gap-12 text-[clamp(1.84rem,3.59vw,2.96rem)]">
            {t} <i className="size-2 rounded-full bg-brand" />
          </span>
        ))}
      </div>
    </section>
  );
}
