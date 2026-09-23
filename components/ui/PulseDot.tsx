type PulseDotProps = {
  /** sm: 8px (pills, inline) · md: 10px (cards, phase marks). */
  size?: "sm" | "md";
  className?: string;
};

/**
 * The one "still working" dot — gold, gently pulsing, static under
 * prefers-reduced-motion. Decorative: the copy next to it says what's pending.
 */
const PulseDot = ({ size = "sm", className = "" }: PulseDotProps) => (
  <span
    aria-hidden
    className={`shrink-0 rounded-full bg-gold motion-safe:animate-dot-pulse ${
      size === "md" ? "h-2.5 w-2.5" : "h-2 w-2"
    } ${className}`}
  />
);

export default PulseDot;
