# Vedantu Upskilling (vedantuskillacademy.com)

Umbrella site listing Vedantu Upskilling courses. Next.js 16 (App Router) · TypeScript · Tailwind 4 · Framer Motion.
Static site: content lives in files, checkout stays on Vedantu's existing pages (this site only links out).
This app is self-contained in `vedantu-upskilling/` and does not touch the influencer-platform app at the repo root.

```bash
cd vedantu-upskilling
npm install
npm run dev        # http://localhost:3100
npm run build && npm run start
npm run lint && npm run typecheck
```

## Routes
`/` · `/courses` · `/courses/{ai-income-mastery, claude-mastery, python-mastery, ai-study-mastery, personality-development, video-editing}` ·
`/c/<creator>` (creator landing, sets `ref`) · `/about /contact /refund /terms /privacy` · `sitemap.xml` · `robots.txt` · per-course OG image.

## Where things live
- `src/content/courses.ts` is the single source of truth for every course (plans, phases, FAQs, teachers, reviews, checkout URLs).
  Anything unknown is left out and shows a yellow **TODO** chip in development only (never in production).
- `src/components/courses/<course>.tsx` + `<course>-parts.tsx`: each course has its OWN page composition and bespoke interactive pieces.
  `kit.tsx` only holds plumbing shared by all (plan cards, compare table, teacher card, certificate, final CTA).
- `src/app/globals.css`: brand tokens (Vedantu orange `#FF693D`, navy `#01202B`) and the six per-course colour themes (`[data-theme=…]`).
- `src/lib/attribution.ts`, `analytics.ts`: creator/UTM capture and pluggable analytics.

## Pricing, proof and typography
- **Prices:** edit `plans` in `src/content/courses.ts` (`price`, `mrp`, `recommended`, `checkoutUrl`). The recommended plan gets the visual lead everywhere (cards, pricing sections, sticky bar, CTAs); the entry plan stays visible and buyable. "Everything in X, plus N more" is computed from the phase data, so nothing is hand-written.
- **Social proof:** the 7,200+ enrolment figure lives in `src/content/site.ts` (`ENROLLED`). It is cumulative across ALL courses and every mention says so. Do not add per-course counts.
- **Typography:** one Apple system for the whole site: SF Pro Display for headings, SF Pro Text for everything else, via `-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text"` with Helvetica Neue / Segoe UI / Roboto fallbacks. No font files are bundled or downloaded. SF Mono is used only inside code and terminal illustrations. Course identity comes from colour, artwork and motion, never from a different typeface.

## Add a course
1. Add an entry to `courses` in `src/content/courses.ts` (pick a `theme`).
2. For a new look: add a theme block in `globals.css`, a page component in `src/components/courses/`, and register it in `PAGES` in `src/app/courses/[slug]/page.tsx`, plus `TileArt` artwork in `src/components/art/tile-art.tsx`.
3. Set each plan's `checkoutUrl` to the Vedantu checkout link. While it is `null`, "Enrol" opens an honest "checkout not connected yet" dialog.

## Add a creator
Share `https://<domain>/c/<creator-slug>`. The slug is stored as `ref` (30 days) together with `utm_source/medium/campaign`
and appended to every outbound checkout link. Direct links such as `/?ref=slug&utm_source=youtube` work too.

## Env vars (see `.env.example`)
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_NOTIFY_ENDPOINT`. All optional; analytics is a no-op without IDs.
Events: `page_view`, `course_card_click`, `cta_click`, `checkout_click`, `coming_soon_signup`, `enrol_interest`.

## Deploy
Any Node host (Vercel etc.): root directory `vedantu-upskilling`, build `npm run build`, start `npm run start`, set the env vars above.

## Open [TODO] items (nothing below was invented)
- Checkout URLs are wired for all 7 plans. Confirm the Vedantu checkout reads `utm_*` / `ref` so creator attribution carries through to payment.
- Instructor for AI Income + Claude: named "Harsh Priyam" from the student reviews and photo in the PDF (not explicitly labelled). Confirm, and add bio/credentials.
- Python + AI Study: FAQs. Claude, Python, AI Study: student reviews (none supplied).
- Personality Development + Video Editing: everything (curriculum, teacher, price, language, dates). Pages only use the themes from the brief.
- Strike-through prices (₹3,999 / ₹10,000) are as printed in the PDF; confirm they are valid MRPs before launch.
- Dropped on purpose (policy: no fake urgency): "Limited offer" ribbons. Dropped as stale: the "from 12th September" start date. AI Income "Guaranteed job-ready resume" shown as "Job-ready resume" so it cannot read as a job guarantee.
- AI Study status: PDF shows it live at ₹499, CLAUDE.md says "launching soon". Built as live.
- CLAUDE.md also lists C++ with DSA and YouTube Mastery; the brief asked for six courses, so those are not built (add via `courses.ts`).
- Legal pages (About, Contact, Refund, Terms, Privacy) are placeholders. Brand wordmark is a text placeholder. Final domain. Coming-soon capture backend (`NEXT_PUBLIC_NOTIFY_ENDPOINT`).
