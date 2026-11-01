# Project: Vedantu Upskilling course-listing website

Read this fully before writing code. Items marked **[TODO]** are unknown: do NOT invent them. Use clearly labelled placeholders and list every placeholder you used at the end.

## 1. Goal
One umbrella website that lists all Vedantu Upskilling courses. Traffic comes from YouTube videos and micro-influencers/creators. The site's job: convince a visitor fast, then send them to the course's checkout. Think course-listing sites like PW Skills.

- Audience: Class 10-12 students, 1st/2nd-year college students, early-career learners in India.
- Mobile-first (most traffic is from YouTube on phones). Fast load, light pages.
- Language: English UI with Hinglish-friendly tone. Course content itself is Hinglish. Telugu/Tamil versions exist for some courses (see catalogue).

## 2. Course catalogue (source of truth for seed data)
Prices are incl. GST. Keep all course data in one file (`/content/courses.json` or similar) so adding a course = adding one entry. No hard-coded course info in components.

| Slug | Course | Price | Key facts |
|---|---|---|---|
| ai-income-mastery | AI Income Mastery | ~₹1,499 [TODO confirm exact] | Best seller (~5,000 buyers). 30 lectures. Hinglish. |
| claude-mastery | Claude Mastery (also pitched as "Claude Mastery for Internships") | [TODO] | Hinglish. [TODO syllabus] |
| python-dsa-mastery | Python + DSA Mastery | Starter ₹999 (Phase 1, 12 classes); Mastery ₹1,499 (all 30 classes, **recommended**) | Teacher: Arshdeep Singh (IIT Bombay alum). Recorded + weekly Saturday doubt class. Hindi/Hinglish; dubbed English, Tamil, Telugu sold separately. Existing page: https://courses.vedantu.com/python-dsa-mastery-harsh-sir/ |
| cpp-dsa | C++ with DSA | [TODO] | 24 lectures (17 C++ + 7 DSA starter), max 40 min each. |
| ai-study-mastery | AI Study Mastery | [TODO, likely ₹999-1,499] | For Class 10-12 + 1st/2nd-year students. Exam-focused AI usage. English. Teacher: [TODO]. Launching soon, so support a "Coming soon / Notify me" state. |
| youtube-mastery | YouTube Mastery | [TODO] | [TODO] |
| video-editing | Video Editing | [TODO] | [TODO] |
| personality-development | Personality Development | [TODO] | Planned Apr/May. "Coming soon" state. |

Each course entry should support: slug, title, short tagline, price(s)/variants, language options, teacher(s), lecture count, duration, syllabus (modules), what-you-get bullets, FAQs, status (live / coming-soon), `checkoutUrl` per variant, thumbnail, preview/intro video (YouTube embed), tags/category.

Note: the Python landing page text is outdated vs. the real plan (real plan = 30 lectures, ~18.5 hours: Python foundations, developer foundations, reliability, data I/O, OOP, DSA basics, APIs, pandas/NumPy/Matplotlib, AI-assisted coding, final project "StudySprint"). Use the real plan for the syllabus.

## 3. Pages
1. **Home**: hero (one-line value prop + CTA), course grid with filters (category, language, price), "best seller" badge, social proof strip [TODO real numbers only], how it works, creator/teacher highlights, FAQ, footer.
2. **Course detail** (`/courses/[slug]`): hero with price + CTA, intro video, what you'll learn, syllabus accordion, teacher card, language/variant selector, FAQs, sticky mobile CTA bar, related courses.
3. **Creator landing** (`/c/[creator-slug]`): same as home or a chosen course, but carries creator attribution (see section 5).
4. **Static pages**: About, Contact/Support, Terms, Privacy, Refund policy [TODO real legal text; leave clearly marked placeholders].
5. **Coming-soon capture**: simple email/phone capture for courses with status = coming-soon. [TODO decide backend; default to a no-backend stub that logs to console + clear TODO.]

## 4. Checkout
Assumption: payments/checkout stay on the existing Vedantu course pages (`courses.vedantu.com/...`). This site only links out via `checkoutUrl`. Do not build a payment flow. **[TODO confirm]**

## 5. Traffic and attribution (important to the business)
- Creators earn a revenue share (60:40) so attribution matters.
- Capture `utm_source`, `utm_medium`, `utm_campaign`, and a `ref` (creator id) from the URL, persist them (cookie/localStorage) and append them to every outbound checkout link. **[TODO confirm the checkout side accepts/reads these params]**
- Support clean creator URLs: `/c/<creator-slug>` that sets `ref=<creator-slug>`.
- Add an analytics layer with events: page_view, course_card_click, cta_click, checkout_click (include course slug + variant + ref), coming_soon_signup. Use a pluggable analytics wrapper (GA4 + Meta Pixel IDs from env vars, no-op if absent).

## 6. Tech
- Next.js (App Router) + TypeScript + Tailwind. Statically generate pages from `/content`. No database needed for v1.
- SEO: per-page metadata, Open Graph images, sitemap, robots, JSON-LD `Course` schema on course pages.
- Accessibility: semantic HTML, alt text, keyboard nav, good contrast.
- Performance: next/image, lazy-load YouTube embeds (click-to-load facade), target Lighthouse mobile 90+.
- Env vars for analytics IDs and site URL. Never hard-code secrets.

## 7. Design direction
- Clean, youthful, trustworthy edtech look. Light theme default. Strong primary CTA colour, large tap targets.
- **Branding:** use neutral placeholder logo/wordmark "Vedantu Upskilling" (text-based). Do NOT copy Vedantu's official logo/assets until approved. **[TODO brand assets and colours]**
- Prices and discounts shown clearly; never invent fake urgency (no fake countdowns, fake "only 3 seats left", or fake reviews/testimonials).

## 8. Hard rules
- No fabricated stats, testimonials, ratings, student counts or teacher credentials. Use only facts in this file. Everything else: `[TODO]` placeholder, visibly marked in the UI during development.
- Domain/hosting not decided. Likely `upskilling.vedantu.com`, **[TODO needs company approval]**. Keep the base URL in an env var.
- Keep it simple: v1 = static site, content in files, links out to checkout.

## 9. Deliverable order
1. Scaffold project + content schema + seed `courses.json` from section 2.
2. Home + course detail pages (mobile-first).
3. Attribution + analytics wrapper + creator landing route.
4. SEO, static pages, coming-soon capture.
5. README: how to add a course, how to add a creator, env vars, deploy steps.
At the end, output a list of all `[TODO]` placeholders still present.
