import type { ReactNode } from "react";

/** Three grey window dots — mockup chrome on loading-state cards. */
export const WindowChrome = () => (
  <div className="flex gap-1.5" aria-hidden>
    <span className="h-1.5 w-1.5 rounded-full bg-border" />
    <span className="h-1.5 w-1.5 rounded-full bg-border" />
    <span className="h-1.5 w-1.5 rounded-full bg-border" />
  </div>
);

type LoadingStateCardProps = {
  illustration: ReactNode;
  eyebrow: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

/**
 * Mockup “In the App” card — 150px illustration slot, copy stack, optional footer.
 * Used by RehydrationSplash (ill-6).
 */
const LoadingStateCard = ({
  illustration,
  eyebrow,
  title,
  subtitle,
  footer,
  className = "",
}: LoadingStateCardProps) => (
  <div
    className={`relative w-full max-w-sm rounded-[20px] border border-border bg-canvas px-8 py-9 text-center shadow-card ${className}`}
  >
    <div className="absolute top-4 left-4">
      <WindowChrome />
    </div>

    <div className="mx-auto flex h-[150px] w-[150px] items-center justify-center">
      {illustration}
    </div>

    <div className="mt-5">{eyebrow}</div>
    <div className="mt-2 font-serif text-[24px] leading-tight text-text">
      {title}
    </div>
    {subtitle ? (
      <p className="mt-2 min-h-[2.6em] text-sm leading-relaxed text-text-secondary">
        {subtitle}
      </p>
    ) : null}
    {footer}
  </div>
);

export default LoadingStateCard;
