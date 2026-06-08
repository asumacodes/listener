type SkeletonBarProps = {
  className?: string;
};

/** Faint inert bar — border token at ~40% opacity, optional gentle shimmer. */
const SkeletonBar = ({ className = "" }: SkeletonBarProps) => (
  <div
    aria-hidden
    className={`rounded-md bg-border/40 motion-safe:animate-skeleton-shimmer ${className}`}
  />
);

export default SkeletonBar;
