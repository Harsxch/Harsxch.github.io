import { PRIVACY_URL, TERMS_URL } from "../constants.ts";
import { AlertIcon, CheckIcon } from "./icons.tsx";

interface Props { checked: boolean; error?: string; onChange: (v: boolean) => void; onBlur: () => void }

export function ConsentCheckbox({ checked, error, onChange, onBlur }: Props) {
  return (
    <div className={`consent${error ? " has-error" : ""}`} data-field="consent">
      <label className="consent-row">
        <input
          id="consent"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? "consent-error" : undefined}
        />
        <span className="box" aria-hidden="true"><CheckIcon width={14} height={14} strokeWidth={3} /></span>
        <span className="consent-text">
          I agree to receive communications from Vedantu regarding courses, educational opportunities, and relevant
          updates. I have read and agree to Vedantu’s{" "}
          <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">Privacy Policy</a> and{" "}
          <a href={TERMS_URL} target="_blank" rel="noopener noreferrer">Terms &amp; Conditions</a>.
        </span>
      </label>
      {error && (
        <p className="msg error" id="consent-error" role="alert"><AlertIcon /> {error}</p>
      )}
    </div>
  );
}
