/**
 * State -> city options for India (36 states/UTs, ~4,200 cities).
 * Source: open-source `country-state-city` dataset (ISC licence) exported to
 * data/india-cities.json, plus a few common spellings added (e.g. Kochi,
 * Gurugram). City names are as in that dataset and may differ from Vedantu's.
 * Tech: replace with Vedantu's canonical location master data.
 */
import cityData from "./data/india-cities.json" with { type: "json" };

export const LOCATIONS: Record<string, string[]> = cityData;

export const OTHER_CITY = "Other";

export const STATES = Object.keys(LOCATIONS).sort((a, b) => a.localeCompare(b));

export const citiesFor = (state: string): string[] =>
  LOCATIONS[state] ? [...LOCATIONS[state], OTHER_CITY] : [];
