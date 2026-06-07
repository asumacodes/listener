"use client";

import { M1_CARD_ORDER } from "@/lib/ideas/cards";
import type { M1CardState, IdeaRunSummary } from "@/types/ideas";
import M1Card from "@/components/ideas/M1Card";
import M1StageBar from "@/components/ideas/M1StageBar";
import type { M1StageId } from "@/lib/ideas/cards";

const cardStatesForRun = (
  run: IdeaRunSummary | null
): Record<(typeof M1_CARD_ORDER)[number], M1CardState> => {
  const base = Object.fromEntries(
    M1_CARD_ORDER.map((id) => [id, "pending" as M1CardState])
  ) as Record<(typeof M1_CARD_ORDER)[number], M1CardState>;

  if (!run) return base;

  if (run.status === "failed") {
    base.transcript = "empty";
    base.competitor = "empty";
    return base;
  }

  if (run.status === "running" || run.status === "queued") {
    base.transcript = "loading";
    return base;
  }

  if (run.status === "done") {
    for (const id of M1_CARD_ORDER) {
      base[id] = id === "competitor" ? "empty" : "populated";
    }
    return base;
  }

  return base;
};

const stageStateForRun = (
  run: IdeaRunSummary | null,
  complete: boolean
): Partial<Record<M1StageId, "pending" | "active" | "done" | "failed">> => {
  if (complete) {
    return {
      transcribe: "done",
      research: "done",
      prd: "done",
      brand: "done",
      board: "done",
    };
  }
  if (!run || run.status === "failed") {
    return { transcribe: "done", research: "done", prd: "failed" };
  }
  if (run.status === "running" || run.status === "queued") {
    return {
      transcribe: "done",
      research: "active",
      prd: "pending",
      brand: "pending",
      board: "pending",
    };
  }
  return {};
};

type LatestRunDashboardProps = {
  latestRun: IdeaRunSummary | null;
};

const LatestRunDashboard = ({ latestRun }: LatestRunDashboardProps) => {
  const complete = latestRun?.status === "done";
  const cardState = cardStatesForRun(latestRun);
  const stageState = stageStateForRun(latestRun, complete);

  return (
    <div className="embedded-dash space-y-4">
      <M1StageBar stageState={stageState} complete={complete} />
      <div className="m1-stack space-y-3">
        {M1_CARD_ORDER.map((id) => (
          <M1Card
            key={id}
            id={id}
            state={cardState[id]}
            defaultOpen={id === "transcript" || id === "competitor"}
          />
        ))}
      </div>
    </div>
  );
};

export default LatestRunDashboard;
