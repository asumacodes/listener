export type UserProfile = {
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
  /** Raw display_name is empty or a phone-digit stub — not the resolved UI name. */
  needsOnboarding: boolean;
};
