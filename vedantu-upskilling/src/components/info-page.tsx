import { DevTodo } from "@/components/ui/dev-todo";

export function InfoPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[860px] px-4 pt-28 pb-24 sm:px-6 sm:pt-36">
      <p className="font-mono text-[11px] tracking-[0.2em] text-brand uppercase">{eyebrow}</p>
      <h1 className="font-display mt-4 text-[clamp(2.8rem,7vw,5.4rem)] leading-[0.95]">{title}</h1>
      <div className="mt-10 space-y-5 text-[16.5px] leading-relaxed text-ink-soft">{children}</div>
      <p className="mt-10"><DevTodo>replace with approved legal / company copy</DevTodo></p>
    </div>
  );
}
