"use client";

import type { DesktopIdeaCardModel } from "@/types/desktop";
import { formatShortDate } from "@/lib/format-date";
import { formatDurationSeconds } from "@/lib/format";
import { getStepperMeta } from "@/lib/pipeline/stage-copy";
import Link from "next/link";

type IdeaCardProps = {
  idea: DesktopIdeaCardModel;
  /** Temporary gold halo after capture handoff */
  highlight?: boolean;
};

const statusLine = (idea: DesktopIdeaCardModel) => {
  switch (idea.status) {
    case "done":
      return {
        tone: "muted" as const,
        label: `${idea.statusMeta ?? 8} artifacts`,
      };
    case "running":
      return {
        tone: "gold" as const,
        label: `Stage ${idea.statusMeta ?? 1} of 4`,
      };
    case "failed":
      return {
        tone: "red" as const,
        label: idea.statusMeta
          ? `Failed at stage ${idea.statusMeta}`
          : "Failed",
      };
    case "queued":
      return {
        tone: "muted" as const,
        label:
          idea.statusMeta != null
            ? `Queued · position ${idea.statusMeta}`
            : "Queued",
      };
    default:
      return { tone: "muted" as const, label: "No run yet" };
  }
};

const IdeaCard = ({ idea, highlight = false }: IdeaCardProps) => {
  const status = statusLine(idea);
  const dateLabel = formatShortDate(idea.createdAt);
  const isRunning = idea.status === "running";

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className={`flex min-h-[220px] flex-col rounded-2xl border bg-surface p-[22px] transition ${
        highlight || isRunning
          ? "border-gold shadow-[0_0_0_1px_var(--gold-30)]"
          : "border-border hover:border-gold/30"
      }`}
    >
      <p
        className={`flex items-center gap-2 text-[10px] tracking-[0.12em] uppercase ${
          status.tone === "gold"
            ? "text-gold-deep"
            : status.tone === "red"
              ? "text-muted"
              : "text-muted"
        }`}
      >
        <span
          className={`h-[7px] w-[7px] rounded-full ${
            status.tone === "gold"
              ? "bg-gold"
              : status.tone === "red"
                ? "bg-red"
                : "bg-gold"
          } ${isRunning ? "animate-pulse" : ""}`}
        />
        {status.label}
      </p>

      <h3 className="mt-3.5 font-serif text-[21px] leading-[1.2] text-text">
        {idea.title}
      </h3>
      {isRunning ? (
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          {idea.currentStage
            ? `${getStepperMeta(idea.currentStage).title}…`
            : "Just started — transcript first."}
        </p>
      ) : idea.description ? (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-secondary">
          {idea.description}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted">No transcript yet</p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2.5 pt-2 text-[11px] tracking-[0.06em] text-muted uppercase">
        <span className="capitalize">
          {dateLabel}
          {isRunning
            ? " · running"
            : idea.status === "queued"
              ? " · waiting"
              : idea.status === "failed"
                ? ` · ${formatDurationSeconds(idea.durationSeconds)}`
                : ` · ${formatDurationSeconds(idea.durationSeconds)}`}
        </span>
        {idea.status === "failed" ? (
          <span className="font-medium tracking-normal text-gold-deep normal-case">
            Retry →
          </span>
        ) : isRunning ? (
          <span className="font-medium tracking-normal text-gold-deep normal-case">
            Watch it build →
          </span>
        ) : null}
      </div>

      {isRunning ? (
        <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-gold-15">
          <div
            className="h-full rounded-full bg-gold transition-[width]"
            style={{
              width: `${Math.min(100, ((idea.statusMeta ?? 1) / 4) * 100)}%`,
            }}
          />
        </div>
      ) : null}
    </Link>
  );
};

export default IdeaCard;
