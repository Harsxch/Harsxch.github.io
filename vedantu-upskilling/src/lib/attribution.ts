"use client";
/**
 * Creator / campaign attribution. Captures utm_* and ref from the URL, persists them
 * (localStorage + cookie, 30 days) and appends them to every outbound checkout link.
 * [TODO] confirm the Vedantu checkout side reads these parameters.
 */
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "ref"] as const;
export type Attribution = Partial<Record<(typeof KEYS)[number], string>>;
const STORE = "vup_attr";
const DAYS = 30;

export function readAttribution(): Attribution {
  try {
    const raw = localStorage.getItem(STORE);
    if (raw) return JSON.parse(raw) as Attribution;
  } catch {}
  return {};
}

export function captureAttribution(extra?: Attribution): Attribution {
  const found: Attribution = { ...extra };
  try {
    const q = new URLSearchParams(window.location.search);
    for (const k of KEYS) {
      const v = q.get(k);
      if (v) found[k] = v.slice(0, 80);
    }
  } catch {}
  const merged = { ...readAttribution(), ...found };
  if (Object.keys(found).length) {
    try {
      localStorage.setItem(STORE, JSON.stringify(merged));
      document.cookie = `${STORE}=${encodeURIComponent(JSON.stringify(merged))}; max-age=${DAYS * 86400}; path=/; SameSite=Lax`;
    } catch {}
  }
  return merged;
}

export function withAttribution(url: string): string {
  try {
    const u = new URL(url);
    const a = readAttribution();
    for (const k of KEYS) if (a[k] && !u.searchParams.has(k)) u.searchParams.set(k, a[k]!);
    return u.toString();
  } catch {
    return url;
  }
}
