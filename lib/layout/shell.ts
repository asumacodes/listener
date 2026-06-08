/** Fluid mobile-first shell — no fixed frame width. */

export const shellPaddingX =
  "px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]";

export const appShellClass = `w-full flex flex-col ${shellPaddingX}`;

/** Top bar inset — safe-area aware, shared by tab shell + capture flow headers. */
export const appShellHeaderClass =
  "shrink-0 pt-[max(1rem,env(safe-area-inset-top))] pb-2";

/** Fill tab layout content slot (parent already reserves tab-bar padding). */
export const captureScreenClass = `${appShellClass} min-h-0 flex-1 flex-col overflow-hidden`;

/** Playback / transcript flow — fill slot height; CtaBar pinned to bottom. */
export const flowScreenClass =
  "flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden";

export const appScrollClass =
  "flex flex-1 flex-col gap-3.5 overflow-y-auto scrollbar-hide pb-6 pt-2";

export const innerCardClass = "mx-auto w-full max-w-sm";
