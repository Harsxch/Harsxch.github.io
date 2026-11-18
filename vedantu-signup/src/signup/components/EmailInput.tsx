import { TextInput } from "./TextInput.tsx";
import { suggestEmail } from "../validation.ts";

interface Props {
  value: string;
  error?: string;
  /** Show the typo suggestion only after the user leaves the field / submits. */
  showSuggestion: boolean;
  onChange: (v: string) => void;
  onBlur: () => void;
}

export function EmailInput({ value, error, showSuggestion, onChange, onBlur }: Props) {
  const suggestion = showSuggestion && !error ? suggestEmail(value) : null;
  return (
    <div>
      <TextInput
        id="email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="name@example.com"
        value={value}
        error={error}
        onChange={onChange}
        onBlur={onBlur}
      />
      {suggestion && (
        <p className="msg suggest" role="status">
          Did you mean <strong>{suggestion}</strong>?{" "}
          <button
            type="button"
            className="link-btn"
            // mousedown: apply before the field blur can shift the layout under the pointer.
            onMouseDown={(e) => { e.preventDefault(); onChange(suggestion); }}
            onClick={(e) => { if (e.detail === 0) onChange(suggestion); }} // keyboard activation
          >
            Use this
          </button>
        </p>
      )}
    </div>
  );
}
