import type { ReactNode } from "react";

type CtaBarProps = {
  children: ReactNode;
  className?: string;
  helper?: string;
};

/** Mockup `.l-ctabar` — surface strip anchored to the bottom with safe-area padding. */
const CtaBar = ({ children, className = "", helper }: CtaBarProps) => (
  <div
    className={`mt-auto shrink-0 border-t border-border bg-surface px-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))] pt-4 pb-[max(1.875rem,env(safe-area-inset-bottom))] ${className}`}
  >
    <div className="flex w-full gap-3">{children}</div>
    {helper ? (
      <p className="mt-3 text-center text-xs leading-[1.45] text-muted">
        {helper}
      </p>
    ) : null}
  </div>
);

export default CtaBar;
