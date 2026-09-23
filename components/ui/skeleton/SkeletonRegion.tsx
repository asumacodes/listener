import type { ReactNode } from "react";

type SkeletonRegionProps = {
  /** Announced once to assistive tech, e.g. "Loading your plan". */
  label: string;
  className?: string;
  children: ReactNode;
};

/**
 * Wraps a skeleton composite so it announces itself once as a busy region.
 * The bars inside (SkeletonBar / SkeletonCard) are aria-hidden.
 */
const SkeletonRegion = ({
  label,
  className = "",
  children,
}: SkeletonRegionProps) => (
  <div role="status" aria-busy="true" aria-label={label} className={className}>
    {children}
  </div>
);

export default SkeletonRegion;
