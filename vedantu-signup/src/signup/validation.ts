import { BOARD_GRADES, BOARDS, GRADES, TARGET_EXAMS } from "./constants.ts";
import type { SignupErrors, SignupPayload, SignupValues } from "./types.ts";

export const isBoardApplicable = (grade: string) => BOARD_GRADES.includes(grade);

export function validateName(name: string): string | undefined {
  if (!name.trim()) return "Please enter your full name";
  return undefined;
}

/** +91: 10 digits starting 6-9. Other countries: 6-14 digits (E.164 max 15 incl. code). */
export function validateMobile(countryCode: string, mobile: string): string | undefined {
  if (!mobile) return "Please enter your mobile number";
  if (!/^\d+$/.test(mobile)) return "Mobile number can only contain digits";
  if (countryCode === "+91") {
    if (mobile.length !== 10) return "Enter a 10-digit mobile number";
    if (!/^[6-9]/.test(mobile)) return "Indian mobile numbers start with 6, 7, 8 or 9";
    return undefined;
  }
  if (mobile.length < 6 || mobile.length > 14) return "Enter a valid mobile number";
  return undefined;
}

// Structure only: local@domain.tld, no spaces, tld >= 2 chars.
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

export function validateEmail(email: string): string | undefined {
  const v = email.trim();
  if (!v) return "Please enter your email address";
  if (!EMAIL_RE.test(v) || v.includes("..")) return "Enter a valid email address, e.g. name@example.com";
  return undefined;
}

// ---- Domain typo suggestions -------------------------------------------------

const POPULAR_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "yahoo.in",
  "yahoo.co.in",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "rediffmail.com",
  "live.com",
  "protonmail.com",
];

/** Optimal string alignment distance (Levenshtein + adjacent transposition). */
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
}

/**
 * Returns a corrected full address (e.g. "a@gmail.com") when the domain looks
 * like a typo of a popular provider, else null. Never blocks submission.
 */
export function suggestEmail(email: string): string | null {
  const v = email.trim();
  if (validateEmail(v)) return null;
  const at = v.lastIndexOf("@");
  const local = v.slice(0, at);
  const domain = v.slice(at + 1).toLowerCase();
  if (POPULAR_DOMAINS.includes(domain)) return null;
  const match = POPULAR_DOMAINS.find((p) => editDistance(domain, p) === 1);
  return match ? `${local}@${match}` : null;
}

// ---- Whole-form validation ---------------------------------------------------

export function validateForm(v: SignupValues): SignupErrors {
  const e: SignupErrors = {};
  const name = validateName(v.name);
  if (name) e.name = name;

  const mobile = validateMobile(v.countryCode, v.mobile);
  if (mobile) e.mobile = mobile;
  else if (v.verifiedMobile !== v.mobile) e.mobile = "Verify your mobile number with the OTP";

  const email = validateEmail(v.email);
  if (email) e.email = email;

  if (!(GRADES as readonly string[]).includes(v.grade)) e.grade = "Select your grade";
  if (!(TARGET_EXAMS as readonly string[]).includes(v.targetExam)) e.targetExam = "Select your target exam";

  if (isBoardApplicable(v.grade) && !BOARDS.some((b) => b.value === v.board)) {
    e.board = "Select your board";
  }
  if (!v.consent) e.consent = "Please accept to continue";
  return e;
}

export function buildPayload(v: SignupValues): SignupPayload {
  const payload: SignupPayload = {
    name: v.name.trim(),
    mobile: `${v.countryCode}${v.mobile}`,
    mobile_verified: v.verifiedMobile === v.mobile,
    email: v.email.trim(),
    grade: v.grade,
    target_exam: v.targetExam,
    consent: v.consent,
  };
  if (isBoardApplicable(v.grade) && v.board) payload.board = v.board;
  return payload;
}
