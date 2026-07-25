import { getCountries, getCountryCallingCode } from "libphonenumber-js";

export type Country = {
  /** ISO 3166-1 alpha-2, e.g. "IN". */
  code: string;
  /** Calling code without +, e.g. "91". */
  dial: string;
  /** Localized display name, e.g. "India". */
  name: string;
};

const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const countryName = (code: string): string => {
  const label = regionNames?.of(code);
  return label && label !== code ? label : code;
};

/**
 * Full country list derived from libphonenumber-js (not hardcoded), sorted by
 * display name. Built once at module load.
 */
export const COUNTRIES: readonly Country[] = getCountries()
  .map((code) => ({
    code,
    dial: getCountryCallingCode(code),
    name: countryName(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export const DEFAULT_COUNTRY_CODE = "IN";

export const getCountry = (code: string): Country | undefined =>
  COUNTRIES.find((c) => c.code === code);

/** Case-insensitive match on name, ISO code, or dial code. */
export const filterCountries = (query: string): readonly Country[] => {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES;
  const digits = q.replace(/[^\d]/g, "");
  return COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (digits.length > 0 && c.dial.includes(digits))
  );
};
