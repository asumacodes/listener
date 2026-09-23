type SpinnerSize = "sm" | "md" | "lg";
type SpinnerTone = "gold" | "current";

type SpinnerProps = {
  /** sm: inline in a button · md: 40px page/auth beat · lg: 72px hero ring. */
  size?: SpinnerSize;
  /** gold ring on a faint gold track, or inherit the text colour (buttons). */
  tone?: SpinnerTone;
  /**
   * Announced label (role="status"). Omit when surrounding text already says
   * what's happening — e.g. a button reading "Opening checkout…".
   */
  label?: string;
  className?: string;
};

const SIZE: Record<SpinnerSize, string> = {
  sm: "h-4 w-4",
  md: "h-10 w-10",
  lg: "h-[72px] w-[72px]",
};

const TONE: Record<SpinnerTone, string> = {
  gold: "border-gold/20 border-t-gold",
  current: "border-current/25 border-t-current",
};

/**
 * The one spinner. A thin ring that spins with motion-safe:animate-spin-slow,
 * so it is static under prefers-reduced-motion without a JS hook.
 */
const Spinner = ({
  size = "md",
  tone = "gold",
  label,
  className = "",
}: SpinnerProps) => (
  <span
    {...(label
      ? { role: "status", "aria-label": label }
      : { "aria-hidden": true })}
    className={`inline-block shrink-0 rounded-full border-2 motion-safe:animate-spin-slow ${SIZE[size]} ${TONE[tone]} ${className}`}
  />
);

export default Spinner;
