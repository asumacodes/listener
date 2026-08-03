/**
 * Typed mirror of design tokens.
 * Authoritative runtime sources: Tailwind theme (`tailwind.config.ts`) +
 * CSS vars in `app/globals.css` `:root`. Do not introduce a third source —
 * keep these hex values in sync when editing either of those.
 */
export const designTokens = {
  canvas: "#FAFAF7",
  surface: "#FFFFFF",
  text: "#1A1A1A",
  textSecondary: "#5C564F",
  muted: "#9B9B9B",
  gold: "#C9A96E",
  onGold: "#FFFFFF",
  red: "#E85454",
  border: "#EBEBEB",
  errorSurface: "#FDECEC",
  successSurface: "#ECF7F0",
  successText: "#2F7D52",
  gold10: "#C9A96E1A",
  gold15: "#C9A96E26",
  gold30: "#C9A96E4D",
  scrim: "rgba(26, 26, 26, 0.45)",
  cardShadow: "0 2px 24px rgba(26, 26, 26, 0.06)",
  recordGlow: "0 8px 28px rgba(201, 169, 110, 0.16)",
} as const;

export const layoutSpacing = {
  shellPadding: "max(1.25rem, env(safe-area-inset-left))",
} as const;

export const motionDurations = {
  screenEnter: 0.25,
  bottomSheet: 0.28,
  buttonPress: 0.08,
  recordBreathe: 3,
  recordPulse: 2,
} as const;
