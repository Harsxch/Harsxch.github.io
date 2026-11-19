import { useEffect, useState, type FormEvent } from "react";
import { useSignupForm } from "../useSignupForm.ts";
import { isBoardApplicable } from "../validation.ts";
import { BoardDropdown } from "./BoardDropdown.tsx";
import { ConsentCheckbox } from "./ConsentCheckbox.tsx";
import { EmailInput } from "./EmailInput.tsx";
import { GradeDropdown } from "./GradeDropdown.tsx";
import { LocationDropdowns } from "./LocationDropdowns.tsx";
import { PageShell } from "./PageShell.tsx";
import { MobileInput } from "./MobileInput.tsx";
import { ShieldIcon } from "./icons.tsx";
import { SignupHeader } from "./SignupHeader.tsx";
import { SubmitButton } from "./SubmitButton.tsx";
import { SuccessState } from "./SuccessState.tsx";
import { TargetExamDropdown } from "./TargetExamDropdown.tsx";
import { TextInput } from "./TextInput.tsx";

export function SignupWall({ onSeeReturning }: { onSeeReturning?: () => void }) {
  const f = useSignupForm();
  const { values: v, errors } = f;
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (f.status !== "success") return;
    const t = setTimeout(() => setShowSuccess(true), 700);
    return () => clearTimeout(t);
  }, [f.status]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const firstInvalid = await f.submit();
    if (firstInvalid) {
      const el = document.querySelector<HTMLElement>(`[data-field="${firstInvalid}"]`);
      el?.scrollIntoView({ block: "center", behavior: "smooth" });
      el?.querySelector<HTMLElement>("input, select")?.focus({ preventScroll: true });
    }
  };

  const onlyMobileUnverified =
    f.errors.mobile?.startsWith("Verify") && Object.keys(f.errors).length === 1;
  const hint = f.isValid
    ? null
    : onlyMobileUnverified
      ? "Verify your mobile number to continue"
      : "Fill in all required fields to continue";

  return (
    <PageShell labelledBy="signup-title">
          {showSuccess && f.payload ? (
            <SuccessState payload={f.payload} onReset={() => { setShowSuccess(false); f.reset(); }} onSeeReturning={onSeeReturning} />
          ) : (
            <>
              <SignupHeader />
              <form noValidate onSubmit={onSubmit} className="form">
                <TextInput
                  id="name"
                  label="Full name"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  value={v.name}
                  error={f.errorFor("name")}
                  onChange={(value) => f.dispatch({ type: "set", field: "name", value })}
                  onBlur={() => f.touch("name")}
                />

                <MobileInput
                  countryCode={v.countryCode}
                  mobile={v.mobile}
                  verified={v.verifiedMobile === v.mobile && v.mobile !== ""}
                  error={f.errorFor("mobile")}
                  onCountryCode={(value) => f.dispatch({ type: "setCountry", value })}
                  onMobile={(value) => f.dispatch({ type: "setMobile", value })}
                  onVerified={() => f.dispatch({ type: "verified" })}
                  onUnverify={() => f.dispatch({ type: "unverify" })}
                  onBlur={() => f.touch("mobile")}
                />

                <EmailInput
                  value={v.email}
                  error={f.errorFor("email")}
                  showSuggestion={!!(f.touched.email || f.submitAttempted)}
                  onChange={(value) => f.dispatch({ type: "set", field: "email", value })}
                  onBlur={() => f.touch("email")}
                />

                <div className="row">
                  <GradeDropdown
                    value={v.grade}
                    error={f.errorFor("grade")}
                    onChange={(value) => { f.dispatch({ type: "setGrade", value }); f.touch("grade"); }}
                    onBlur={() => f.touch("grade")}
                  />
                  <TargetExamDropdown
                    value={v.targetExam}
                    error={f.errorFor("targetExam")}
                    onChange={(value) => { f.dispatch({ type: "set", field: "targetExam", value }); f.touch("targetExam"); }}
                    onBlur={() => f.touch("targetExam")}
                  />
                </div>

                {isBoardApplicable(v.grade) && (
                  <div className="reveal">
                    <BoardDropdown
                      value={v.board}
                      error={f.errorFor("board")}
                      onChange={(value) => { f.dispatch({ type: "set", field: "board", value }); f.touch("board"); }}
                      onBlur={() => f.touch("board")}
                    />
                  </div>
                )}

                <LocationDropdowns
                  state={v.state}
                  city={v.city}
                  stateError={f.errorFor("state")}
                  cityError={f.errorFor("city")}
                  onState={(value) => { f.dispatch({ type: "setState", value }); f.touch("state"); }}
                  onCity={(value) => { f.dispatch({ type: "set", field: "city", value }); f.touch("city"); }}
                  onStateBlur={() => f.touch("state")}
                  onCityBlur={() => f.touch("city")}
                />

                <ConsentCheckbox
                  checked={v.consent}
                  error={f.errorFor("consent")}
                  onChange={(value) => f.dispatch({ type: "set", field: "consent", value })}
                  onBlur={() => f.touch("consent")}
                />

                <div className="cta-wrap">
                  <SubmitButton status={f.status} ready={f.isValid} />
                  {f.submitError && <p className="msg error" role="alert">{f.submitError}</p>}
                  {hint && f.status === "idle" && <p className="cta-hint">{hint}</p>}
                </div>
              </form>
              <p className="secure">
                <ShieldIcon width={16} height={16} /> <span><strong>100% SAFE &amp; SECURE,</strong> we never post without your permission</span>
              </p>
            </>
          )}
    </PageShell>
  );
}
