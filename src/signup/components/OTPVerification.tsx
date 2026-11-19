import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { OTP_LENGTH, OTP_RESEND_SECONDS } from "../constants.ts";
import { MOCK_OTP_CODE, otpService } from "../services/otpService.ts";
import { PencilIcon } from "./icons.tsx";

interface Props {
  displayMobile: string; // e.g. "+91 98765 43210"
  fullMobile: string; // e.g. "+919876543210"
  onVerified: () => void;
  onEdit: () => void;
}

const EMPTY = Array<string>(OTP_LENGTH).fill("");

export function OTPVerification({ displayMobile, fullMobile, onVerified, onEdit }: Props) {
  const [digits, setDigits] = useState<string[]>(EMPTY);
  const [state, setState] = useState<"idle" | "verifying" | "error">("idle");
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(OTP_RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => refs.current[0]?.focus(), []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const verify = async (code: string) => {
    setState("verifying");
    setError("");
    const res = await otpService.verifyOtp(fullMobile, code);
    if (res.ok) {
      onVerified();
    } else {
      setState("error");
      setError(res.error);
      setDigits(EMPTY);
      refs.current[0]?.focus();
    }
  };

  const apply = (next: string[]) => {
    setDigits(next);
    setNotice("");
    if (state === "error") { setState("idle"); setError(""); }
    if (next.every(Boolean)) void verify(next.join(""));
  };

  const fill = (start: number, raw: string) => {
    const chars = raw.replace(/\D/g, "").slice(0, OTP_LENGTH - start).split("");
    if (!chars.length) return;
    const next = [...digits];
    chars.forEach((c, i) => (next[start + i] = c));
    apply(next);
    refs.current[Math.min(start + chars.length, OTP_LENGTH - 1)]?.focus();
  };

  const onKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < OTP_LENGTH - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const onPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    fill(0, e.clipboardData.getData("text"));
  };

  const resend = async () => {
    setResending(true);
    const res = await otpService.sendOtp(fullMobile);
    setResending(false);
    if (res.ok) {
      setDigits(EMPTY);
      setState("idle");
      setError("");
      setNotice("A new OTP has been sent.");
      setSeconds(OTP_RESEND_SECONDS);
      refs.current[0]?.focus();
    } else {
      setError(res.error);
      setState("error");
    }
  };

  const busy = state === "verifying";

  return (
    <div className="otp" role="group" aria-label="Verify mobile number with OTP">
      {otpService.mode === "mock" && (
        <p className="demo-banner">
          <strong>Demo mode:</strong> no SMS is sent. Enter <code>{MOCK_OTP_CODE}</code> to verify.
        </p>
      )}
      <p className="otp-sent">
        Enter the {OTP_LENGTH}-digit OTP sent to <strong>{displayMobile}</strong>{" "}
        <button type="button" className="link-btn edit" onClick={onEdit}>
          <PencilIcon width={14} height={14} /> Edit
        </button>
      </p>
      <div className="otp-boxes">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className={`otp-box${state === "error" ? " bad" : ""}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={OTP_LENGTH}
            value={d}
            disabled={busy}
            aria-label={`OTP digit ${i + 1} of ${OTP_LENGTH}`}
            onChange={(e) => fill(i, e.target.value)}
            onKeyDown={(e) => onKey(i, e)}
            onPaste={onPaste}
            onFocus={(e) => e.target.select()}
          />
        ))}
      </div>
      <div className="otp-status" aria-live="polite">
        {busy && <span className="msg muted">Verifying…</span>}
        {state === "error" && <span className="msg error" role="alert">{error}</span>}
        {notice && state === "idle" && <span className="msg ok">{notice}</span>}
      </div>
      <p className="otp-resend">
        <strong>Didn’t get the OTP?</strong>{" "}
        {seconds > 0 ? (
          <span className="muted">Resend OTP in {seconds}s</span>
        ) : (
          <button type="button" className="link-btn" onClick={resend} disabled={resending || busy}>
            {resending ? "Sending…" : "Resend OTP"}
          </button>
        )}
      </p>
    </div>
  );
}
