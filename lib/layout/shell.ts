/** Fluid mobile-first shell — no fixed frame width. */

export const shellPaddingX =
  "px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]";

export const appShellClass = `w-full min-h-dvh flex flex-col ${shellPaddingX}`;

export const appScrollClass =
  "flex flex-1 flex-col gap-3.5 overflow-y-auto pb-6 pt-2";

export const innerCardClass = "mx-auto w-full max-w-sm";
