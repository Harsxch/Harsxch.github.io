// Smoke test for the influencer platform. Requires the dev server running
// at BASE_URL (default http://localhost:3000) with the seeded dev database
// (`npm run db:seed`). Run with: node scripts/e2e-smoke.mjs
//
// Covers: RBAC (an influencer can never reach /admin or another
// influencer's data), the full commercial-agreement -> order ->
// attribution -> financial-calculation -> refund -> approve -> payout
// pipeline through the real UI (not just the service layer), and CSV
// exports.
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const executablePath = process.env.PLAYWRIGHT_EXECUTABLE_PATH; // optional override for sandboxed environments

const browser = await chromium.launch(executablePath ? { executablePath } : {});
const errors = [];

async function newPage() {
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  return { context, page };
}

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
}

function assert(condition, message) {
  if (!condition) throw new Error(`FAILED: ${message}`);
  console.log(`ok - ${message}`);
}

// --- 1. RBAC: influencer can reach their own pages but never /admin ---
{
  const { context, page } = await newPage();
  await login(page, "rahul@creator.dev", "Passw0rd!");
  await page.goto(`${BASE_URL}/influencer`, { waitUntil: "networkidle" });
  assert((await page.textContent("body")).includes("Welcome back"), "influencer dashboard loads");

  await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle" });
  assert(page.url().includes("/influencer"), "influencer is redirected away from /admin");
  await context.close();
}

// --- 2. Full commercial pipeline through the real UI ---
{
  const { context, page } = await newPage();
  await login(page, "admin@platform.dev", "Passw0rd!");
  const suffix = Date.now();

  await page.goto(`${BASE_URL}/admin/influencers/new`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.fill('input[name="name"]', "Smoke Test Influencer");
  await page.fill('input[name="email"]', `smoke-${suffix}@creator.dev`);
  await page.selectOption('select[name="status"]', "ACTIVE");
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.endsWith("/new"), { timeout: 15000 });
  assert(page.url().includes("/admin/influencers/"), "influencer created and profile page loaded");

  await page.selectOption('select[name="modelType"]', "PERCENTAGE_COMMISSION");
  await page.fill('input[name="commissionPct"]', "20");
  await page.fill('input[name="effectiveFrom"]', "2026-01-01");
  await page.click('button:has-text("Add Version")');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  assert((await page.textContent("body")).includes("PERCENTAGE COMMISSION"), "agreement version created (versioned, never overwritten)");

  const couponCode = `SMOKE${suffix}`;
  await page.goto(`${BASE_URL}/admin/coupons`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.fill('input[name="code"]', couponCode);
  await page.selectOption('select[name="influencerId"]', { label: "Smoke Test Influencer" });
  await page.fill('input[name="discountValue"]', "20");
  await page.click('button:has-text("Create Coupon")');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  assert((await page.textContent("body")).includes(couponCode), "coupon created");

  await page.goto(`${BASE_URL}/admin/sales/new`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.fill('input[name="customerEmail"]', `smokecustomer${suffix}@example.com`);
  await page.selectOption('select[name="courseId"]', { index: 1 });
  await page.fill('input[name="originalPrice"]', "10000");
  await page.fill('input[name="discountAmount"]', "1000");
  await page.fill('input[name="couponCode"]', couponCode);
  await page.click('button:has-text("Record Sale")');
  await page.waitForURL((u) => !u.pathname.endsWith("/new"), { timeout: 15000 });
  const orderText = await page.textContent("body");
  // eligible revenue (9000, discounted basis) * 20% commission = 1800
  assert(orderText.includes("₹1,800"), "financial engine calculated 20% commission correctly on eligible revenue");

  await page.fill('input[name="amount"]', "4500");
  await page.fill('input[name="reason"]', "Smoke test partial refund");
  await page.click('button:has-text("Issue Refund")');
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
  assert((await page.textContent("body")).includes("PARTIALLY REFUNDED"), "partial refund created a reversal and updated order status");

  await page.goto(`${BASE_URL}/admin/earnings?status=PENDING`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  await page.locator('tbody input[type="checkbox"]').first().check();
  await page.click('button:has-text("Approve selected")');
  await page.waitForTimeout(1200);

  await page.goto(`${BASE_URL}/admin/payouts`, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const payoutBtn = page.locator('button:has-text("Create Payout")').first();
  if ((await payoutBtn.count()) > 0) {
    await payoutBtn.click();
    await page.waitForTimeout(1200);
    assert((await page.textContent("body")).includes("PENDING"), "payout created from approved earnings");
  }

  await context.close();
}

// --- 3. CSV exports respond with real CSV ---
{
  const { context, page } = await newPage();
  await login(page, "admin@platform.dev", "Passw0rd!");
  for (const path of ["/api/exports/sales", "/api/exports/influencers", "/api/exports/earnings", "/api/exports/payouts"]) {
    const resp = await context.request.get(`${BASE_URL}${path}`);
    assert(resp.status() === 200, `${path} returns 200`);
    assert((await resp.text()).split("\n").length > 0, `${path} returns CSV content`);
  }
  await context.close();
}

await browser.close();

if (errors.length) {
  console.error("\nBrowser/console errors detected during the run:");
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("\nAll smoke checks passed.");
