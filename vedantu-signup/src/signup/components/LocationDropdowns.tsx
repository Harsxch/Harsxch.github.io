import { citiesFor, STATES } from "../locations.ts";
import { SearchableDropdown } from "./SearchableDropdown.tsx";

const STATE_OPTIONS = STATES.map((value) => ({ value }));

interface Props {
  state: string;
  city: string;
  stateError?: string;
  cityError?: string;
  onState: (v: string) => void;
  onCity: (v: string) => void;
  onStateBlur: () => void;
  onCityBlur: () => void;
}

export function LocationDropdowns(p: Props) {
  const cityOptions = citiesFor(p.state).map((value) => ({ value }));
  return (
    <div className="row">
      <SearchableDropdown
        id="state"
        label="State"
        placeholder="Select your state"
        searchPlaceholder="Search state"
        options={STATE_OPTIONS}
        value={p.state}
        error={p.stateError}
        emptyText="No state found"
        onChange={p.onState}
        onBlur={p.onStateBlur}
      />
      <SearchableDropdown
        id="city"
        label="City"
        placeholder={p.state ? "Select your city" : "Select state first"}
        searchPlaceholder="Search city"
        options={cityOptions}
        value={p.city}
        error={p.cityError}
        disabled={!p.state}
        emptyText="No city found. Try “Other”."
        onChange={p.onCity}
        onBlur={p.onCityBlur}
      />
    </div>
  );
}
