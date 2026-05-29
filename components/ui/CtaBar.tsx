import type { ReactNode } from "react";

type CtaBarProps = {
  children: ReactNode;
  className?: string;
};

/** Anchors a paired or single full-width CTA row above the safe area. */
const CtaBar = ({ children, className = "" }: CtaBarProps) => (
  <div
    className={`mt-auto flex w-full gap-3 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] ${className}`}
  >
    {children}
  </div>
);

export default CtaBar;
