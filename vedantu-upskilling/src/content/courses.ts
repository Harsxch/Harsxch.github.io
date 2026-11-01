/**
 * SINGLE SOURCE OF TRUTH for every course.
 * Facts come from "Course Images.pdf" and the project CLAUDE.md. Anything not in those
 * sources is `undefined` (hidden in production, flagged as a TODO chip in development).
 * To add a course: add an entry here + a themed page component (see README).
 */

export type ThemeId =
  | "ai-income"
  | "claude"
  | "python"
  | "ai-study"
  | "personality"
  | "video";

export type Plan = {
  id: string;
  name: string;
  tagline?: string;
  price: number; // INR, incl. GST
  mrp?: number; // struck-through price exactly as shown in the source PDF
  recommended?: boolean;
  /** Where "Buy now" goes. null = not connected yet -> honest "checkout pending" dialog. */
  checkoutUrl: string | null;
};

export type PhaseItem = { label: string; plans: string[] };
export type Phase = {
  n: number;
  title: string;
  kicker?: string;
  items: PhaseItem[];
};

export type Teacher = {
  name: string;
  role?: string;
  photo?: string;
  bullets?: string[];
};

export type Review = { name: string; text: string };
export type Faq = { q: string; a: string };

export type Course = {
  slug: string;
  theme: ThemeId;
  title: string;
  shortName: string;
  status: "live" | "coming-soon";
  eyebrow: string;
  tagline: string;
  /** one-line card description */
  blurb: string;
  language: string;
  languageNote?: string;
  audienceTag?: string;
  highlights: string[];
  stats?: { value: string; label: string }[];
  plans: Plan[];
  phases: Phase[];
  phaseLabel?: string; // e.g. "5-phase journey"
  whoCanJoin?: string;
  teachers: Teacher[];
  certificate?: { image: string; recipient: string; label: string; note?: string };
  reviews: Review[];
  faqs: Faq[];
  badge?: string;
  /** About the world of a coming-soon course. Brief positioning only. */
  positioning?: string[];
  lectures?: string;
  ctaLabel: string;
};

const both = (a: string, b: string) => [a, b];

