import type { ReactNode } from "react";

type CtaBarProps = {
  children: ReactNode;
  className?: string;
  helper?: string;
};

/** Anchors a paired or single full-width CTA row above the safe area. */
const CtaBar = ({ children, className = "", helper }: CtaBarProps) => (
  <div
    className={`mt-auto w-full pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] ${className}`}
  >
    {helper ? (
      <p className="mb-3 text-center text-xs leading-relaxed text-text-secondary">
        {helper}
      </p>
    ) : null}
    <div className="flex w-full gap-3">{children}</div>
  </div>
);

export default CtaBar;
