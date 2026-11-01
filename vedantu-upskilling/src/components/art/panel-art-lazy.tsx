"use client";
import dynamic from "next/dynamic";
import { useInView } from "framer-motion";
import { useRef } from "react";
import type { ThemeId } from "@/content/courses";

const Scene = dynamic(() => import("./panel-art").then((m) => m.PanelArt), { ssr: false });

/** Mounts the animated scene only while its panel is near the viewport, so off-screen scenes cost nothing. */
export function PanelArtLazy({ theme }: { theme: ThemeId }) {
  const ref = useRef<HTMLDivElement>(null);
  const on = useInView(ref, { margin: "280px 0px 280px 0px" });
  return <div ref={ref} className="absolute inset-0">{on && <Scene theme={theme} />}</div>;
}
