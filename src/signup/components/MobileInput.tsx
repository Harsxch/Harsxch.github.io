import { useState } from "react";
import { COUNTRY_CODES } from "../constants.ts";
import { otpService } from "../services/otpService.ts";
import { validateMobile } from "../validation.ts";
import { Field } from "./Field.tsx";
import { OTPVerification } from "./OTPVerification.tsx";
import { CheckIcon, PencilIcon } from "./icons.tsx";

interface Props {
  countryCode: string;
  mobile: string;
  verified: boolean;
  error?: string;
  onCountryCode: (c: string) => void;
  onMobile: (m: string) => void;
  onVerified: () => void;
  onUnverify: () => void;
  onBlur: () => void;
}

function formatDisplay(code: string, mobile: string) {
  return code === "+91" && mobile.length === 10 ? `${code} ${mobile.slice(0, 5)} ${mobile.slice(5)}` : `${code} ${mobile}`;
}

export function MobileInput(p: Props) {
  const [otpOpen, setOtpOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const formatError = validateMobile(p.countryCode, p.mobile);
  const canSend = !formatError && !sending && !p.verified;
  const locked = otpOpen || p.verified;

  const send = async () => {
    if (!canSend) return;
    setSending(true);
    setSendError("");
    const res = await otpService.sendOtp(`${p.countryCode}${p.mobile}`);
    setSending(false);
    if (res.ok) setOtpOpen(true);
    else setSendError(res.error);
  };

  const edit = () => {
    setOtpOpen(false);
    p.onUnverify();
  };

  const shownError = sendError || p.error;

  return (
    <Field id="mobile" label="Mobile number" error={otpOpen ? undefined : shownError}>
      <div className={`phone control${p.verified ? " is-verified" : ""}`}>
        <select
          className="phone-cc"
          aria-label="Country code"
          value={p.countryCode}
          disabled={locked}
          onChange={(e) => p.onCountryCode(e.target.value)}
        >
          {COUNTRY_CODES.map((c) => (
            <option key={c.code} value={c.code} title={c.label}>
              {c.code}
            </option>
          ))}
        </select>
        <input
          id="mobile"
          className="phone-input"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="Enter mobile number"
          value={p.mobile}
          readOnly={locked}
          aria-invalid={!!shownError}
          aria-describedby={shownError ? "mobile-error" : undefined}
          onChange={(e) => p.onMobile(e.target.value)}
          onBlur={p.onBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); void send(); }
          }}
        />
        {p.verified ? (
          <span className="badge-verified">
            <CheckIcon width={14} height={14} /> Verified
          </span>
        ) : (
          <button type="button" className="send-otp" disabled={!canSend} aria-disabled={!canSend} onClick={send}>
            {sending ? "Sending…" : otpOpen ? "Sent" : "Send OTP"}
          </button>
        )}
      </div>

      {p.verified && (
        <p className="msg ok">
          Mobile number verified{" "}
          <button type="button" className="link-btn edit" onClick={edit}>
            <PencilIcon width={14} height={14} /> Change
          </button>
        </p>
      )}

      {otpOpen && !p.verified && (
        <OTPVerification
          displayMobile={formatDisplay(p.countryCode, p.mobile)}
          fullMobile={`${p.countryCode}${p.mobile}`}
          onEdit={edit}
          onVerified={() => {
            setOtpOpen(false);
            p.onVerified();
          }}
        />
      )}
    </Field>
  );
}
