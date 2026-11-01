import { isDev } from "@/lib/site";

/** Visible only in development: marks content that still needs real data. Never rendered in production. */
export function DevTodo({ children }: { children: React.ReactNode }) {
  if (!isDev) return null;
  return (
    <span className="inline-flex items-center rounded-md border border-dashed border-yellow-400/70 bg-yellow-300/10 px-2 py-0.5 font-mono text-[11px] text-yellow-300">
      TODO · {children}
    </span>
  );
}
