import type { ThemeId } from "@/content/courses";

/** Typography is identical for every course (Apple SF system). Identity comes from colour, art and motion. */
export const titleClass: Record<ThemeId, string> = {
  "ai-income": "font-display",
  claude: "font-display",
  python: "font-display",
  "ai-study": "font-display",
  personality: "font-display",
  video: "font-display",
};
export const dotColor: Record<ThemeId, string> = {
  "ai-income": "#ffb52e", claude: "#d97757", python: "#7dff5a",
  "ai-study": "#ffa63d", personality: "#c98bc9", video: "#ff3b30",
};
