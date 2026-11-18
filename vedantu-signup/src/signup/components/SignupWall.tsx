import { useEffect, useState, type FormEvent } from "react";
import { useSignupForm } from "../useSignupForm.ts";
import { isBoardApplicable } from "../validation.ts";
import { BoardDropdown } from "./BoardDropdown.tsx";
import { ConsentCheckbox } from "./ConsentCheckbox.tsx";
import { EmailInput } from "./EmailInput.tsx";
import { GradeDropdown } from "./GradeDropdown.tsx";
import { MobileInput } from "./MobileInput.tsx";
import { ShieldIcon } from "./icons.tsx";
import { SignupHeader } from "./SignupHeader.tsx";
import { SubmitButton } from "./SubmitButton.tsx";
import { SuccessState } from "./SuccessState.tsx";
import { TargetExamDropdown } from "./TargetExamDropdown.tsx";
import { TextInput } from "./TextInput.tsx";

const POINTS = [
  "Live classes with teachers who know your name",
  "Doubt solving whenever you get stuck",
  "Practice and plans built around your exam",
];

export function SignupWall() {
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
    <main className="page">
      <div className="shell">
        <section className="card" aria-labelledby="signup-title">
          {showSuccess && f.payload ? (
            <SuccessState payload={f.payload} onReset={() => { setShowSuccess(false); f.reset(); }} />
          ) : (
            <>
              <SignupHeader />
              <form noValidate onSubmit={onSubmit} className="form">
                <TextInput
                  id="name"
                  label="Name"
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
                <ShieldIcon width={16} height={16} /> <strong>100% SAFE &amp; SECURE,</strong> we never post without your permission
              </p>
            </>
          )}
        </section>

        <aside className="panel" aria-label="Why Vedantu">
          <div className="panel-inner">
            <p className="eyebrow">Learn with Vedantu</p>
            <h2>Learning that gives you the attention you deserve.</h2>
            <ul>
              {POINTS.map((p) => (
                <li key={p}>
                  <span className="tick" aria-hidden="true">✓</span> {p}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
