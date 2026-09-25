"use client";

import StageIllustration from "@/components/illustrations/pipeline/StageIllustration";
import PipelineCardBody from "@/components/pipeline/run/PipelineCardBody";
import Button from "@/components/ui/Button";
import { IconChevron } from "@/components/icons/ListenerIcons";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import { formatShortDate } from "@/lib/format-date";
import type { CardFailure } from "@/lib/pipeline/derive-ui-state";
import { getStepperMeta } from "@/lib/pipeline/stage-copy";
import type { PipelineCardContent } from "@/types/pipeline-ui";
import { type ReactNode, useState } from "react";

type PipelineResultCardProps = {
  title: string;
  state: "populated" | "empty" | "failed";
  content?: PipelineCardContent;
  defaultOpen?: boolean;
  onRetry?: () => void | Promise<void>;
  elevated?: boolean;
  /** When true, render as a row in a grouped results stack (no outer card border). */
  grouped?: boolean;
  footer?: ReactNode;
  /** Failed state: which stage stopped and what finished (from describeCardFailure). */
  failure?: CardFailure;
  /**
   * Empty state on a FINISHED run only — enables "Stage complete". Without it
   * the empty card stays neutral (pending/loading cards also map to "empty").
   */
  empty?: { headline: string; explainer: string; finishedAt?: string | null };
};

/** "A", "A and B", "A, B and C". */
const formatList = (items: string[]): string =>
  items.length <= 1
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const PipelineResultCard = ({
  title,
  state,
  content,
  defaultOpen = true,
  onRetry,
  elevated = true,
  grouped = false,
  footer,
  failure,
  empty,
}: PipelineResultCardProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const [submitting, setSubmitting] = useState(false);
  const shell = grouped ? ui.resultsRow : elevated ? ui.card : ui.cardFlat;

  const handleRetry = async () => {
    if (!onRetry || submitting) return;
    setSubmitting(true);
    try {
      await onRetry();
    } finally {
      setSubmitting(false);
    }
  };

  if (state === "failed") {
    const failedCopy = copy.pipeline.failed;
    const lead = !failure || failure.primary;
    const intact = failure?.intactTitles ?? [];
    return (
      <div className={`${shell} px-5 py-4`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-xl text-text">{title}</h3>
          {/* Red is confined to this dot — the label stays calm. */}
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-medium text-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden />
            {failedCopy.pill}
          </span>
        </div>

        {failure?.primary ? (
          <div className="mt-4 flex gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-border bg-canvas">
              <StageIllustration
                stage={failure.stage}
                size={40}
                animated={false}
              />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-[22px] leading-snug text-text">
                {failure.stage
                  ? failedCopy.headline(getStepperMeta(failure.stage).title)
                  : failedCopy.beforeStart}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                {intact.length
                  ? `${failedCopy.intact(formatList(intact), intact.length)} `
                  : ""}
                {onRetry
                  ? failure.stage
                    ? failedCopy.retry
                    : failedCopy.retryFresh
                  : null}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm text-text-secondary">
            {failure ? failedCopy.secondary : failedCopy.generic}
          </p>
        )}

        {onRetry && lead ? (
          <Button
            variant="outline"
            className="mt-5 min-h-11! rounded-full! px-5! text-[13px]! text-gold-deep!"
            disabled={submitting}
            onClick={() => void handleRetry()}
          >
            {submitting ? "Trying again…" : copy.pipeline.tryAgain}
          </Button>
        ) : null}
      </div>
    );
  }

  if (state === "empty") {
    const emptyCopy = copy.pipeline.empty;
    if (!empty) {
      return (
        <div className={`${shell} px-5 py-4`}>
          <h3 className="font-serif text-xl text-text">{title}</h3>
          <p className="mt-3 text-sm text-muted">{emptyCopy.neutral}</p>
        </div>
      );
    }
    const finished = empty.finishedAt ? formatShortDate(empty.finishedAt) : "";
    return (
      <div className={`${shell} px-5 py-4`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-xl text-text">{title}</h3>
          <span className="shrink-0 rounded-full bg-success-surface px-2.5 py-1 text-[10px] font-medium tracking-[0.1em] text-success-text uppercase">
            {emptyCopy.pill}
          </span>
        </div>
        <div className="mt-4 flex gap-4">
          <div
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-dashed border-border"
            aria-hidden
          >
            <span className="h-5 w-5 rounded-full border border-dashed border-border" />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-[22px] leading-snug text-text">
              {empty.headline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              {empty.explainer}
            </p>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2.5 border-t border-border pt-3">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold"
            aria-hidden
          />
          <p className="text-xs leading-relaxed text-text-secondary">
            {finished ? emptyCopy.finished(finished) : emptyCopy.unaffected}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${shell} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left outline-none transition hover:bg-black/1.5 focus-visible:ring-2 focus-visible:ring-(--gold-30) focus-visible:ring-inset"
        aria-expanded={open}
      >
        <h3 className="font-serif text-xl text-text">{title}</h3>
        <IconChevron
          size={18}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && content ? (
        <div className="border-t border-border px-5 pt-4 pb-6">
          <PipelineCardBody content={content} />
          {footer ? <div className="mt-5">{footer}</div> : null}
        </div>
      ) : null}
    </div>
  );
};

export default PipelineResultCard;
