"use client";

import {
  getStepperMeta,
  normalizeStepperStage,
  PIPELINE_STEPPER_ORDER,
} from "@/lib/pipeline/stage-copy";
import type { PipelineStage } from "@/types/pipeline";

type StageTrackerProps = {
  stage: PipelineStage | null;
  /** Optional ETA copy e.g. "~1M LEFT" */
  etaLabel?: string | null;
};

/** Header slim progress — STAGE n OF 4 · label + gold bar. */
const StageTracker = ({ stage, etaLabel }: StageTrackerProps) => {
  const stepper = normalizeStepperStage(stage);
  const meta = getStepperMeta(stepper);
  const pct = Math.round((meta.index / meta.total) * 100);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between gap-3 text-[11px] font-medium tracking-[0.12em] uppercase">
        <span className="text-gold-deep">
          ● Stage {meta.index} of {meta.total} · {meta.title}…
        </span>
        {etaLabel ? <span className="text-muted">{etaLabel}</span> : null}
      </div>
      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-gold-15">
        <div
          className="h-full rounded-full bg-gold transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="sr-only">
        {PIPELINE_STEPPER_ORDER.map((s) => s).join(", ")}
      </div>
    </div>
  );
};

export default StageTracker;
