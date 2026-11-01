import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto grid min-h-[70svh] max-w-[1240px] place-content-center px-6 pt-24 text-center">
      <p className="font-mono text-xs tracking-[0.25em] text-brand uppercase">404</p>
      <h1 className="font-display mt-4 text-[clamp(3rem,9vw,7rem)] leading-none">Wrong turn.</h1>
      <p className="mt-4 text-ink-soft">That page doesn&apos;t exist.</p>
      <Link href="/courses" className="mx-auto mt-8 w-fit rounded-full bg-brand px-7 py-3.5 font-semibold text-white">Browse courses</Link>
    </div>
  );
}
