"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { courses, getCourse } from "@/content/courses";
import { Wordmark } from "./wordmark";

export function Footer() {
  const path = usePathname();
  const slug = path.startsWith("/courses/") ? path.split("/")[2] : undefined;
  const theme = slug ? getCourse(slug)?.theme : undefined;
  return (
    <footer
      data-theme={theme}
      className={`relative border-t ${theme ? "border-c-line bg-c-bg text-c-fg" : "border-white/10 bg-navy text-white"}`}
    >
      <div className="mx-auto max-w-[1240px] px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="font-display mt-6 max-w-xs text-3xl leading-tight opacity-90">Learn skills that move you forward.</p>
          </div>
          <div>
            <h2 className="text-[11px] tracking-widest uppercase opacity-50">Courses</h2>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {courses.map((c) => (
                <li key={c.slug}>
                  <Link href={`/courses/${c.slug}`} className="opacity-75 transition hover:opacity-100">
                    {c.title}
                    {c.status === "coming-soon" && <span className="ml-2 text-[10px] tracking-wider uppercase opacity-60">Soon</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-[11px] tracking-widest uppercase opacity-50">Company</h2>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {[["About", "/about"], ["Contact & support", "/contact"], ["Refund policy", "/refund"], ["Terms", "/terms"], ["Privacy", "/privacy"]].map(([l, h]) => (
                <li key={h}><Link href={h} className="opacity-75 transition hover:opacity-100">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-[11px] tracking-widest uppercase opacity-50">Good to know</h2>
            <p className="mt-4 text-[13px] leading-relaxed opacity-65">
              Prices include GST. Enrolment and payment happen on Vedantu&apos;s checkout. No course can guarantee a job or an internship.
            </p>
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-2 border-t border-current/10 pt-6 text-xs opacity-50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Vedantu Upskilling. All rights reserved.</p>
          <p>vedantuskillacademy.com</p>
        </div>
      </div>
    </footer>
  );
}
