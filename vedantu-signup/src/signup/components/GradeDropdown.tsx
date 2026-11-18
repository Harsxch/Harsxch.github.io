import { GRADES } from "../constants.ts";
import { SearchableDropdown } from "./SearchableDropdown.tsx";

const OPTIONS = GRADES.map((value) => ({ value }));

interface Props { value: string; error?: string; onChange: (v: string) => void; onBlur: () => void }

export function GradeDropdown({ value, error, onChange, onBlur }: Props) {
  return (
    <SearchableDropdown
      id="grade"
      label="Grade"
      placeholder="Select your grade"
      options={OPTIONS}
      value={value}
      error={error}
      searchable={false}
      clearable={false}
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
