"use client";
import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/** Persists the creator slug as `ref` so every checkout link carries it. */
export function SetRef({ value }: { value: string }) {
  useEffect(() => {
    captureAttribution({ ref: value.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 60) });
  }, [value]);
  return null;
}
