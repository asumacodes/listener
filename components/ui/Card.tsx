import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  /** List-row style with border + shadow (default). Pass false for flat hairline only. */
  elevated?: boolean;
};

const Card = ({ children, className = "", elevated = true }: CardProps) => (
  <div
    className={`rounded-2xl border border-border bg-surface px-4 py-4 ${
      elevated ? "shadow-card" : ""
    } ${className}`}
  >
    {children}
  </div>
);

export default Card;
