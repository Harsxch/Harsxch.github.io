import type { ThemeId } from "@/content/courses";

/** Each course world has its own typographic voice. */
export const titleClass: Record<ThemeId, string> = {
  "ai-income": "font-display tracking-[-0.02em]",
  claude: "font-display tracking-[-0.02em]",
  python: "font-mono font-bold tracking-[-0.04em]",
  "ai-study": "font-soft font-semibold tracking-[-0.03em]",
  personality: "font-display italic tracking-[-0.02em]",
  video: "font-cine uppercase tracking-[0.005em]",
};
export const dotColor: Record<ThemeId, string> = {
  "ai-income": "#ffb52e", claude: "#d97757", python: "#7dff5a",
  "ai-study": "#ffa63d", personality: "#c98bc9", video: "#ff3b30",
};
