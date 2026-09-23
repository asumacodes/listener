/**
 * Inline busy ring for a button's own pending state. Inherits the button's
 * text colour; static under reduced motion. Decorative — the button's label
 * ("Opening checkout…") carries the meaning.
 */
const ButtonSpinner = () => (
  <span
    aria-hidden
    className="h-4 w-4 shrink-0 rounded-full border-2 border-current/25 border-t-current motion-safe:animate-spin-slow"
  />
);

export default ButtonSpinner;
