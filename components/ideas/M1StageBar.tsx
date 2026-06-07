"use client";

import {
  M1_STAGE_LABELS,
  M1_STAGE_ORDER,
  type M1StageId,
} from "@/lib/ideas/cards";
import { IconCheck } from "@/components/icons/ListenerIcons";

type StageState = "pending" | "active" | "done" | "failed";

type M1StageBarProps = {
  stageState: Partial<Record<M1StageId, StageState>>;
  complete?: boolean;
};

const M1StageBar = ({ stageState, complete = false }: M1StageBarProps) => {
  if (complete) {
    return (
      <div className="m1-stagebar ready flex items-center justify-center gap-2 rounded-full border border-[var(--gold-30)] bg-[var(--gold-10)] px-4 py-2">
        <span className="text-gold">
          <IconCheck size={12} />
        </span>
        <span className="text-[11px] font-medium tracking-[0.14em] text-gold uppercase">
          Ready
        </span>
      </div>
    );
  }

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
