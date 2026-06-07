import { ReactNode } from "react";
import StatusBadge, { type StatusBadgeVariant } from "@/components/ui/Badge";

type ListRowCardProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  meta?: ReactNode;
  status?: StatusBadgeVariant;
  statusLabel?: string;
  timestamp?: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

const ListRowCard = ({
  icon,
  title,
  description,
  meta,
  status,
  statusLabel,
  timestamp,
  className = "",
}: ListRowCardProps) => (
  <article
    className={`flex gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-card ${className}`}
  >
    {icon ? (
      <div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--gold-10)] shadow-[0_0_0_4px_var(--gold-15)]"
        aria-hidden={!icon}
      >
        {icon}
      </div>
    ) : null}
    <div className="min-w-0 flex-1">
      <h3 className="font-serif text-[19px] leading-tight text-text">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 text-sm leading-relaxed text-text-secondary">
          {description}
        </p>
      ) : null}
      {(status || timestamp || meta) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-muted">
          {status && statusLabel ? (
            <StatusBadge variant={status}>{statusLabel}</StatusBadge>
          ) : null}
          {timestamp ? <span>{timestamp}</span> : null}
          {meta}
        </div>
      )}
    </div>
  </article>
);

export default ListRowCard;
