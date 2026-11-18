import type { ReactNode } from "react";
import { AlertIcon } from "./icons.tsx";

interface Props {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Visible label + control + inline error. Labels stay visible after input. */
export function Field({ id, label, error, hint, children, className }: Props) {
  return (
    <div className={`field${error ? " has-error" : ""}${className ? ` ${className}` : ""}`} data-field={id}>
      <label className="label" htmlFor={id}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="msg error" id={`${id}-error`} role="alert">
          <AlertIcon /> {error}
        </p>
      ) : (
        hint
      )}
    </div>
  );
}
