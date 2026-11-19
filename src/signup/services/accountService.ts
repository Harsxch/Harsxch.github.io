/**
 * Returning-student account lookup. DEMO ONLY.
 *
 * Mock storage: browser localStorage (accounts created through the demo signup
 * form) plus one built-in sample account. There is no backend.
 *
 * PRODUCTION: replace with Vedantu's existing user/profile service. Lookup must
 * only happen AFTER the OTP is verified server-side (never reveal whether a
 * number has an account before verification), and profile updates must be
 * authorised by the authenticated session, not by a client-supplied mobile.
 */
import type { SignupPayload } from "../types.ts";

export type Account = SignupPayload & { last_visit: string };

const KEY = "vedantu-demo-accounts";
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const DEMO_MOBILE = "+919876543210";

const demoAccount = (): Account => ({
  name: "Asha Rao",
  mobile: DEMO_MOBILE,
  mobile_verified: true,
  email: "asha.rao@gmail.com",
  grade: "12th",
  target_exam: "NEET",
  board: "CBSE",
  state: "Karnataka",
  city: "Bengaluru",
  consent: true,
  last_visit: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
});

function readAll(): Record<string, Account> {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}
function writeAll(all: Record<string, Account>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* storage unavailable: demo accounts just won't persist */
  }
}

/** Called after a successful demo signup so the returning flow can find the student. */
export function saveAccount(payload: SignupPayload) {
  const all = readAll();
  all[payload.mobile] = { ...payload, last_visit: new Date().toISOString() };
  writeAll(all);
}

export async function findAccountByMobile(fullMobile: string): Promise<Account | null> {
  await delay(600);
  const found = readAll()[fullMobile];
  if (found) return found;
  return fullMobile === DEMO_MOBILE ? demoAccount() : null;
}

export async function updateAccount(account: Account): Promise<Account> {
  await delay(500);
  const next = { ...account, last_visit: new Date().toISOString() };
  const all = readAll();
  all[next.mobile] = next;
  writeAll(all);
  return next;
}
