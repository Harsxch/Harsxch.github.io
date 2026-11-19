import { useState } from "react";
import { updateAccount, type Account } from "../services/accountService.ts";
import { ProfileEditForm, splitMobile } from "./ProfileEditForm.tsx";
import { PencilIcon, ShieldIcon } from "./icons.tsx";

const maskMobile = (full: string) => {
  const { countryCode, mobile } = splitMobile(full);
  return `${countryCode} ${"•".repeat(Math.max(mobile.length - 4, 0))}${mobile.slice(-4)}`;
};
const maskEmail = (email: string) => {
  const [l, d] = email.split("@");
  return `${l[0]}${"•".repeat(Math.max(l.length - 1, 2))}@${d}`;
};
const lastVisit = (iso: string) => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
};

interface Props {
  account: Account;
  onAccountChange: (a: Account) => void;
  onContinue: () => void;
  onSwitchUser: () => void;
}

export function WelcomeBack({ account, onAccountChange, onContinue, onSwitchUser }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const first = account.name.trim().split(/\s+/)[0];
  const initials = account.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  const save = async (next: Account) => {
    setSaving(true);
    const stored = await updateAccount(next);
    setSaving(false);
    onAccountChange(stored);
    setEditing(false);
    setSaved(true);
  };

  const rows: [string, string][] = [
    ["Grade", account.grade],
    ["Target exam", account.target_exam],
    ...(account.board ? ([["Board", account.board]] as [string, string][]) : []),
    ["Location", `${account.city}, ${account.state}`],
    ["Mobile", maskMobile(account.mobile)],
    ["Email", maskEmail(account.email)],
  ];

  return (
    <div className="welcome">
      <header className="head">
        <div className="wordmark" aria-label="Vedantu">Vedantu</div>
        <div className="avatar" aria-hidden="true">{initials}</div>
        <h1 id="returning-title">Welcome back, <span>{first}</span>!</h1>
        <p className="sub">Last visit {lastVisit(account.last_visit)}</p>
      </header>

      {editing ? (
        <ProfileEditForm account={account} saving={saving} onSave={save} onCancel={() => setEditing(false)} />
      ) : (
        <>
          <div className="profile" aria-label="Your saved details">
            <div className="profile-head">
              <h2>Your details</h2>
              <button type="button" className="link-btn edit" onClick={() => { setSaved(false); setEditing(true); }}>
                <PencilIcon width={14} height={14} /> Edit
              </button>
            </div>
            <dl>
              {rows.map(([k, val]) => (
                <div key={k} className="kv">
                  <dt>{k}</dt>
                  <dd>{val}</dd>
                </div>
              ))}
            </dl>
          </div>
          {saved && <p className="msg ok" role="status">Details updated.</p>}
          <p className="confirm-note">Moved to a new class or changed your goal? Tap Edit to keep your plan accurate.</p>
          <button type="button" className="cta idle" onClick={onContinue}>Continue</button>
          <button type="button" className="link-btn not-you" onClick={onSwitchUser}>Not {first}? Use a different number</button>
        </>
      )}
      <p className="secure">
        <ShieldIcon width={16} height={16} /> <span><strong>100% SAFE &amp; SECURE,</strong> we never post without your permission</span>
      </p>
    </div>
  );
}
