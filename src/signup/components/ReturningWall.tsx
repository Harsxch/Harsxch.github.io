import { useState } from "react";
import { DEMO_MOBILE, findAccountByMobile, type Account } from "../services/accountService.ts";
import { validateMobile } from "../validation.ts";
import { MobileInput } from "./MobileInput.tsx";
import { PageShell } from "./PageShell.tsx";
import { CheckIcon } from "./icons.tsx";
import { WelcomeBack } from "./WelcomeBack.tsx";

type Phase = "login" | "lookup" | "welcome" | "notfound" | "done";

/**
 * Returning-student flow: verify mobile with OTP -> look up account -> welcome back.
 * The account lookup only runs after OTP verification.
 */
export function ReturningWall({ onSignUp }: { onSignUp: () => void }) {
  const [phase, setPhase] = useState<Phase>("login");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [verified, setVerified] = useState(false);
  const [touched, setTouched] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);

  const reset = () => {
    setPhase("login");
    setMobile("");
    setVerified(false);
    setTouched(false);
    setAccount(null);
  };

  const onVerified = async () => {
    setVerified(true);
    setPhase("lookup");
    const found = await findAccountByMobile(`${countryCode}${mobile}`);
    if (found) {
      setAccount(found);
      setPhase("welcome");
    } else {
      setPhase("notfound");
    }
  };

  return (
    <PageShell
      labelledBy="returning-title"
      eyebrow="Welcome back"
      heading="Pick up right where you left off."
    >
      {phase === "welcome" && account && (
        <WelcomeBack
          account={account}
          onAccountChange={setAccount}
          onContinue={() => setPhase("done")}
          onSwitchUser={reset}
        />
      )}

      {phase === "done" && account && (
        <div className="success" role="status">
          <div className="success-mark"><CheckIcon width={28} height={28} strokeWidth={3} /></div>
          <h2>You’re signed in, {account.name.split(" ")[0]}!</h2>
          <p>Demo only: here the student would land on their personalised learning dashboard.</p>
          <div className="success-actions">
            <button type="button" className="secondary" onClick={reset}>Back to login</button>
          </div>
        </div>
      )}

      {(phase === "login" || phase === "lookup" || phase === "notfound") && (
        <>
          <header className="head">
            <div className="wordmark" aria-label="Vedantu">Vedantu</div>
            <h1 id="returning-title">Welcome <span>back</span></h1>
            <p className="sub">Enter your mobile number to sign in.</p>
          </header>

          <div className="form">
            <MobileInput
              countryCode={countryCode}
              mobile={mobile}
              verified={verified}
              error={touched ? validateMobile(countryCode, mobile) : undefined}
              onCountryCode={setCountryCode}
              onMobile={setMobile}
              onVerified={onVerified}
              onUnverify={() => { setVerified(false); setAccount(null); setPhase("login"); }}
              onBlur={() => setTouched(true)}
            />

            {phase === "login" && (
              <p className="demo-banner">
                <strong>Demo:</strong> try the sample account <code>{DEMO_MOBILE.slice(3)}</code>, or the number you just signed up with.
              </p>
            )}

            {phase === "lookup" && (
              <p className="msg muted lookup" role="status"><span className="spinner dark" aria-hidden="true" /> Finding your account…</p>
            )}

            {phase === "notfound" && (
              <div className="notfound" role="alert">
                <strong>We couldn’t find an account with this number.</strong>
                <span>New to Vedantu? Create your account in under a minute.</span>
                <button type="button" className="cta idle" onClick={onSignUp}>Sign up as a new student</button>
              </div>
            )}
          </div>
        </>
      )}
    </PageShell>
  );
}
