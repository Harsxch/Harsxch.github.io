"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { courses, getCourse } from "@/content/courses";
import { Wordmark } from "./wordmark";

const dot: Record<string, string> = {
  "ai-income": "#ffb52e", claude: "#d97757", python: "#7dff5a",
  "ai-study": "#ffa63d", personality: "#c98bc9", video: "#ff3b30",
};

export function Nav() {
  const path = usePathname();
  const slug = path.startsWith("/courses/") ? path.split("/")[2] : undefined;
  const theme = slug ? getCourse(slug)?.theme : undefined;
  // open state is keyed to the path it was opened on, so navigating closes it without an effect
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const [megaAt, setMegaAt] = useState<string | null>(null);
  const menu = menuAt === path;
  const mega = megaAt === path;
  const setMenu = (v: boolean) => setMenuAt(v ? path : null);
  const setMega = (v: boolean) => setMegaAt(v ? path : null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menu]);

  const dark = !!theme;
  const tone = dark ? "text-c-fg border-c-line" : "text-ink border-black/5";
  const bgTone = dark ? "bg-c-bg/70" : "bg-paper/75";

  return (
    <header
      data-theme={theme}
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500 ${tone} ${
        scrolled ? "" : "border-transparent"
      }`}
    >
      {/* blur lives on its own layer: backdrop-filter on the header would trap the fixed mobile menu inside it */}
      <div aria-hidden className={`absolute inset-0 -z-10 backdrop-blur-xl backdrop-saturate-150 transition-colors duration-500 ${bgTone}`} />
      <nav aria-label="Primary" className="mx-auto flex h-14 max-w-[1240px] items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Vedantu Upskilling home" className="rounded-md">
          <Wordmark />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <div className="relative" onMouseLeave={() => setMega(false)}>
            <button
              type="button"
              aria-expanded={mega}
              aria-haspopup="true"
              onMouseEnter={() => setMega(true)}
              onClick={() => setMega(!mega)}
              className="flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] opacity-80 transition hover:opacity-100"
            >
              Courses <ChevronDown className={`size-3.5 transition ${mega ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {mega && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-1/2 w-[22rem] -translate-x-1/2 pt-3"
                >
                  <ul className="rounded-2xl border border-black/10 bg-[#0d0d0f]/95 p-2 text-white shadow-2xl backdrop-blur-xl">
                    {courses.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/courses/${c.slug}`} className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/10">
                          <span className="size-2.5 rounded-full" style={{ background: dot[c.theme] }} />
                          <span className="flex-1 text-sm">{c.title}</span>
                          {c.status === "coming-soon" && (
                            <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px] tracking-wide text-white/60 uppercase">Soon</span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <Link href="/#why" className="rounded-full px-3.5 py-2 text-[13px] opacity-80 transition hover:opacity-100">Why Vedantu</Link>
          <Link href="/#upcoming" className="rounded-full px-3.5 py-2 text-[13px] opacity-80 transition hover:opacity-100">Upcoming</Link>
          <Link
            href="/courses"
            className="ml-2 rounded-full bg-c-accent px-4 py-2 text-[13px] font-semibold text-c-on transition hover:brightness-105"
          >
            All courses
          </Link>
        </div>

        <button
          type="button"
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          onClick={() => setMenu(!menu)}
          className="grid size-10 place-items-center rounded-full md:hidden"
        >
          {menu ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {menu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 top-14 bottom-0 overflow-y-auto bg-[#0b0b0d] px-6 pt-6 pb-16 text-white md:hidden"
          >
            <p className="font-mono text-[11px] tracking-widest text-white/40 uppercase">Courses</p>
            <ul className="mt-3">
              {courses.map((c, i) => (
                <motion.li key={c.slug} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}>
                  <Link href={`/courses/${c.slug}`} className="flex items-center gap-3 border-b border-white/10 py-4">
                    <span className="size-2.5 rounded-full" style={{ background: dot[c.theme] }} />
                    <span className="font-display text-3xl">{c.title}</span>
                    {c.status === "coming-soon" && <span className="ml-auto text-[10px] tracking-widest text-white/50 uppercase">Soon</span>}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-8 grid gap-3 text-[15px]">
              <Link href="/courses" className="rounded-full bg-[#ff693d] px-5 py-3.5 text-center font-semibold">All courses</Link>
              <Link href="/#why" className="px-2 py-2 text-white/70">Why Vedantu</Link>
              <Link href="/about" className="px-2 py-2 text-white/70">About</Link>
              <Link href="/contact" className="px-2 py-2 text-white/70">Contact</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
