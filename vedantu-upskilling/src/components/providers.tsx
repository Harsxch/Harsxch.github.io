"use client";
import { MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";
import { track } from "@/lib/analytics";

export function Providers({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  useEffect(() => {
    captureAttribution();
    track("page_view", { path });
  }, [path]);
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
