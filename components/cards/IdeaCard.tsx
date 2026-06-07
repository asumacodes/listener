import StatusBadge, { type StatusBadgeVariant } from "@/components/ui/Badge";
import Link from "next/link";

export type IdeaStatus = "ready" | "running" | "attention" | "mapping";

const statusVariant: Record<IdeaStatus, StatusBadgeVariant> = {
  ready: "ready",
  running: "mapping",
  attention: "needs-attention",
  mapping: "mapping",
};

const statusLabel: Record<IdeaStatus, string> = {
  ready: "Ready",
  running: "Running",
  attention: "Needs attention",
  mapping: "Mapping",
};

import type { ReactNode } from "react";

type IdeaCardProps = {
  href: string;
  title: string;
  summary?: ReactNode;
  time: string;
  status: IdeaStatus;
};

const IdeaCard = ({ href, title, summary, time, status }: IdeaCardProps) => (
  <Link
    href={href}
    className="flex w-full flex-col gap-2 rounded-2xl border border-border bg-surface p-4 text-left shadow-card transition active:scale-[0.995]"
  >
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-serif text-lg leading-tight text-text">{title}</h3>
      <StatusBadge
        variant={statusVariant[status]}
        showDot={status === "running" || status === "attention"}
      >
        {statusLabel[status]}
      </StatusBadge>
    </div>
    {summary ? (
      <p className="line-clamp-2 text-[13.5px] leading-relaxed text-text-secondary">
        {summary}
      </p>
    ) : null}
    <p className="text-xs text-muted">{time}</p>
  </Link>
);

export default IdeaCard;
