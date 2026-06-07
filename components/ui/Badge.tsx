import { ReactNode } from "react";

export type StatusBadgeVariant =
  | "ready"
  | "draft"
  | "mapping"
  | "needs-attention"
  | "error";

type StatusBadgeProps = {
  variant: StatusBadgeVariant;
  children: ReactNode;
  className?: string;
  showDot?: boolean;
};

const variantClasses: Record<StatusBadgeVariant, string> = {
  ready: "border-[var(--gold-30)] bg-[var(--gold-10)] text-gold",
  draft: "border-border bg-surface text-muted",
  mapping: "border-[var(--gold-30)] bg-[var(--gold-10)] text-gold",
  "needs-attention": "border-[#E8545440] bg-error-surface text-red",
  error: "border-[#E8545440] bg-error-surface text-red",
};

const StatusBadge = ({
  variant,
  children,
  className = "",
  showDot = variant === "ready" || variant === "needs-attention",
}: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-[0.14em] uppercase ${variantClasses[variant]} ${className}`}
  >
    {showDot ? (
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
    ) : null}
    {children}
  </span>
);

/** @deprecated Prefer StatusBadge with a variant. Kept for gradual migration. */
const Badge = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <StatusBadge variant="ready" className={className}>
    {children}
  </StatusBadge>
);

export { Badge, StatusBadge };
export default StatusBadge;
