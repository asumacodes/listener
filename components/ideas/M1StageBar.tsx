"use client";

import {
  M1_STAGE_LABELS,
  M1_STAGE_ORDER,
  type M1StageId,
} from "@/lib/ideas/cards";

type StageState = "pending" | "active" | "done" | "failed";

type M1StageBarProps = {
  stageState: Partial<Record<M1StageId, StageState>>;
  complete?: boolean;
  /** Status line under the bar, e.g. "Stage 1 of 4" · "Researching the market". */
  status?: { label: string; detail: string; tone?: "active" | "failed" };
};

/** Active segment fills halfway and pulses — an in-progress stage must not read as done. */
const FILL: Record<StageState, string> = {
  done: "w-full bg-gold",
  active: "w-1/2 bg-gold motion-safe:animate-pulse",
  failed: "w-full bg-red",
  pending: "w-0 bg-gold",
};

const LABEL: Record<StageState, string> = {
  done: "text-text-secondary",
  active: "text-gold-deep",
  // Red lives on the failed segment and the status dot only.
  failed: "text-text",
  pending: "text-muted",
};

/** Failed status: calm neutral pill; the static dot is the only red. */
const StoppedPill = ({ label }: { label: string }) => (
  <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-surface px-3 py-1">
    <span className="h-[7px] w-[7px] rounded-full bg-red" aria-hidden />
    <span className="text-[10px] font-medium tracking-[0.14em] text-text-secondary uppercase">
      {label}
    </span>
  </span>
);

/** Desktop ArtifactWaitStates StagePill (pulsing), kept local to the mobile tree. */
const StagePill = ({ label }: { label: string }) => (
  <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gold-10 px-3 py-1">
    <span className="relative grid h-[7px] w-[7px] place-items-center">
      <span
        className="absolute inset-0 animate-record-pulse-ring rounded-full bg-gold motion-reduce:hidden"
        aria-hidden
      />
      <span
        className="relative h-[7px] w-[7px] rounded-full bg-gold motion-safe:animate-pulse"
        aria-hidden
      />
    </span>
    <span className="text-[10px] font-medium tracking-[0.14em] text-gold-deep uppercase">
      {label}
    </span>
  </span>
);

const M1StageBar = ({
  stageState,
  complete = false,
  status,
}: M1StageBarProps) => {
  if (complete) return null;

  return (
    <div>
      <div className="m1-stagebar grid grid-cols-5 gap-1">
        {M1_STAGE_ORDER.map((id) => {
          const st = stageState[id] ?? "pending";
          return (
            <div key={id} className={`m1-seg ${st}`}>
              <div className="m1-seg-track h-1 overflow-hidden rounded-full bg-border">
                <div
                  className={`m1-seg-fill h-full rounded-full ${FILL[st]}`}
                />
              </div>
              <p
                className={`m1-seg-label mt-1.5 text-center text-[9px] tracking-normal uppercase min-[360px]:text-[10px] ${LABEL[st]}`}
              >
                {M1_STAGE_LABELS[id]}
              </p>
            </div>
          );
        })}
      </div>
      {status ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          {status.tone === "failed" ? (
            <StoppedPill label={status.label} />
          ) : (
            <StagePill label={status.label} />
          )}
          <p className="min-w-0 text-[13px] leading-snug text-text-secondary">
            {status.detail}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default M1StageBar;
