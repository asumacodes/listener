"use client";

import PipelineCardBody from "@/components/pipeline/run/PipelineCardBody";
import Button from "@/components/ui/Button";
import { IconChevron } from "@/components/icons/ListenerIcons";
import { copy } from "@/lib/design/copy";
import { ui } from "@/lib/design/ui";
import type { PipelineCardContent } from "@/types/pipeline-ui";
import { type ReactNode, useState } from "react";

type PipelineResultCardProps = {
  title: string;
  state: "populated" | "empty" | "failed";
  content?: PipelineCardContent;
  defaultOpen?: boolean;
  onRetry?: () => void;
  elevated?: boolean;
  /** When true, render as a row in a grouped results stack (no outer card border). */
  grouped?: boolean;
  emptyCopy?: string;
  footer?: ReactNode;
};

const PipelineResultCard = ({
  title,
  state,
  content,
  defaultOpen = true,
  onRetry,
  elevated = true,
  grouped = false,
  emptyCopy,
  footer,
}: PipelineResultCardProps) => {
  const [open, setOpen] = useState(defaultOpen);
  const shell = grouped ? ui.resultsRow : elevated ? ui.card : ui.cardFlat;

  if (state === "failed") {
    return (
      <div className={`${shell} px-5 py-4`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-serif text-lg text-text">{title}</h3>
          <span className="h-2 w-2 shrink-0 rounded-full bg-red" aria-hidden />
        </div>
        <p className="mt-3 text-sm text-text-secondary">
          We couldn&apos;t finish this step.
        </p>
        {onRetry ? (
          <Button
            variant="retry"
            className="mt-4 min-h-10 px-4 text-sm"
            onClick={onRetry}
          >
            Try again
          </Button>
        ) : null}
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className={`${shell} px-5 py-4`}>
        <h3 className="font-serif text-lg text-text">{title}</h3>
        <p className="mt-3 text-sm text-muted">
          {emptyCopy ?? copy.limitation.noCompetitors}
        </p>
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
        <h3 className="font-serif text-lg text-text">{title}</h3>
        <IconChevron
          size={18}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && content ? (
        <div className="border-t border-border px-5 pt-3 pb-5">
          <PipelineCardBody content={content} />
          {footer ? <div className="mt-4">{footer}</div> : null}
        </div>
      ) : null}
    </div>
  );
};

export default PipelineResultCard;
