import { useMemo, useState, type FormEvent } from "react";
import { COUNTRY_CODES } from "../constants.ts";
import type { Account } from "../services/accountService.ts";
import { EMPTY_VALUES, type FieldName, type SignupValues } from "../types.ts";
import { isBoardApplicable, validateForm } from "../validation.ts";
import { BoardDropdown } from "./BoardDropdown.tsx";
import { EmailInput } from "./EmailInput.tsx";
import { GradeDropdown } from "./GradeDropdown.tsx";
import { LocationDropdowns } from "./LocationDropdowns.tsx";
import { TargetExamDropdown } from "./TargetExamDropdown.tsx";
import { TextInput } from "./TextInput.tsx";

/** Split "+919876543210" into country code + national number. */
export function splitMobile(full: string) {
  const code = [...COUNTRY_CODES].map((c) => c.code).sort((a, b) => b.length - a.length).find((c) => full.startsWith(c)) ?? "+91";
  return { countryCode: code, mobile: full.slice(code.length) };
}

const toValues = (a: Account): SignupValues => ({
  ...EMPTY_VALUES,
  ...splitMobile(a.mobile),
  verifiedMobile: splitMobile(a.mobile).mobile, // identity already verified at login
  name: a.name,
  email: a.email,
  grade: a.grade,
  targetExam: a.target_exam,
  board: a.board ?? "",
  state: a.state,
  city: a.city,
  consent: true,
});

interface Props {
  account: Account;
  saving: boolean;
  onSave: (next: Account) => void;
  onCancel: () => void;
}

/** Edit saved profile. Mobile is the login identity and is not editable here. */
export function ProfileEditForm({ account, saving, onSave, onCancel }: Props) {
  const [v, setV] = useState<SignupValues>(() => toValues(account));
  const [attempted, setAttempted] = useState(false);
  const errors = useMemo(() => validateForm(v), [v]);
  const err = (f: FieldName) => (attempted ? errors[f] : undefined);
  const set = <K extends keyof SignupValues>(k: K, value: SignupValues[K]) => setV((s) => ({ ...s, [k]: value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setAttempted(true);
    if (Object.keys(errors).length || saving) return;
    const next: Account = {
      ...account,
      name: v.name.trim(),
      email: v.email.trim(),
      grade: v.grade,
      target_exam: v.targetExam,
      state: v.state,
      city: v.city,
    };
    if (isBoardApplicable(v.grade) && v.board) next.board = v.board;
    else delete next.board;
    onSave(next);
  };

  return (
    <form noValidate onSubmit={submit} className="form">
      <TextInput id="name" label="Full name" autoComplete="name" value={v.name} error={err("name")} onChange={(x) => set("name", x)} />
      <EmailInput value={v.email} error={err("email")} showSuggestion={attempted} onChange={(x) => set("email", x)} onBlur={() => {}} />
      <div className="row">
        <GradeDropdown
          value={v.grade}
          error={err("grade")}
          onChange={(x) => setV((s) => ({ ...s, grade: x, board: isBoardApplicable(x) ? s.board : "" }))}
          onBlur={() => {}}
        />
        <TargetExamDropdown value={v.targetExam} error={err("targetExam")} onChange={(x) => set("targetExam", x)} onBlur={() => {}} />
      </div>
      {isBoardApplicable(v.grade) && (
        <div className="reveal">
          <BoardDropdown value={v.board} error={err("board")} onChange={(x) => set("board", x)} onBlur={() => {}} />
        </div>
      )}
      <LocationDropdowns
        state={v.state}
        city={v.city}
        stateError={err("state")}
        cityError={err("city")}
        onState={(x) => setV((s) => ({ ...s, state: x, city: x === s.state ? s.city : "" }))}
        onCity={(x) => set("city", x)}
        onStateBlur={() => {}}
        onCityBlur={() => {}}
      />
      <div className="edit-actions">
        <button type="button" className="secondary" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="cta idle edit-save" aria-busy={saving}>
          {saving && <span className="spinner" aria-hidden="true" />}
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
