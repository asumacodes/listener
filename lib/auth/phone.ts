export type PhoneCountry = {
  code: string;
  dial: string;
  label: string;
};

/** Early-user set — not a full country catalog. Default is India. */
export const PHONE_COUNTRIES: readonly PhoneCountry[] = [
  { code: "IN", dial: "91", label: "India" },
  { code: "US", dial: "1", label: "United States" },
  { code: "GB", dial: "44", label: "United Kingdom" },
  { code: "AE", dial: "971", label: "United Arab Emirates" },
  { code: "SG", dial: "65", label: "Singapore" },
] as const;

export const DEFAULT_PHONE_COUNTRY_CODE = "IN";

export const getPhoneCountry = (code: string): PhoneCountry | undefined =>
  PHONE_COUNTRIES.find((c) => c.code === code);

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
 * Compose E.164 from ISO country code + national digits.
 * Strips spaces/dashes and a leading trunk `0` (common for IN).
 */
export const composePhoneE164 = (
  countryCode: string,
  nationalNumber: string
): string | null => {
  const country = getPhoneCountry(countryCode);
  if (!country) return null;

  let digits = nationalNumber.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }
  if (digits.length < 6 || digits.length > 12) return null;

  return normalizePhoneE164(`+${country.dial}${digits}`);
};
