import { ImageResponse } from "next/og";
import { courses, getCourse } from "@/content/courses";

export const alt = "Vedantu Upskilling course";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export function generateStaticParams() { return courses.map((c) => ({ slug: c.slug })); }

const PAL: Record<string, [string, string, string]> = {
  "ai-income": ["#090705", "#ffb52e", "#f7efe3"], claude: ["#15110e", "#d97757", "#f2e8dc"],
  python: ["#050806", "#7dff5a", "#eaf6e8"], "ai-study": ["#08131a", "#ffa63d", "#fff3e4"],
  personality: ["#150a15", "#e8c9a0", "#f6ebdd"], video: ["#050506", "#ff3b30", "#f1f1f3"],
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCourse(slug)!;
  const [bg, ac, fg] = PAL[c.theme];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: bg, color: fg, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, position: "relative" }}>
        <div style={{ position: "absolute", right: -120, top: -120, width: 560, height: 560, borderRadius: 999, background: ac, opacity: 0.22, filter: "blur(80px)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, color: ac }}>
          <div style={{ width: 14, height: 14, borderRadius: 999, background: ac }} /> Vedantu Upskilling
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 108, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>{c.title}</div>
          <div style={{ fontSize: 40, marginTop: 20, color: ac }}>{c.status === "coming-soon" ? "Launching soon" : c.tagline}</div>
        </div>
      </div>
    ),
    size,
  );
}
