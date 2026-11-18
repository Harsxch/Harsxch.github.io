import { BOARDS } from "../constants.ts";
import { SearchableDropdown } from "./SearchableDropdown.tsx";

interface Props { value: string; error?: string; onChange: (v: string) => void; onBlur: () => void }

export function BoardDropdown({ value, error, onChange, onBlur }: Props) {
  return (
    <SearchableDropdown
      id="board"
      label="Board"
      placeholder="Select your board"
      searchPlaceholder="Search board, e.g. CBSE or Kerala"
      options={BOARDS}
      value={value}
      error={error}
      emptyText="No board found. Try “Other”."
      onChange={onChange}
      onBlur={onBlur}
    />
  );
}
