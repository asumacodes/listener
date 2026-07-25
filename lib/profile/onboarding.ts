/**
 * First-run onboarding: a display name that is empty or still the phone
 * fallback from handle_new_user counts as incomplete.
 */

export const isPlaceholderDisplayName = (
  displayName: string | null | undefined,
  phone: string | null | undefined = null
): boolean => {
  const name = displayName?.trim() ?? "";
  if (!name) return true;

  const nameDigits = name.replace(/\D/g, "");
  const phoneDigits = phone?.replace(/\D/g, "") ?? "";

  if (phoneDigits.length >= 8 && nameDigits === phoneDigits) return true;

  // E.164 / digit-only stubs (e.g. "918950494219", "+91 89504 94219")
  if (/^\+?\d[\d\s-]{7,}$/.test(name) && nameDigits.length >= 8) return true;

  return false;
};

export const needsOnboarding = (
  displayName: string | null | undefined,
  phone: string | null | undefined = null
): boolean => isPlaceholderDisplayName(displayName, phone);
