const keyFor = (userId: string) =>
  `listener:profile-prompt-dismissed:${userId}`;

/** Fail-open: unreadable storage counts as not-dismissed. */
export const readProfilePromptDismissed = (userId: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(keyFor(userId)) === "1";
  } catch {
    return false;
  }
};

export const writeProfilePromptDismissed = (userId: string): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(userId), "1");
  } catch {
    // Fail-open: in-memory hide in the hook still covers this mount.
  }
};
