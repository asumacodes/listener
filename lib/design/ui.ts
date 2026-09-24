/** Composed Tailwind class strings — mockup-aligned, no custom CSS files. */

export const ui = {
  eyebrow: "text-[11px] font-medium uppercase tracking-[0.18em] text-muted",
  textLink:
    "cursor-pointer border-0 bg-transparent p-0 font-sans text-sm font-medium text-gold hover:brightness-110",
  flowRelink: "border-0 bg-transparent p-0 font-sans text-[13px] text-gold",
  shadowCard: "shadow-card",
  card: "rounded-2xl border border-border bg-surface shadow-card",
  /** Idea detail cards — border only, no elevation shadow. */
  cardFlat: "rounded-2xl border border-border bg-surface",
  /** Grouped results list shell (idea detail complete dashboard). */
  resultsStack: "overflow-hidden rounded-2xl border border-border bg-surface",
  /** Row inside resultsStack — separator between items, never after the last. */
  resultsRow: "border-b border-border last:border-b-0",
  /** Section label inside an open result — desktop reading-pane SECTION_LABEL at phone scale. */
  sectionLabel: "font-serif text-[12px] tracking-[0.16em] text-gold uppercase",
  /** Serif figure for numbers/names — desktop 28px stepped down for phone. */
  figureLg: "font-serif text-[26px] leading-none text-text",
  /** Reading prose inside an open result. */
  bodyProse: "text-[15px] leading-relaxed text-text-secondary",
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
  /** Empty-state icon halo — mockup `.empty-mark`. */
  emptyMark:
    "grid h-16 w-16 place-items-center rounded-full bg-gold-10 text-gold shadow-[0_0_0_6px_#C9A96E26]",
  /** Bottom sheet panel — always pure white, elevated above canvas. */
  sheet: "rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(26,26,26,0.16)]",
} as const;
