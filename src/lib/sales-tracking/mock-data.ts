import type { InfluencerSaleRecord, SaleStatus } from "./types";

/**
 * Deterministic mock dataset generator - standing in for the Metabase
 * connection until the data team wires it up (see adapter.ts). Deterministic
 * (seeded by the influencer's own ID) so:
 *  - every influencer account gets a plausible, non-empty dataset, not just
 *    a few hardcoded demo users
 *  - re-applying the same filters always returns the same numbers, rather
 *    than a fresh random dataset per request
 */

const COURSES = ["Python + DSA Mastery", "AI Mastery", "Data Science Bootcamp"];
const SOURCES = ["youtube", "instagram", "storefront"];
const MEDIUMS = ["influencer", "V_Upskill_Academy", "social"];
const CAMPAIGNS = ["SeptemberLaunch", "Dedicated", "FestiveSale"];
const CONTENTS = ["video_01", "video_02", "video_03", "reel_01", "sf"];
const TERMS = [null, null, "HarshPriyam", "PriyaVerma", "AminaKhan"];
const COUPONS = [null, null, "RAHUL10", "PRIYA15", "SAVE500"];
// Weighted so most rows are PAID, matching a real sales mix.
const STATUSES: SaleStatus[] = ["PAID", "PAID", "PAID", "PAID", "PAID", "REFUNDED", "CANCELLED"];
const COURSE_PRICE: Record<string, number> = {
  "Python + DSA Mastery": 10000,
  "AI Mastery": 15000,
  "Data Science Bootcamp": 12000,
};

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/** mulberry32 - small, fast, deterministic PRNG. */
function createRng(seed: number) {
  let state = seed;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function randomHex(rng: () => number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += Math.floor(rng() * 16).toString(16);
  return out;
}

function randomDigits(rng: () => number, length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) out += Math.floor(rng() * 10).toString();
  return out;
}

const CACHE = new Map<string, InfluencerSaleRecord[]>();

export function generateMockSales(influencerId: string): InfluencerSaleRecord[] {
  const cached = CACHE.get(influencerId);
  if (cached) return cached;

  const rng = createRng(hashString(influencerId));
  const rowCount = 35 + Math.floor(rng() * 20); // 35-54 rows
  const now = Date.now();
  const rows: InfluencerSaleRecord[] = [];

  for (let i = 0; i < rowCount; i++) {
    const course = pick(rng, COURSES);
    const daysAgo = Math.floor(rng() * 90);
    const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    const basePrice = COURSE_PRICE[course];
    const discountPct = rng() < 0.5 ? [0, 5, 10, 15][Math.floor(rng() * 4)] : 0;
    const saleAmount = Math.round((basePrice * (100 - discountPct)) / 100);

    rows.push({
      orderId: randomHex(rng, 24),
      date: date.toISOString().slice(0, 10),
      courseName: course,
      utmSource: pick(rng, SOURCES),
      utmMedium: pick(rng, MEDIUMS),
      utmCampaign: pick(rng, CAMPAIGNS),
      utmContent: pick(rng, CONTENTS),
      utmTerm: pick(rng, TERMS),
      couponCode: pick(rng, COUPONS),
      userId: `v_${randomDigits(rng, 13)}`,
      saleAmount,
      saleStatus: pick(rng, STATUSES),
    });
  }

  rows.sort((a, b) => (a.date < b.date ? 1 : -1));
  CACHE.set(influencerId, rows);
  return rows;
}
