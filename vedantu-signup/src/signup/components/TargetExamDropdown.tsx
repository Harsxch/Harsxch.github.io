import { TARGET_EXAMS } from "../constants.ts";
import { SearchableDropdown } from "./SearchableDropdown.tsx";

const OPTIONS = TARGET_EXAMS.map((value) => ({ value }));

interface Props { value: string; error?: string; onChange: (v: string) => void; onBlur: () => void }

export function TargetExamDropdown({ value, error, onChange, onBlur }: Props) {
  return (
    <SearchableDropdown
      id="targetExam"
      label="Target exam"
      placeholder="Select your target exam"
      searchPlaceholder="Search exams"
      options={OPTIONS}
      value={value}
      error={error}
      emptyText="No exam found. Try “Other”."
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
