/** Composed Tailwind class strings — mockup-aligned, no custom CSS files. */

export const ui = {
  eyebrow: "text-[11px] font-medium uppercase tracking-[0.18em] text-muted",
  textLink:
    "cursor-pointer border-0 bg-transparent p-0 font-sans text-sm font-medium text-gold hover:brightness-110",
  flowRelink: "border-0 bg-transparent p-0 font-sans text-[13px] text-gold",
  shadowCard: "shadow-card",
  card: "rounded-2xl border border-border bg-surface shadow-card",
  flowTitle:
    "font-serif text-[30px] leading-[1.12] tracking-[-0.01em] text-text",
  /** Tab-shell page title (Account, Settings, Projects, …). */
  shellPageTitle:
    "font-serif text-[27px] leading-tight tracking-tight text-text",
  /** Capture flow — bare in-flow wordmark (Recording → Pipeline). */
  shellWordmarkFlow:
    "font-serif text-2xl leading-none tracking-[-0.01em] text-gold",
  /** Idle hub — wordmark with search + avatar utilities. */
  shellWordmarkCapture:
    "font-serif text-[30px] leading-none tracking-tight text-gold",
} as const;
