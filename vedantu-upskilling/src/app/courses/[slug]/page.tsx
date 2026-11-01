import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courses, getCourse, type ThemeId, type Course } from "@/content/courses";
import { SITE_URL } from "@/lib/site";
import { AiIncomePage } from "@/components/courses/ai-income";
import { ClaudePage } from "@/components/courses/claude";
import { PythonPage } from "@/components/courses/python";
import { AiStudyPage } from "@/components/courses/ai-study";
import { PersonalityPage } from "@/components/courses/personality";
import { VideoPage } from "@/components/courses/video";
import { StickyBar } from "@/components/courses/kit-client";
import { Backdrop } from "@/components/courses/backdrops";

// Each course renders through its OWN page composition. Shared kit only supplies plumbing.
const PAGES: Record<ThemeId, (p: { course: Course }) => React.JSX.Element> = {
  "ai-income": AiIncomePage,
  claude: ClaudePage,
  python: PythonPage,
  "ai-study": AiStudyPage,
  personality: PersonalityPage,
  video: VideoPage,
};

export const dynamicParams = false;
export function generateStaticParams() {
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCourse(slug);
  if (!c) return {};
  const desc = c.status === "live" ? `${c.title}: ${c.blurb}` : `${c.title} is launching soon at Vedantu Upskilling. ${c.blurb}`;
  return {
    title: c.title,
    description: desc,
    alternates: { canonical: `${SITE_URL}/courses/${c.slug}` },
    openGraph: { title: `${c.title} · Vedantu Upskilling`, description: desc, url: `${SITE_URL}/courses/${c.slug}`, type: "website" },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();
  const Page = PAGES[course.theme];

  const ld = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.blurb,
    url: `${SITE_URL}/courses/${course.slug}`,
    provider: { "@type": "Organization", name: "Vedantu", sameAs: "https://www.vedantu.com" },
    ...(course.status === "live"
      ? {
          inLanguage: course.language,
          offers: course.plans.map((p) => ({
            "@type": "Offer", name: p.name, price: p.price, priceCurrency: "INR", category: "Paid",
            url: `${SITE_URL}/courses/${course.slug}#plans`,
          })),
        }
      : {}),
  };

  return (
    <div data-theme={course.theme} className="relative bg-c-bg text-c-fg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <Backdrop theme={course.theme} />
      <div className="relative z-10"><Page course={course} /></div>
      {course.status === "live" && <StickyBar course={course} />}
    </div>
  );
}
