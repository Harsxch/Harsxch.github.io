"use client";
import { Check, Loader2 } from "lucide-react";
import { useState } from "react";
import type { Course } from "@/content/courses";
import { readAttribution } from "@/lib/attribution";
import { track } from "@/lib/analytics";

const ENDPOINT = process.env.NEXT_PUBLIC_NOTIFY_ENDPOINT;

/**
 * Coming-soon / enrolment-interest capture. Integration-ready: POSTs JSON to NEXT_PUBLIC_NOTIFY_ENDPOINT.
 * With no endpoint configured it says so honestly rather than pretending the sign-up was stored. [TODO] pick backend.
 */
export function NotifyForm({
  course,
  kind = "coming_soon_signup",
  dark = true,
}: {
  course: Course;
  kind?: "coming_soon_signup" | "enrol_interest";
  dark?: boolean;
}) {
  const [state, setState] = useState<"idle" | "busy" | "ok" | "unconfigured" | "error">("idle");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      name: String(f.get("name") ?? ""),
      contact: String(f.get("contact") ?? ""),
      course: course.slug,
      ref: readAttribution().ref,
    };
    track(kind, { course: course.slug });
    if (!ENDPOINT) {
      if (process.env.NODE_ENV !== "production") console.info("[notify] no endpoint configured; payload:", body);
      setState("unconfigured");
      return;
    }
    setState("busy");
    try {
      const r = await fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      setState(r.ok ? "ok" : "error");
    } catch {
      setState("error");
    }
  }

  const field = dark
    ? "border-white/15 bg-white/5 text-white placeholder:text-white/35 focus:border-white/50"
    : "border-black/15 bg-white text-ink placeholder:text-black/35 focus:border-black/50";

  if (state === "ok")
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-emerald-400">
        <Check className="size-4" /> Noted. We&apos;ll reach out when {course.title} opens.
      </p>
    );
  if (state === "unconfigured")
    return (
      <p role="status" className="text-sm opacity-80">
        Sign-ups aren&apos;t switched on yet, so nothing was saved. Please check back soon.
      </p>
    );

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <label className="sr-only" htmlFor={`n-${course.slug}`}>Your name</label>
      <input id={`n-${course.slug}`} name="name" required autoComplete="name" placeholder="Your name"
        className={`h-12 rounded-xl border px-4 text-[15px] outline-none transition ${field}`} />
      <label className="sr-only" htmlFor={`c-${course.slug}`}>Phone or email</label>
      <input id={`c-${course.slug}`} name="contact" required autoComplete="tel" placeholder="Phone or email"
        className={`h-12 rounded-xl border px-4 text-[15px] outline-none transition ${field}`} />
      <button type="submit" disabled={state === "busy"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-c-accent px-6 text-[15px] font-semibold text-c-on transition hover:brightness-110 disabled:opacity-60">
        {state === "busy" ? <Loader2 className="size-4 animate-spin" /> : null}
        {kind === "enrol_interest" ? "Keep me posted" : "Notify me"}
      </button>
      {state === "error" && <p className="text-sm text-red-400 sm:col-span-3">Couldn&apos;t send that. Please try again.</p>}
    </form>
  );
}
