import { useCallback, useMemo, useReducer, useState } from "react";
import { EMPTY_VALUES, type FieldName, type SignupPayload, type SignupValues } from "./types.ts";
import { buildPayload, isBoardApplicable, validateForm } from "./validation.ts";
import { submitSignup } from "./services/submitSignup.ts";

type Action =
  | { type: "set"; field: keyof SignupValues; value: string | boolean }
  | { type: "setMobile"; value: string }
  | { type: "setCountry"; value: string }
  | { type: "setGrade"; value: string }
  | { type: "verified" }
  | { type: "unverify" }
  | { type: "reset" };

function reducer(s: SignupValues, a: Action): SignupValues {
  switch (a.type) {
    case "set":
      return { ...s, [a.field]: a.value };
    case "setMobile": {
      const mobile = a.value.replace(/\D/g, "").slice(0, 14);
      // Any change to the number invalidates a previous verification.
      return { ...s, mobile, verifiedMobile: s.verifiedMobile === mobile ? s.verifiedMobile : null };
    }
    case "setCountry":
      return { ...s, countryCode: a.value, verifiedMobile: null };
    case "setGrade":
      // Board not applicable => clear it from state.
      return { ...s, grade: a.value, board: isBoardApplicable(a.value) ? s.board : "" };
    case "unverify":
      return { ...s, verifiedMobile: null };
    case "verified":
      return { ...s, verifiedMobile: s.mobile };
    case "reset":
      return EMPTY_VALUES;
  }
}

export type Status = "idle" | "submitting" | "success";

export function useSignupForm() {
  const [values, dispatch] = useReducer(reducer, EMPTY_VALUES);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [payload, setPayload] = useState<SignupPayload | null>(null);

  const errors = useMemo(() => validateForm(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  /** Error is shown once the field was touched or a submit was attempted. */
  const errorFor = (f: FieldName) => (touched[f] || submitAttempted ? errors[f] : undefined);
  const touch = useCallback((f: FieldName) => setTouched((t) => (t[f] ? t : { ...t, [f]: true })), []);

  const submit = async (): Promise<FieldName | null> => {
    if (status === "submitting") return null; // no duplicate submissions
    setSubmitAttempted(true);
    const order: FieldName[] = ["name", "mobile", "email", "grade", "targetExam", "board", "consent"];
    const firstInvalid = order.find((f) => errors[f]);
    if (firstInvalid) return firstInvalid;

    setStatus("submitting");
    setSubmitError(null);
    const built = buildPayload(values);
    try {
      const res = await submitSignup(built);
      if (res.ok) {
        setPayload(built);
        setStatus("success");
      } else {
        setSubmitError(res.error);
        setStatus("idle");
      }
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setStatus("idle");
    }
    return null;
  };

  const reset = () => {
    dispatch({ type: "reset" });
    setTouched({});
    setSubmitAttempted(false);
    setStatus("idle");
    setPayload(null);
    setSubmitError(null);
  };

  return { values, dispatch, errors, errorFor, touch, touched, submitAttempted, isValid, status, submit, submitError, payload, reset };
}
