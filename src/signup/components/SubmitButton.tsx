import { CheckIcon } from "./icons.tsx";

interface Props {
  status: "idle" | "submitting" | "success";
  /** Visually disabled until all mandatory conditions are met. Click still reveals errors. */
  ready: boolean;
}

export function SubmitButton({ status, ready }: Props) {
  const label =
    status === "submitting" ? "Submitting…" : status === "success" ? "You’re in!" : "Continue";
  return (
    <button
      type="submit"
      className={`cta ${status}${ready ? "" : " not-ready"}`}
      aria-disabled={!ready || status !== "idle"}
      aria-busy={status === "submitting"}
    >
      {status === "submitting" && <span className="spinner" aria-hidden="true" />}
      {status === "success" && <CheckIcon />}
      {label}
    </button>
  );
}
