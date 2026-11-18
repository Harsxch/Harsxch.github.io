import type { SignupPayload } from "../types.ts";
import { CheckIcon } from "./icons.tsx";

export function SuccessState({ payload, onReset }: { payload: SignupPayload; onReset: () => void }) {
  return (
    <div className="success" role="status">
      <div className="success-mark"><CheckIcon width={28} height={28} strokeWidth={3} /></div>
      <h2>Welcome, {payload.name.split(" ")[0]}!</h2>
      <p>Your details are saved. Next, we’d take you to your personalised learning plan.</p>
      <details className="payload" open>
        <summary>Demo submission payload</summary>
        <pre>{JSON.stringify(payload, null, 2)}</pre>
        <p className="muted small">Demo only: nothing was sent to any server.</p>
      </details>
      <button type="button" className="secondary" onClick={onReset}>Start over</button>
    </div>
  );
}
