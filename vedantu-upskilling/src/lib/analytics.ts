"use client";
import { readAttribution } from "./attribution";
/** Pluggable analytics. GA4 + Meta Pixel load only if env IDs exist; otherwise a no-op (debug log in dev). */
export type EventName =
  | "page_view"
  | "course_card_click"
  | "cta_click"
  | "checkout_click"
  | "coming_soon_signup"
  | "enrol_interest";

type W = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };

export function track(name: EventName, props: Record<string, string | number | undefined> = {}) {
  const payload = { ...props, ref: readAttribution().ref };
  const w = window as W;
  try {
    w.gtag?.("event", name, payload);
    w.fbq?.("trackCustom", name, payload);
  } catch {}
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", name, payload);
}
