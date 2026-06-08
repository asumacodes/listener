import type { ReactNode } from "react";
import { ui } from "@/lib/design/ui";

type SkeletonCardProps = {
  children: ReactNode;
  className?: string;
};

/** Rounded surface shell mirroring real cards — no interaction. */
const SkeletonCard = ({ children, className = "" }: SkeletonCardProps) => (
  <div className={`${ui.card} ${className}`} aria-hidden>
    {children}
  </div>
);

export default SkeletonCard;
