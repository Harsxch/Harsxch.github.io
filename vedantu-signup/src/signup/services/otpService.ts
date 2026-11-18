/**
 * OTP service boundary.
 *
 * DEMO ONLY by default: "mock" mode sends NO SMS and verifies against a fixed
 * code. It must never ship to production as a real verification.
 *
 * PRODUCTION: implement `realOtpService` against Vedantu's existing
 * authentication system (send + verify endpoints, rate limiting, expiry and
 * attempt limits live server-side). Then set VITE_OTP_MODE=real.
 */
import { OTP_LENGTH } from "../constants.ts";

export interface OtpService {
  readonly mode: "mock" | "real";
  sendOtp(fullMobile: string): Promise<{ ok: true } | { ok: false; error: string }>;
  verifyOtp(fullMobile: string, code: string): Promise<{ ok: true } | { ok: false; error: string }>;
}

/** The only code the mock accepts. Shown in the UI banner so testers can proceed. */
export const MOCK_OTP_CODE = "123456";
const MOCK_MAX_ATTEMPTS = 5;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function createMockOtpService(): OtpService {
  let attempts = 0;
  return {
    mode: "mock",
    async sendOtp() {
      await delay(600);
      attempts = 0;
      return { ok: true };
    },
    async verifyOtp(_mobile, code) {
      await delay(500);
      if (attempts >= MOCK_MAX_ATTEMPTS) {
        return { ok: false, error: "Too many attempts. Please resend the OTP." };
      }
      if (code.length === OTP_LENGTH && code === MOCK_OTP_CODE) return { ok: true };
      attempts += 1;
      return { ok: false, error: "Incorrect OTP. Please try again." };
    },
  };
}

function createRealOtpService(): OtpService {
  // TODO(Vedantu): connect to the existing authentication system.
  const notConnected = { ok: false as const, error: "OTP service is not connected." };
  return {
    mode: "real",
    sendOtp: async () => notConnected,
    verifyOtp: async () => notConnected,
  };
}

const configured = import.meta.env?.VITE_OTP_MODE;
export const otpService: OtpService =
  configured === "real" ? createRealOtpService() : createMockOtpService();
