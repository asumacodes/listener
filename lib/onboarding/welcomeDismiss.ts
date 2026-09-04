const keyFor = (userId: string) => `listener:welcome-dismissed:${userId}`;

/** Fail-open: private mode / some PWA webviews throw — treat as not dismissed. */
export const readWelcomeDismissed = (userId: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(keyFor(userId)) === "1";
  } catch {
    return false;
  }
};

export const writeWelcomeDismissed = (userId: string): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(keyFor(userId), "1");
  } catch {
    // Fail-open: in-memory dismiss in the hook still hides for this mount.
  }
};