export const courses: Course[] = [
  /* ─────────────────────────── AI INCOME MASTERY ─────────────────────────── */
  {
    slug: "ai-income-mastery",
    theme: "ai-income",
    title: "AI Income Mastery",
    shortName: "AI Income",
    status: "live",
    eyebrow: "Hinglish batch for JEE & college students",
    tagline: "Turn prompts into profit.",
    blurb: "35+ AI tools, a 10,000+ prompt library and 50+ income & career paths, taught in Hinglish.",
    language: "Hinglish",
    badge: "Best seller",
    highlights: [
      "35+ AI tools mastery",
      "10,000+ ready-to-use prompts",
      "50+ income & career opportunities",
      "Certificate on completion",
    ],
    stats: [
      { value: "35+", label: "AI tools" },
      { value: "10,000+", label: "Ready-to-use prompts" },
      { value: "50+", label: "Income & career opportunities" },
      { value: "13+ hrs", label: "Video content" },
    ],
    lectures: "30 lectures",
    plans: [
      {
        id: "batch",
        name: "Batch only",
        tagline: "35+ AI tools",
        price: 999,
        mrp: 3999,
        checkoutUrl: "https://www.vedantu.com/payment/BUNDLE/6ab63b58e3b0d573b8903a1f",
      },
      {
        id: "full",
        name: "Batch + Income Mastery",
        tagline: "Batch + income generation + live doubts",
        price: 1499,
        mrp: 10000,
        recommended: true,
        checkoutUrl: "https://www.vedantu.com/payment/BUNDLE/6ab63752127e5c285b60cdf6",
      },
    ],
    phaseLabel: "5-phase journey · from learning to earning",
    phases: [
      {
        n: 1,
        title: "Learn",
        items: [
          { label: "35+ AI tools mastery", plans: both("batch", "full") },
          { label: "13+ hours of video content", plans: both("batch", "full") },
        ],
      },
      {
        n: 2,
        title: "Practice",
        items: [
          { label: "10,000+ prompt library", plans: both("batch", "full") },
          { label: "Assignments for better clarity", plans: both("batch", "full") },
          { label: "Certification on completion", plans: both("batch", "full") },
          { label: "Exclusive Telegram community", plans: both("batch", "full") },
        ],
      },
      {
        n: 3,
        title: "Apply",
        items: [
          { label: "Live doubt classes", plans: ["full"] },
          { label: "Hands-on AI projects", plans: ["full"] },
          { label: "Project-based learning", plans: ["full"] },
        ],
      },
      {
        n: 4,
        title: "Ready",
        items: [
          { label: "Job-ready resume", plans: ["full"] },
          { label: "LinkedIn optimisation", plans: ["full"] },
          { label: "Future AI updates included", plans: ["full"] },
        ],
      },
      {
        n: 5,
        title: "Earn",
        items: [
          { label: "Income opportunities & platforms discussed", plans: ["full"] },
          { label: "Hiring opportunities for top students through Team Vedantu", plans: ["full"] },
        ],
      },
    ],
    whoCanJoin:
      "JEE aspirants, 11th, 12th, droppers & undergrads. Anyone from Class 11 onwards can start.",
    teachers: [
      {
        name: "Harsh Priyam",
        role: "Instructor",
        photo: "/images/teachers/harsh-priyam-alt.jpg",
        // [TODO] credentials / bio not provided in the PDF
      },
    ],
    reviews: [
      { name: "Akshat Raj", text: "Won 1st place and prize money in an AI Reverse Engineering competition using Gemini, it was a meaningful milestone because it was my first time being recognised for my AI skills. All thanks to this course." },
      { name: "Utkarsh", text: "More than teaching me prompting, your lecture taught me how to think systematically and use AI as a learning partner rather than just a question-answering tool." },
      { name: "khan maaz", text: "When I reached the Prompt Engineering class, I was genuinely amazed… That class completely changed my perspective. I believe I've learned only about 5% of what AI has to offer." },
      { name: "Aditya Srivastava", text: "Your sessions have genuinely changed the way I look at learning AI… your classes gave me the confidence to learn AI the right way and use it productively." },
      { name: "Jiya Jolly", text: "I would like to thank Harsh sir and the Vedantu team for launching this batch and teaching us so nicely." },
      { name: "Shivacharan Bawoor", text: "I am thankful to Harsh Priyam Sir and other teachers, taaki main ab yahan tak pahunch gaya hoon." },
      { name: "Rajan Kumar Gupta", text: "Aapke guidance se inspire hoke maine resume khud design kiya hai." },
      { name: "Rishabh Bhatt", text: "It has increased my confidence in using AI to solve real-world business problems… I can clearly see a big improvement in both the quality of my prompts and the final output." },
      { name: "Anchal Saroj", text: "I created a YouTube Shorts video to educate beginners about content writing as an online earning skill, covering how to build a portfolio and land freelance work." },
      { name: "Yash", text: "Your lessons gave me the confidence to build something that looks and feels like a premium luxury brand… even without coding we can accomplish such a great task." },
      { name: "Utkarsh Dubey", text: "Before this, I did not know how to use ChatGPT. But once I learned, I used it to build my resume." },
      { name: "Vivek", text: "Sir, I can't believe it, first time I generated an AI video, and it's awesome. Total cost was zero, generated on mobile." },
      { name: "Anil Rane", text: "Built a JEE quiz app “without coding” using vibe coding." },
    ],
    faqs: [
      { q: "When will the batch end?", a: "The course spans approximately 6 weeks. The exact completion date remains dynamic, as schedules may shift slightly to ensure the best learning experience." },
      { q: "How many assignments are given per week? From when will assignments start?", a: "Assignments are shared for every session in a drive folder. Inside, you'll find sub-folders categorised by topic, simply look for the assignment carrying the same file name as your session." },
      { q: "Will we have access to all classes throughout the session? Will we get recorded classes after the session ends?", a: "Yes. All lectures are recorded and released daily at 12 PM, with a live doubt-solving session held instead on Saturdays at 7 PM for 2 hours. You'll continue to have access to the complete course, including all recordings, for a full year." },
      { q: "Does the course expire after 30 days, or can it be accessed after that too?", a: "Not at all, your access to the course extends for a full year, well beyond the initial 30 days." },
      { q: "Can I learn effectively using just a phone instead of a laptop?", a: "Yes, the majority of the course is very much doable on a phone. For the few instances where a laptop becomes necessary, this will be clearly flagged during the relevant lecture, so you'll always know in advance." },
      { q: "Are there any recommended/suggested books for the course?", a: "The course is thoughtfully designed to be self-sufficient for your learning journey, so no external books are required. This also reflects the evolving nature of the AI field, where course-led, up-to-date pedagogy serves students better than static reference material." },
      { q: "Will the AI tools used in the course remain free to use?", a: "The course is built around free AI tools wherever possible. On occasions where a paid tool offers meaningful added value, this will be clearly communicated during the relevant class, giving you the choice to opt in." },
      { q: "How does the internship/job opportunity process work, is it provided directly by the instructor/team?", a: "The course equips you with a clear roadmap to start earning through the skills you build. With focused effort, students are well-positioned to secure internships, jobs, or client work. To further support this journey, our team curates and shares a running sheet of relevant opportunities, refreshed periodically as new openings come in." },
      { q: "Can the course/notes be provided in Hindi medium for better understanding?", a: "While the course content is in English, the teaching style is delivered in Hinglish to ensure comfort and clarity. We also incorporate Hindi prompts throughout, helping students build confidence conversing with AI in Hindi as well." },
    ],
    ctaLabel: "Enrol now",
  },

  /* ───────────────────────────── CLAUDE MASTERY ───────────────────────────── */
  {
    slug: "claude-mastery",
    theme: "claude",
    title: "Claude Mastery for Internships",
    shortName: "Claude Mastery",
    status: "live",
    eyebrow: "Hinglish batch for JEE & college students",
    tagline: "Real project. Real portfolio. Real internships.",
    blurb: "38+ video lectures across 5 phases. No coding needed. Build a portfolio, then go after internships.",
    language: "Hinglish",
    highlights: [
      "38+ video lectures across 5 phases",
      "Zero coding experience needed to start",
      "Real internship outreach toolkit",
      "Certificate on completion",
    ],
    stats: [
      { value: "38+", label: "Video lectures" },
      { value: "5", label: "Phases" },
      { value: "30–45 min", label: "Per lecture" },
      { value: "1 year", label: "Access" },
    ],
    lectures: "38+ lectures",
    plans: [
      { id: "batch", name: "Batch only", tagline: "Tools + skill up", price: 999, mrp: 3999, checkoutUrl: "https://www.vedantu.com/payment/BUNDLE/6a9520fcdd5a18279d6498d7" },
      {
        id: "full",
        name: "Batch + Internship Mastery",
        tagline: "Claude Mastery + real project + internships",
        price: 1499,
        mrp: 10000,
        recommended: true,
        checkoutUrl: "https://www.vedantu.com/payment/BUNDLE/6a95216a345c7f79e5cdb570",
      },
    ],
    phaseLabel: "5-phase journey · from learning to earning",
    phases: [
      {
        n: 1,
        title: "Master Claude",
        items: [
          { label: "Master Claude from basics to advanced features", plans: both("batch", "full") },
          { label: "Prompting, Artifacts, Connectors, Plugins & Cowork", plans: both("batch", "full") },
        ],
      },
      {
        n: 2,
        title: "Skill Up",
        items: [
          { label: "Your own AI study system, coding system, data dashboard", plans: both("batch", "full") },
          { label: "Presentations, AI hallucinations & fact-checking Claude's responses", plans: both("batch", "full") },
          { label: "Certificate on completion", plans: both("batch", "full") },
          { label: "Practice assignments & graded tests", plans: both("batch", "full") },
        ],
      },
      {
        n: 3,
        title: "Build Projects",
        items: [
          { label: "Live doubt-clearing sessions", plans: ["full"] },
          { label: "Build real projects with Claude Code", plans: ["full"] },
          { label: "Build a portfolio website + AI mini app", plans: ["full"] },
          { label: "Build data analysis projects", plans: ["full"] },
          { label: "Build agentic AI, ML & RAG projects", plans: ["full"] },
          { label: "Create projects you can actually show recruiters", plans: ["full"] },
        ],
      },
      {
        n: 4,
        title: "Market Ready",
        items: [
          { label: "Build an ATS-friendly resume with Claude", plans: ["full"] },
          { label: "Optimise LinkedIn to be recruiter-ready", plans: ["full"] },
          { label: "Optimise GitHub / portfolio with Claude", plans: ["full"] },
          { label: "Multiple-round interview practice with Claude", plans: ["full"] },
        ],
      },
      {
        n: 5,
        title: "Get Internships",
        items: [
          { label: "Smart internship search & shortlisting", plans: ["full"] },
          { label: "Targeted internship applications", plans: ["full"] },
          { label: "Cold email & LinkedIn outreach", plans: ["full"] },
          { label: "Internship application tracking system", plans: ["full"] },
          { label: "Final interview-cracking preparation", plans: ["full"] },
        ],
      },
    ],
    whoCanJoin:
      "JEE aspirants, 11th, 12th, droppers, B.Tech students & undergrads. Anyone from Class 11 onwards can start. Learn the concepts now, and apply them to internships whenever you're ready, or right away if you find one that fits.",
    teachers: [
      {
        name: "Harsh Priyam",
        role: "Instructor",
        photo: "/images/teachers/harsh-priyam.jpg",
      },
    ],
    certificate: {
      image: "/images/certificates/claude-mastery.jpg",
      recipient: "Harsh Priyam",
      label: "Claude Mastery for Internships",
      note: "Sample certificate. It mentions your consolidated score across the graded tests.",
    },
    reviews: [],
    faqs: [
      { q: "Who can join?", a: "JEE aspirants, 11th, 12th, droppers, B.Tech students & undergrads. Anyone from Class 11 onwards can start. Learn the concepts now, and apply them to internships whenever you're ready, or right away if you find one that fits." },
      { q: "Do I need to know how to code?", a: "No prior programming experience required, Claude does the heavy lifting. A few Skill Up sessions touch basic scripting, but that's as technical as it gets." },
      { q: "What will I actually walk away with?", a: "A live portfolio website, an AI-powered app, and a data/research project. Plus a recruiter-ready resume, LinkedIn, GitHub, and real interview practice." },
      { q: "How long is each lecture?", a: "Approximately 30 to 45 minutes per session (sometimes lesser). Short and focused, built to fit around your college schedule." },
      { q: "When does the course start?", a: "New lectures drop every Saturday, phase by phase. Live doubt sessions follow every Sunday." },
      { q: "What if I miss a live session?", a: "No worries, it moves to the “Past” section as a recording, so you can watch it anytime afterwards." },
      { q: "How long do I have access to the course?", a: "1 year from the date you enrol." },
      { q: "What's the difference between the two batches?", a: "Only Batch = Phases 1–2 (Master Claude + Skill Up), with tests for both. Full Batch = all 5 phases, every test, doubt-clearing sessions and the completion certificate." },
      { q: "Is there a certificate?", a: "Yes, awarded on completing the Full Batch. The certificate mentions your consolidated score on the graded tests." },
      { q: "Do I need a paid Claude subscription?", a: "A free account covers some parts of the course; a few sessions need a paid Claude subscription. Your instructor will flag exactly when." },
      { q: "Is there a refund policy?", a: "No refunds once you've enrolled." },
      { q: "Does this course guarantee me an internship?", a: "No course can guarantee placement. What you get is real projects, a polished profile, and practised outreach, the system that meaningfully improves your odds." },
    ],
    ctaLabel: "Enrol now",
  },

  /* ──────────────────────────── PYTHON + DSA MASTERY ──────────────────────────── */
  {
    slug: "python-mastery",
    theme: "python",
    title: "Python + DSA Mastery",
    shortName: "Python Mastery",
    status: "live",
    eyebrow: "Hinglish batch for college & school students",
    tagline: "From zero to your first real project.",
    blurb: "30 hands-on coding classes. Build real projects, ending with StudySprint, your academic command center.",
    language: "Hinglish",
    // [TODO] confirm current availability of dubbed versions before launch
    languageNote: "Dubbed English, Tamil and Telugu versions are sold separately.",
    highlights: [
      "30 hands-on coding classes",
      "Build real projects",
      "Certificate on completion",
    ],
    stats: [
      { value: "30", label: "Coding classes" },
      { value: "~18.5 hrs", label: "Of teaching" },
      { value: "4", label: "Phases" },
      { value: "Weekly", label: "Saturday doubt class" },
    ],
    lectures: "30 classes",
    plans: [
      {
        id: "beginner",
        name: "Python Beginner",
        tagline: "Python basics · Phase 1 (12 classes)",
        price: 999,
        mrp: 3999,
        checkoutUrl: "https://www.vedantu.com/payment/BUNDLE/6ab0fff176591f6fe5d0dab1",
      },
      {
        id: "mastery",
        name: "Python + DSA Mastery",
        tagline: "Python mastery + industry-ready mentorship · all 30 classes",
        price: 1499,
        mrp: 10000,
        recommended: true,
        checkoutUrl: "https://www.vedantu.com/payment/BUNDLE/6ab0ff5e9735bd3c9897f549",
      },
    ],
    phaseLabel: "4-phase journey · from beginner to pro",
    phases: [
      {
        n: 1,
        title: "Code",
        items: [
          { label: "Python setup & basics", plans: both("beginner", "mastery") },
          { label: "Variables, loops, functions", plans: both("beginner", "mastery") },
          { label: "File handling & OOP", plans: both("beginner", "mastery") },
        ],
      },
      {
        n: 2,
        title: "Solve",
        items: [
          { label: "Assignments", plans: ["mastery"] },
          { label: "Algorithms & problem solving", plans: ["mastery"] },
          { label: "Searching, sorting", plans: ["mastery"] },
          { label: "Stacks, queues", plans: ["mastery"] },
        ],
      },
      {
        n: 3,
        title: "Build",
        items: [
          { label: "Modules & automation", plans: ["mastery"] },
          { label: "APIs & JSON", plans: ["mastery"] },
          { label: "NumPy, Matplotlib", plans: ["mastery"] },
          { label: "Pandas & data analysis", plans: ["mastery"] },
        ],
      },
      {
        n: 4,
        title: "Showcase",
        items: [
          { label: "Industry & 10x developer", plans: ["mastery"] },
          { label: "The modern AI workflow: co-coding with LLMs", plans: ["mastery"] },
          { label: "Project: StudySprint (build your academic command center)", plans: ["mastery"] },
          { label: "From Python learner to software developer", plans: ["mastery"] },
        ],
      },
    ],
    whoCanJoin: "JEE aspirants, 11th, 12th & undergrads. Anyone from Class 11 onwards can start.",
    teachers: [
      {
        name: "Arshdeep Singh",
        role: "Senior Data Scientist, Vedantu",
        photo: "/images/teachers/arshdeep-singh.jpg",
        bullets: [
          "IIT Bombay · All India Rank 41 in JEE Advanced",
          "Former VP of Data Science at List AI, a New York, USA startup",
          "7 years building AI in production",
          "#1 out of 600+ in the MachineHack × Indus Appstore",
          "National Olympian across Physics, Math, Astronomy and Chemistry",
        ],
      },
    ],
    certificate: {
      image: "/images/certificates/python-mastery.jpg",
      recipient: "Harsh Priyam",
      label: "Python & DSA Mastery",
      note: "Sample certificate.",
    },
    reviews: [],
    faqs: [], // [TODO] FAQs not provided for this course
    ctaLabel: "Enrol now",
  },

  /* ───────────────────────────── AI STUDY MASTERY ───────────────────────────── */
  {
    slug: "ai-study-mastery",
    theme: "ai-study",
    title: "AI Study Mastery",
    shortName: "AI Study",
    status: "live", // per PDF (price + Buy Now). CLAUDE.md says "launching soon", [TODO confirm]
    eyebrow: "For students in Grades 8–12 · 100% English",
    tagline: "Turn AI into your personal study partner.",
    blurb: "Step-by-step help for every subject. Notes, mind maps, quizzes and a study plan, built with AI.",
    language: "English",
    audienceTag: "Grades 8–12",
    highlights: [
      "Learn how to use AI for studies",
      "Step-by-step help for all subjects",
      "Practical activities & assignments",
      "Easy to understand for beginners",
    ],
    stats: [
      { value: "4", label: "Phases" },
      { value: "All", label: "Subjects covered" },
      { value: "8–12", label: "Grades" },
    ],
    plans: [
      { id: "main", name: "AI Study Mastery", price: 499, mrp: 10000, recommended: true, checkoutUrl: "https://www.vedantu.com/payment/BUNDLE/6acf2c96c75a433c418d1313" },
    ],
    phaseLabel: "4-phase journey · from beginner to pro",
    phases: [
      {
        n: 1,
        title: "Understand AI",
        kicker: "Learn what AI is and how to use it for studies.",
        items: [
          { label: "Introduction to AI and its tools", plans: ["main"] },
          { label: "How to write good prompts", plans: ["main"] },
          { label: "How to check if an AI answer is correct", plans: ["main"] },
        ],
      },
      {
        n: 2,
        title: "Build Your AI Study Partner",
        kicker: "Create your own AI tools for doubts, revision and practice.",
        items: [
          { label: "Doubt-solving tool (step-by-step help)", plans: ["main"] },
          { label: "Notes maker (revision notes & formula sheets)", plans: ["main"] },
          { label: "Mind map creator", plans: ["main"] },
          { label: "Quiz and flashcard generator", plans: ["main"] },
          { label: "Practical activities and assignments", plans: ["main"] },
        ],
      },
      {
        n: 3,
        title: "Use AI in All Subjects",
        kicker: "Apply AI to Maths, Science, English and other subjects.",
        items: [
          { label: "Step-by-step help for chapter questions", plans: ["main"] },
          { label: "Learn through pictures, videos and audio", plans: ["main"] },
          { label: "Create chapter-wise notes and practice questions", plans: ["main"] },
          { label: "Use AI for school exams, unit tests and boards", plans: ["main"] },
          { label: "Subject-wise practical examples", plans: ["main"] },
        ],
      },
      {
        n: 4,
        title: "Improve Your Marks",
        kicker: "Find mistakes, practise weak topics and prepare better for studies.",
        items: [
          { label: "Check written answers with feedback", plans: ["main"] },
          { label: "Analyse mock-test mistakes", plans: ["main"] },
          { label: "Find important topics from previous-year papers", plans: ["main"] },
          { label: "Create a personalised study plan", plans: ["main"] },
          { label: "Final project", plans: ["main"] },
        ],
      },
    ],
    whoCanJoin:
      "School students, competitive exam aspirants & college students. This course is for anyone who wants to study smart.",
    teachers: [
      {
        name: "Deenbandhu Pandey",
        role: "Founder & Product Leader",
        photo: "/images/teachers/deenbandhu-pandey.jpg",
        bullets: [
          "Founder of Kaksha Station; Associate Director of AI Enabled Teaching at Vedantu, driving scale as a teacher-turned-product leader",
          "Scored 99.63 percentile in CAT and served as Former HOD of Maths",
          "Built and deployed 20+ AI products transforming tech-enabled learning",
          "Directly taught 100,000+ students and reached over 10 lakh (1M+) learners",
        ],
      },
    ],
    certificate: {
      image: "/images/certificates/ai-study-mastery.jpg",
      recipient: "Ashok Kumar",
      label: "AI Study Mastery",
      note: "Sample certificate.",
    },
    reviews: [],
    faqs: [], // [TODO] FAQs not provided for this course
    ctaLabel: "Enrol now",
  },

  /* ─────────────────────────── PERSONALITY DEVELOPMENT ─────────────────────────── */
  {
    slug: "personality-development",
    theme: "personality",
    title: "Personality Development",
    shortName: "Personality",
    status: "coming-soon",
    eyebrow: "Launching soon",
    tagline: "Speak like you mean it.",
    blurb: "Communication, confidence and presence, for the rooms you haven't walked into yet.",
    language: "[TODO]",
    highlights: [],
    plans: [],
    phases: [],
    teachers: [],
    reviews: [],
    faqs: [],
    positioning: [
      "Communication",
      "Confidence",
      "Personal growth",
      "Self-expression",
      "Professional presence",
    ],
    ctaLabel: "Notify me",
  },

  /* ────────────────────────────────── VIDEO EDITING ────────────────────────────────── */
  {
    slug: "video-editing",
    theme: "video",
    title: "Video Editing",
    shortName: "Video Editing",
    status: "coming-soon",
    eyebrow: "Launching soon",
    tagline: "Cut. Pace. Tell the story.",
    blurb: "Timelines, storytelling and motion, editing as a craft, not a checklist of buttons.",
    language: "[TODO]",
    highlights: [],
    plans: [],
    phases: [],
    teachers: [],
    reviews: [],
    faqs: [],
    positioning: [
      "Video production",
      "Editing timelines",
      "Storytelling",
      "Motion",
      "Creativity",
      "Visual composition",
    ],
    ctaLabel: "Notify me",
  },
];

export const liveCourses = courses.filter((c) => c.status === "live");
export const soonCourses = courses.filter((c) => c.status === "coming-soon");
export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const startPrice = (c: Course) =>
  c.plans.length ? Math.min(...c.plans.map((p) => p.price)) : null;
export const topPlan = (c: Course) => c.plans.find((p) => p.recommended) ?? c.plans[c.plans.length - 1];
export const savePct = (p: Plan) => (p.mrp ? Math.round((1 - p.price / p.mrp) * 100) : null);
