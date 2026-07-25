import {
  isValidPhoneNumber,
  parsePhoneNumber,
  type CountryCode,
} from "libphonenumber-js";

/**
 * Normalize a full E.164 string (+ and digits only).
 * Returns null when the value is not a plausible E.164 number.
 */
export const normalizePhoneE164 = (raw: string): string | null => {
  const trimmed = raw.trim().replace(/[\s()-]/g, "");
  if (!/^\+[1-9]\d{6,14}$/.test(trimmed)) return null;
  return trimmed;
};

/**
 * Validate + compose E.164 from an ISO country + user-typed national number.
 * Uses libphonenumber-js so validation is per-country correct, not length-only.
 * Returns null when the number is not valid for that country.
 */
export const composePhoneE164 = (
  countryCode: string,
  nationalNumber: string
): string | null => {
  const country = countryCode as CountryCode;
  const input = nationalNumber.trim();
  if (!input) return null;

  try {
    if (!isValidPhoneNumber(input, country)) return null;
    return parsePhoneNumber(input, country).number;
  } catch {
    return null;
  }
};
