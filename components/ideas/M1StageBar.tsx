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
};

const M1StageBar = ({ stageState, complete = false }: M1StageBarProps) => {
  if (complete) return null;

  return (
    <div className="m1-stagebar grid grid-cols-5 gap-1">
      {M1_STAGE_ORDER.map((id) => {
        const st = stageState[id] ?? "pending";
        return (
          <div key={id} className={`m1-seg ${st}`}>
            <div className="m1-seg-track h-1 overflow-hidden rounded-full bg-border">
              <div
                className={`m1-seg-fill h-full rounded-full ${
                  st === "done" || st === "active"
                    ? "w-full bg-gold"
                    : st === "failed"
                      ? "w-full bg-red"
                      : "w-0 bg-gold"
                }`}
              />
            </div>
            <p className="m1-seg-label mt-1.5 text-center text-[9px] tracking-wide text-muted uppercase">
              {M1_STAGE_LABELS[id]}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default M1StageBar;
