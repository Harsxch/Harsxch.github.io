/**
 * Submission boundary. Replace the body with the real Vedantu call.
 * No endpoint or contract is assumed here: the payload shape is the only
 * thing Tech needs to map. Throw (or return ok:false) to surface an error.
 */
import type { SignupPayload } from "../types.ts";

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitSignup(payload: SignupPayload): Promise<SubmitResult> {
  // TODO(Vedantu): POST `payload` to the real signup/lead-capture service.
  await new Promise((r) => setTimeout(r, 900));
  console.info("[demo] signup payload (not sent anywhere):", payload);
  return { ok: true };
}
