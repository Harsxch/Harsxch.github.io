import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const DEV_PASSWORD = "Passw0rd!";

async function main() {
  console.log("Seeding platforms...");
  const [youtube, instagram, other] = await Promise.all([
    prisma.platform.upsert({ where: { slug: "youtube" }, create: { name: "YouTube", slug: "youtube" }, update: {} }),
    prisma.platform.upsert({ where: { slug: "instagram" }, create: { name: "Instagram", slug: "instagram" }, update: {} }),
    prisma.platform.upsert({ where: { slug: "other" }, create: { name: "Other", slug: "other" }, update: {} }),
  ]);

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  console.log("Seeding staff users...");
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@platform.dev" },
    create: { email: "admin@platform.dev", passwordHash, name: "Super Admin", role: "SUPER_ADMIN" },
    update: {},
  });
  const finance = await prisma.user.upsert({
    where: { email: "finance@platform.dev" },
    create: { email: "finance@platform.dev", passwordHash, name: "Finance Lead", role: "FINANCE" },
    update: {},
  });
  const manager = await prisma.user.upsert({
    where: { email: "manager@platform.dev" },
    create: { email: "manager@platform.dev", passwordHash, name: "Influencer Manager", role: "INFLUENCER_MANAGER" },
    update: {},
  });
  const analyst = await prisma.user.upsert({
    where: { email: "analyst@platform.dev" },
    create: { email: "analyst@platform.dev", passwordHash, name: "Data Analyst", role: "ANALYST" },
    update: {},
  });

  console.log("Seeding courses...");
  const pythonDsa = await prisma.course.upsert({
    where: { slug: "python-dsa" },
    create: {
      name: "Python + DSA Mastery",
      slug: "python-dsa",
      description: "Learn Python and Data Structures & Algorithms from scratch.",
      courseUrl: "https://example.com/course/python-dsa",
      originalPrice: 10000,
      sellingPrice: 10000,
      category: "Programming",
      status: "ACTIVE",
      defaultModelType: "REVENUE_SHARE",
      marketingDescription: "The most complete Python + DSA course for beginners to job-ready engineers.",
      sellingPoints: ["100+ hours of content", "1:1 mentorship", "Placement assistance"],
      faqs: [{ q: "Is this beginner friendly?", a: "Yes, no prior experience required." }],
    },
    update: {},
  });
  const aiCourse = await prisma.course.upsert({
    where: { slug: "ai-mastery" },
    create: {
      name: "AI Mastery",
      slug: "ai-mastery",
      description: "Applied AI and LLM engineering.",
      courseUrl: "https://example.com/course/ai-mastery",
      originalPrice: 15000,
      sellingPrice: 15000,
      category: "AI/ML",
      status: "ACTIVE",
      defaultModelType: "REVENUE_SHARE",
      marketingDescription: "Build and ship real AI products.",
      sellingPoints: ["Hands-on projects", "LLM engineering", "Career support"],
    },
    update: {},
  });
  const dataScience = await prisma.course.upsert({
    where: { slug: "data-science" },
    create: {
      name: "Data Science Bootcamp",
      slug: "data-science",
      description: "End-to-end data science training.",
      courseUrl: "https://example.com/course/data-science",
      originalPrice: 12000,
      sellingPrice: 12000,
      category: "Data",
      status: "ACTIVE",
      defaultModelType: "FIXED_PER_SALE",
      marketingDescription: "From SQL to machine learning in one bootcamp.",
      sellingPoints: ["Capstone project", "Interview prep"],
    },
    update: {},
  });

  console.log("Seeding influencers...");
  const rahulUser = await prisma.user.upsert({
    where: { email: "rahul@creator.dev" },
    create: { email: "rahul@creator.dev", passwordHash, name: "Rahul Sharma", role: "INFLUENCER" },
    update: {},
  });
  const rahul = await prisma.influencer.upsert({
    where: { email: "rahul@creator.dev" },
    create: {
      userId: rahulUser.id,
      name: "Rahul Sharma",
      email: "rahul@creator.dev",
      phone: "+91-9000000001",
      youtubeUrl: "https://youtube.com/@rahulsharma",
      primaryPlatformId: youtube.id,
      category: "Tech Education",
      managerId: manager.id,
      joiningDate: new Date("2026-06-01"),
      status: "ACTIVE",
      paymentInfo: { upi: "rahul@upi" },
    },
    update: {},
  });

  const priyaUser = await prisma.user.upsert({
    where: { email: "priya@creator.dev" },
    create: { email: "priya@creator.dev", passwordHash, name: "Priya Verma", role: "INFLUENCER" },
    update: {},
  });
  const priya = await prisma.influencer.upsert({
    where: { email: "priya@creator.dev" },
    create: {
      userId: priyaUser.id,
      name: "Priya Verma",
      email: "priya@creator.dev",
      phone: "+91-9000000002",
      instagramUrl: "https://instagram.com/priyaverma",
      primaryPlatformId: instagram.id,
      category: "Career Coaching",
      managerId: manager.id,
      joiningDate: new Date("2026-07-01"),
      status: "ACTIVE",
      paymentInfo: { upi: "priya@upi" },
    },
    update: {},
  });

  const aminaUser = await prisma.user.upsert({
    where: { email: "amina@creator.dev" },
    create: { email: "amina@creator.dev", passwordHash, name: "Amina Khan", role: "INFLUENCER" },
    update: {},
  });
  const amina = await prisma.influencer.upsert({
    where: { email: "amina@creator.dev" },
    create: {
      userId: aminaUser.id,
      name: "Amina Khan",
      email: "amina@creator.dev",
      phone: "+91-9000000003",
      youtubeUrl: "https://youtube.com/@aminakhan",
      instagramUrl: "https://instagram.com/aminakhan",
      primaryPlatformId: youtube.id,
      category: "Data Science",
      managerId: manager.id,
      joiningDate: new Date("2026-08-01"),
      status: "ACTIVE",
      paymentInfo: { upi: "amina@upi" },
    },
    update: {},
  });

  console.log("Granting course access...");
  for (const influencer of [rahul, priya, amina]) {
    for (const course of [pythonDsa, aiCourse, dataScience]) {
      await prisma.courseInfluencer.upsert({
        where: { courseId_influencerId: { courseId: course.id, influencerId: influencer.id } },
        create: { courseId: course.id, influencerId: influencer.id },
        update: {},
      });
    }
  }

  console.log("Seeding commercial agreements (demonstrating multiple models)...");

  // Rahul: general 40:60 revenue share, plus a richer 50:50 override on the AI course.
  const rahulAgreement = await prisma.commercialAgreement.create({
    data: { influencerId: rahul.id, createdById: superAdmin.id },
  });
  await prisma.commercialAgreementVersion.create({
    data: {
      agreementId: rahulAgreement.id,
      version: 1,
      modelType: "REVENUE_SHARE",
      influencerSharePct: 40,
      companySharePct: 60,
      eligibleRevenueBasis: "DISCOUNTED",
      effectiveFrom: new Date("2026-06-01"),
      status: "ACTIVE",
      createdById: superAdmin.id,
      notes: "General agreement - 40:60 revenue share on all courses.",
    },
  });
  await prisma.commercialAgreementVersion.create({
    data: {
      agreementId: rahulAgreement.id,
      version: 2,
      modelType: "REVENUE_SHARE",
      influencerSharePct: 50,
      companySharePct: 50,
      eligibleRevenueBasis: "DISCOUNTED",
      effectiveFrom: new Date("2026-06-01"),
      status: "ACTIVE",
      createdById: superAdmin.id,
      notes: "Course-specific override - AI Mastery only.",
      courseScopes: { create: [{ courseId: aiCourse.id }] },
    },
  });

  // Priya: flat 15% percentage commission on everything.
  const priyaAgreement = await prisma.commercialAgreement.create({
    data: { influencerId: priya.id, createdById: superAdmin.id },
  });
  await prisma.commercialAgreementVersion.create({
    data: {
      agreementId: priyaAgreement.id,
      version: 1,
      modelType: "PERCENTAGE_COMMISSION",
      commissionPct: 15,
      eligibleRevenueBasis: "DISCOUNTED",
      effectiveFrom: new Date("2026-07-01"),
      status: "ACTIVE",
      createdById: superAdmin.id,
      notes: "General agreement - 15% commission on all courses.",
    },
  });

  // Amina: fixed ₹750 per sale on the Data Science course specifically.
  const aminaAgreement = await prisma.commercialAgreement.create({
    data: { influencerId: amina.id, createdById: superAdmin.id },
  });
  await prisma.commercialAgreementVersion.create({
    data: {
      agreementId: aminaAgreement.id,
      version: 1,
      modelType: "FIXED_PER_SALE",
      fixedAmount: 750,
      eligibleRevenueBasis: "DISCOUNTED",
      effectiveFrom: new Date("2026-08-01"),
      status: "ACTIVE",
      createdById: superAdmin.id,
      notes: "General agreement - fixed ₹750 per sale on all courses.",
    },
  });

  console.log("Seeding a campaign...");
  const campaign = await prisma.campaign.upsert({
    where: { slug: "september-launch" },
    create: {
      name: "September Launch",
      slug: "september-launch",
      description: "Back-to-school push across all creators.",
      startDate: new Date("2026-09-01"),
      endDate: new Date("2026-09-30"),
      status: "ACTIVE",
      targetSales: 100,
      targetRevenue: 800000,
      createdById: superAdmin.id,
    },
    update: {},
  });
  for (const influencer of [rahul, priya, amina]) {
    await prisma.campaignInfluencer.upsert({
      where: { campaignId_influencerId: { campaignId: campaign.id, influencerId: influencer.id } },
      create: { campaignId: campaign.id, influencerId: influencer.id },
      update: {},
    });
  }
  for (const course of [pythonDsa, aiCourse, dataScience]) {
    await prisma.campaignCourse.upsert({
      where: { campaignId_courseId: { campaignId: campaign.id, courseId: course.id } },
      create: { campaignId: campaign.id, courseId: course.id },
      update: {},
    });
  }

  console.log("Seeding tracking links and coupons...");
  const rahulLink = await prisma.trackingLink.upsert({
    where: { code: "rahul-python-yt-v1" },
    create: {
      code: "rahul-python-yt-v1",
      influencerId: rahul.id,
      courseId: pythonDsa.id,
      platformId: youtube.id,
      campaignId: campaign.id,
      content: "Video 1",
      utmSource: "youtube",
      utmMedium: "influencer",
      utmCampaign: "september_launch",
      utmContent: "rahul_video_1",
      status: "ACTIVE",
    },
    update: {},
  });
  await prisma.trackingLink.upsert({
    where: { code: "priya-ai-ig-story" },
    create: {
      code: "priya-ai-ig-story",
      influencerId: priya.id,
      courseId: aiCourse.id,
      platformId: instagram.id,
      campaignId: campaign.id,
      content: "Story",
      utmSource: "instagram",
      utmMedium: "influencer",
      utmCampaign: "september_launch",
      utmContent: "priya_story",
      status: "ACTIVE",
    },
    update: {},
  });

  const rahulCoupon = await prisma.coupon.upsert({
    where: { code: "RAHUL10" },
    create: {
      code: "RAHUL10",
      influencerId: rahul.id,
      discountType: "PERCENTAGE",
      discountValue: 10,
      startDate: new Date("2026-06-01"),
      status: "ACTIVE",
    },
    update: {},
  });
  const priyaCoupon = await prisma.coupon.upsert({
    where: { code: "PRIYA15" },
    create: {
      code: "PRIYA15",
      influencerId: priya.id,
      discountType: "PERCENTAGE",
      discountValue: 15,
      startDate: new Date("2026-07-01"),
      status: "ACTIVE",
    },
    update: {},
  });
  const aminaCoupon = await prisma.coupon.upsert({
    where: { code: "AMINA750" },
    create: {
      code: "AMINA750",
      influencerId: amina.id,
      discountType: "FIXED_AMOUNT",
      discountValue: 1000,
      startDate: new Date("2026-08-01"),
      status: "ACTIVE",
    },
    update: {},
  });

  console.log("Seeding sample orders and financial transactions...");
  const { createManualOrder, createRefund } = await import("../src/lib/orders/process-order");
  const actor = { id: superAdmin.id, email: superAdmin.email };

  const order1 = await createManualOrder(
    {
      customerEmail: "customer1@example.com",
      customerName: "Customer One",
      courseId: pythonDsa.id,
      originalPrice: 10000,
      discountAmount: 2000,
      couponCode: rahulCoupon.code,
      placedAt: new Date("2026-09-05"),
    },
    actor
  );

  await createManualOrder(
    {
      customerEmail: "customer2@example.com",
      customerName: "Customer Two",
      courseId: aiCourse.id,
      originalPrice: 15000,
      discountAmount: 0,
      trackingLinkCode: rahulLink.code,
      placedAt: new Date("2026-09-10"),
    },
    actor
  );

  await createManualOrder(
    {
      customerEmail: "customer3@example.com",
      customerName: "Customer Three",
      courseId: aiCourse.id,
      originalPrice: 15000,
      discountAmount: 2250,
      couponCode: priyaCoupon.code,
      placedAt: new Date("2026-09-12"),
    },
    actor
  );

  const order4 = await createManualOrder(
    {
      customerEmail: "customer4@example.com",
      customerName: "Customer Four",
      courseId: dataScience.id,
      originalPrice: 12000,
      discountAmount: 1000,
      couponCode: aminaCoupon.code,
      placedAt: new Date("2026-09-15"),
    },
    actor
  );

  await createManualOrder(
    {
      customerEmail: "customer5@example.com",
      customerName: "Customer Five",
      courseId: pythonDsa.id,
      originalPrice: 10000,
      discountAmount: 0,
      couponCode: rahulCoupon.code,
      placedAt: new Date("2026-09-18"),
    },
    actor
  );

  console.log("Seeding a partial refund and a full refund to exercise the reversal path...");
  await createRefund(order4.id, { amount: 5500, reason: "Customer requested partial refund" }, actor);
  await createRefund(order1.id, { amount: 8000, reason: "Duplicate purchase" }, actor);

  console.log("Seeding goals...");
  await prisma.goal.create({
    data: {
      influencerId: rahul.id,
      metric: "SALES",
      targetValue: 50,
      periodStart: new Date("2026-09-01"),
      periodEnd: new Date("2026-09-30"),
      createdById: manager.id,
    },
  });
  await prisma.goal.create({
    data: {
      influencerId: rahul.id,
      metric: "REVENUE",
      targetValue: 250000,
      periodStart: new Date("2026-09-01"),
      periodEnd: new Date("2026-09-30"),
      createdById: manager.id,
    },
  });

  console.log("\nSeed complete.");
  console.log("---------------------------------------------");
  console.log("Login credentials (all use password: " + DEV_PASSWORD + ")");
  console.log("  Super Admin:         admin@platform.dev");
  console.log("  Finance:             finance@platform.dev");
  console.log("  Influencer Manager:  manager@platform.dev");
  console.log("  Analyst:             analyst@platform.dev");
  console.log("  Influencer (Rahul):  rahul@creator.dev");
  console.log("  Influencer (Priya):  priya@creator.dev");
  console.log("  Influencer (Amina):  amina@creator.dev");
  console.log("---------------------------------------------");

  void other;
  void analyst;
  void finance;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
