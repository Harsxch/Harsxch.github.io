import type { InputHTMLAttributes } from "react";
import { Field } from "./Field.tsx";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "id"> {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

export function TextInput({ id, label, value, error, onChange, ...rest }: Props) {
  return (
    <Field id={id} label={label} error={error}>
      <input
        {...rest}
        id={id}
        className="control"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
    </Field>
  );
}
