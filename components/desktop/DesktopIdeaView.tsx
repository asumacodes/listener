"use client";

import ArtifactIndexItem, {
  type ArtifactIndexItemState,
} from "@/components/desktop/ArtifactIndexItem";
import ReadingPane from "@/components/desktop/ReadingPane";
import StageTracker from "@/components/desktop/StageTracker";
import AudioPlayer from "@/components/AudioPlayer";
import Button from "@/components/ui/Button";
import { M1_CARD_ORDER, M1_CARDS } from "@/lib/ideas/cards";
import { deriveCardState } from "@/lib/ideas/run-results-content";
import { formatShortDate } from "@/lib/format-date";
import { PIPELINE_CARD_META } from "@/lib/pipeline/cards";
import {
  getStepperMeta,
  normalizeStepperStage,
} from "@/lib/pipeline/stage-copy";
import type { IdeaDetailData, M1CardId } from "@/types/ideas";
import type { PipelineStage } from "@/types/pipeline";
import Link from "next/link";
import { useMemo, useState } from "react";

type DesktopIdeaViewProps = {
  data: IdeaDetailData;
};

type SurfaceFill = "queued" | "running" | "failed" | "done" | "idle";

const IN_APP: M1CardId[] = [
  "transcript",
  "competitor",
  "prd",
  "brand",
  "engineering",
];
const LINK_OUTS: M1CardId[] = ["roadmap", "jira", "confluence"];

const fillFromData = (data: IdeaDetailData): SurfaceFill => {
  const status = data.latestRun?.status;
  if (!status) return "idle";
  if (status === "queued") return "queued";
  if (status === "running") return "running";
  if (status === "failed") return "failed";
  if (status === "done") return "done";
  return "idle";
};

const stageToActiveCards = (stage: PipelineStage | null): M1CardId[] => {
  if (!stage || stage === "transcribing") return ["transcript"];
  if (stage === "researching") return ["competitor"];
  if (stage === "writing_prd") return ["prd"];
  if (stage === "designing_brand") return ["brand"];
  if (stage === "building_board") {
    return ["engineering", "roadmap", "jira", "confluence"];
  }
  return [];
};

const isCardBeforeStage = (
  id: M1CardId,
  stage: PipelineStage | null
): boolean => {
  const active = stageToActiveCards(stage);
  const activeIdx = Math.min(
    ...active.map((a) => M1_CARD_ORDER.indexOf(a)).filter((i) => i >= 0)
  );
  const cardIdx = M1_CARD_ORDER.indexOf(id);
  return cardIdx >= 0 && cardIdx < activeIdx;
};

const indexStateFor = (
  id: M1CardId,
  fill: SurfaceFill,
  data: IdeaDetailData
): ArtifactIndexItemState => {
  if (fill === "queued" || fill === "idle") return "pending";

  if (fill === "running") {
    const stage = data.latestRun?.currentStage ?? null;
    if (stageToActiveCards(stage).includes(id)) return "active";
    if (isCardBeforeStage(id, stage)) return "done";
    return PIPELINE_CARD_META[id]?.kind === "linkout" ? "link-out" : "pending";
  }

  if (fill === "failed") {
    const cardState = deriveCardState(
      id,
      data.latestRunResults,
      data.recording.transcription
    );
    const failedId = stageToActiveCards(
      data.latestRun?.currentStage ?? null
    )[0];
    if (id === failedId || cardState === "failed") return "failed";
    if (cardState === "populated") return "done";
    if (isCardBeforeStage(id, data.latestRun?.currentStage ?? null)) {
      return "done";
    }
    // Downstream of failure → blocked (render as failed visual without try-again)
    if (M1_CARD_ORDER.indexOf(id) > M1_CARD_ORDER.indexOf(failedId ?? "prd")) {
      return "failed";
    }
    return "pending";
  }

  const cardState = deriveCardState(
    id,
    data.latestRunResults,
    data.recording.transcription
  );
  if (cardState === "populated") return "done";
  if (cardState === "failed") return "failed";
  if (PIPELINE_CARD_META[id]?.kind === "linkout") return "link-out";
  return "pending";
};

const jiraUrl = (data: IdeaDetailData): string | null => {
  const j = data.latestRunResults?.jira;
  if (!j?.projectKey) return null;
  const site = j.siteUrl ?? data.latestRunResults?.confluence?.spaceUrl ?? null;
  if (!site) return null;
  try {
    const origin = new URL(site).origin;
    return `${origin}/browse/${j.projectKey}`;
  } catch {
    return `${site.replace(/\/$/, "")}/browse/${j.projectKey}`;
  }
};

const confluenceUrl = (data: IdeaDetailData): string | null =>
  data.latestRunResults?.confluence?.spaceUrl ?? null;

const DesktopIdeaView = ({ data }: DesktopIdeaViewProps) => {
  const fill = fillFromData(data);
  const defaultSelected: M1CardId =
    fill === "failed"
      ? (stageToActiveCards(data.latestRun?.currentStage ?? null)[0] ?? "prd")
      : fill === "running"
        ? (stageToActiveCards(data.latestRun?.currentStage ?? null)[0] ?? "prd")
        : "prd";
  const [selected, setSelected] = useState<M1CardId>(defaultSelected);

  const runMeta =
    fill === "running"
      ? `Live run · ${formatShortDate(data.latestRun?.createdAt ?? data.recording.createdAt)}`
      : fill === "queued"
        ? `Submitted · ${formatShortDate(data.latestRun?.createdAt ?? data.recording.createdAt)}`
        : `Latest run · ${formatShortDate(data.latestRun?.createdAt ?? data.recording.createdAt)}`;

  const deliveredCount = useMemo(() => {
    return M1_CARD_ORDER.filter((id) => {
      const st = indexStateFor(id, fill, data);
      return st === "done" || (fill === "done" && st === "link-out");
    }).length;
  }, [data, fill]);

  const failedStageLabel = data.latestRun?.currentStage
    ? getStepperMeta(normalizeStepperStage(data.latestRun.currentStage)).title
    : "pipeline";

  const openLinkOut = (id: M1CardId) => {
    const link =
      id === "jira"
        ? jiraUrl(data)
        : id === "confluence" || id === "roadmap"
          ? confluenceUrl(data)
          : null;
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
      return true;
    }
    return false;
  };

  const onSelect = (id: M1CardId) => {
    if (PIPELINE_CARD_META[id]?.kind === "linkout") {
      if (!openLinkOut(id)) setSelected(id);
      return;
    }
    setSelected(id);
  };

  const liveLabelFor = (id: M1CardId): string | undefined => {
    const st = indexStateFor(id, fill, data);
    if (fill === "running" && st === "active") return "Writing";
    if (fill === "running" && st === "done") return "Done";
    if (fill === "failed" && st === "failed") {
      const failedId = stageToActiveCards(
        data.latestRun?.currentStage ?? null
      )[0];
      if (id === failedId) return "Try again";
      return "Blocked";
    }
    return undefined;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      <header className="shrink-0 border-b border-border bg-canvas px-11 pt-[26px] pb-[22px]">
        <div className="flex flex-wrap items-center gap-3.5 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Link href="/projects" className="hover:text-gold">
            ← Projects
          </Link>
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-text-secondary normal-case tracking-[0.06em]">
            {data.project.name} ▾
          </span>
          <span>{runMeta}</span>
          {fill === "done" ? (
            <span className="rounded-full bg-success-surface px-2.5 py-0.5 text-[10px] font-medium tracking-[0.1em] text-success-text">
              Complete
            </span>
          ) : null}
          {fill === "failed" ? (
            <span className="rounded-full bg-error-surface px-2.5 py-0.5 text-[10px] font-medium tracking-[0.1em] text-red">
              Failed at stage{" "}
              {
                getStepperMeta(
                  normalizeStepperStage(data.latestRun?.currentStage ?? null)
                ).index
              }
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-end gap-9">
          <h1 className="max-w-[560px] min-w-0 font-serif text-[46px] leading-[1.05] text-text">
            {data.recording.title}
          </h1>

          {data.recording.signedUrl ? (
            <div className="min-w-0 flex-1">
              <AudioPlayer
                audioUrl={data.recording.signedUrl}
                durationSeconds={data.recording.durationSeconds}
              />
            </div>
          ) : (
            <div className="min-w-0 flex-1" />
          )}

          <div className="flex shrink-0 gap-2.5 pb-1">
            {fill !== "queued" && fill !== "running" ? (
              <Button
                variant="outline"
                className="!min-h-9 rounded-full px-4 text-xs"
              >
                ↓ Download all
              </Button>
            ) : null}
            {fill === "failed" ? (
              <Button className="!min-h-9 rounded-full px-4 text-xs">
                {/* TODO: resumePipelineRun / startPipelineRun */}
                Re-run everything
              </Button>
            ) : fill === "done" || fill === "idle" ? (
              <Button className="!min-h-9 rounded-full px-4 text-xs">
                Re-run
              </Button>
            ) : null}
          </div>
        </div>

        {fill === "running" ? (
          <StageTracker stage={data.latestRun?.currentStage ?? null} />
        ) : null}

        {fill === "queued" ? (
          <div className="mt-4">
            <p className="text-[13px] font-medium tracking-[0.08em] text-text uppercase">
              ○ Queued · position —
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
              Nothing is running yet. No stage is lit, no bar is filling — the
              run starts when the queue clears.
            </p>
          </div>
        ) : null}
      </header>

      {fill === "queued" ? (
        <QueuedBody data={data} />
      ) : (
        <div className="flex min-h-0 flex-1">
          <aside className="flex w-[260px] shrink-0 flex-col border-r border-border px-[18px] py-[26px]">
            <p className="px-3 pb-4 text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
              {fill === "failed"
                ? `Artifacts · ${deliveredCount} of 8`
                : fill === "done"
                  ? `Artifacts · ${deliveredCount || 8}`
                  : "Artifacts"}
            </p>
            <div className="flex flex-col gap-1">
              {IN_APP.map((id) => (
                <ArtifactIndexItem
                  key={id}
                  id={id}
                  state={indexStateFor(id, fill, data)}
                  selected={selected === id}
                  onSelect={() => onSelect(id)}
                  liveLabel={liveLabelFor(id)}
                />
              ))}
            </div>
            <p className="mt-[18px] px-3.5 pb-2.5 text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
              Opens in Atlassian
            </p>
            <div className="flex flex-col gap-1">
              {LINK_OUTS.map((id) => (
                <ArtifactIndexItem
                  key={id}
                  id={id}
                  state={
                    fill === "done" ? "link-out" : indexStateFor(id, fill, data)
                  }
                  selected={selected === id}
                  onSelect={() => onSelect(id)}
                  liveLabel={liveLabelFor(id)}
                />
              ))}
            </div>

            {fill === "failed" ? (
              <RunHistoryFooter runs={data.runs} />
            ) : fill === "done" ? (
              <div className="mt-auto rounded-xl border border-border bg-surface p-3.5">
                <p className="text-[10px] tracking-[0.14em] text-muted uppercase">
                  From {data.recording.durationSeconds} seconds
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-text-secondary">
                  Run finished · {deliveredCount || 8} of 8 artifacts delivered.
                </p>
              </div>
            ) : null}
          </aside>

          {fill === "failed" &&
          indexStateFor(selected, fill, data) === "failed" &&
          stageToActiveCards(data.latestRun?.currentStage ?? null)[0] ===
            selected ? (
            <FailedReadingPane
              selected={selected}
              data={data}
              failedStageLabel={failedStageLabel}
            />
          ) : (
            <ArtifactReading selected={selected} data={data} fill={fill} />
          )}
        </div>
      )}
    </div>
  );
};

const QueuedBody = ({ data }: { data: IdeaDetailData }) => (
  <div className="flex min-h-0 flex-1 flex-col bg-canvas">
    <div className="min-h-0 flex-1 overflow-y-auto px-11 py-6">
      <p className="mb-3 text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
        All 8 pending
      </p>
      <div className="grid max-w-2xl gap-1">
        {M1_CARD_ORDER.map((id) => (
          <div
            key={id}
            className="flex h-[42px] items-center gap-[11px] rounded-xl border border-dashed border-dashed-border px-3.5 text-[13px] text-muted"
          >
            <span className="h-1.5 w-1.5 rounded-full border border-border" />
            {M1_CARDS[id].title}
            {PIPELINE_CARD_META[id]?.kind === "linkout" ? (
              <span className="ml-auto rounded-md border border-border px-1.5 py-0.5 text-[8px] tracking-[0.1em] uppercase">
                Link
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
    <div className="flex items-center gap-4 border-t border-border px-11 py-4">
      {data.recording.signedUrl ? (
        <Button
          variant="outline"
          className="!min-h-9 rounded-full px-4 text-xs"
        >
          Listen to the memo
        </Button>
      ) : null}
      <button type="button" className="text-sm font-medium text-red">
        {/* TODO: cancel queued run */}
        Cancel run
      </button>
    </div>
  </div>
);

const RunHistoryFooter = ({ runs }: { runs: IdeaDetailData["runs"] }) => (
  <div className="mt-auto border-t border-border px-4 py-4">
    <p className="text-[10px] font-medium tracking-[0.16em] text-muted uppercase">
      Run history · {runs.length} runs
    </p>
    <ul className="mt-2 space-y-1.5">
      {runs.slice(0, 4).map((run) => (
        <li
          key={run.id}
          className="flex items-center gap-2 text-[11px] text-text-secondary"
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              run.status === "failed"
                ? "bg-red"
                : run.status === "done"
                  ? "bg-muted"
                  : "bg-gold"
            }`}
          />
          <span className="uppercase tracking-wide">
            {run.status === "done" ? "Done" : run.status}
          </span>
          <span className="text-muted">· {formatShortDate(run.createdAt)}</span>
        </li>
      ))}
    </ul>
  </div>
);

const FailedReadingPane = ({
  selected,
  data,
  failedStageLabel,
}: {
  selected: M1CardId;
  data: IdeaDetailData;
  failedStageLabel: string;
}) => {
  const idx = M1_CARD_ORDER.indexOf(selected) + 1;
  const stillHave = IN_APP.filter(
    (id) =>
      deriveCardState(
        id,
        data.latestRunResults,
        data.recording.transcription
      ) === "populated"
  );

  return (
    <ReadingPane
      eyebrow={`Artifact ${String(idx).padStart(2, "0")} · ${M1_CARDS[selected].title}`}
      title="This one didn't come back"
    >
      <div className="rounded-2xl border border-red/30 bg-error-surface px-5 py-5">
        <p className="text-[11px] font-medium tracking-[0.14em] text-red uppercase">
          ● Stage failed · {failedStageLabel}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
          The {M1_CARDS[selected].title} step didn&apos;t finish. Your recording
          and earlier artifacts are safe — only this step and the ones waiting
          on it need to run again.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="retry" className="min-h-10 px-4 text-sm">
            {/* TODO: resume from failed stage */}
            Try this step again
          </Button>
          <Button variant="outline" className="min-h-10 px-4 text-sm">
            Copy error details
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted">
          Retrying costs nothing on the free plan.
        </p>
      </div>

      {stillHave.length > 0 ? (
        <div className="mt-8">
          <p className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
            What you still have
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {stillHave.map((id) => (
              <div
                key={id}
                className="rounded-2xl border border-border bg-canvas px-4 py-4"
              >
                <p className="font-serif text-lg text-text">
                  {M1_CARDS[id].title}
                </p>
                <button
                  type="button"
                  className="mt-2 text-sm font-medium text-gold"
                >
                  ↓ Download
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </ReadingPane>
  );
};

const ArtifactReading = ({
  selected,
  data,
  fill,
}: {
  selected: M1CardId;
  data: IdeaDetailData;
  fill: SurfaceFill;
}) => {
  const meta = M1_CARDS[selected];
  const idx = M1_CARD_ORDER.indexOf(selected) + 1;
  const results = data.latestRunResults;
  const streaming = fill === "running";

  if (selected === "transcript") {
    const text = results?.transcript ?? data.recording.transcription ?? "";
    return (
      <ReadingPane
        eyebrow={`${streaming ? "Streaming · " : ""}Artifact ${String(idx).padStart(2, "0")} · Transcript`}
        title="Transcript"
        actions={
          <>
            <Button variant="outline" className="min-h-9 px-3 text-sm">
              ↓ Download .md
            </Button>
            <Button
              variant="outline"
              className="min-h-9 px-3 text-sm"
              onClick={() => {
                if (text) void navigator.clipboard.writeText(text);
              }}
            >
              Copy
            </Button>
          </>
        }
      >
        {text ? (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-text">
            {text}
          </p>
        ) : (
          <p className="text-sm text-muted">No transcript yet.</p>
        )}
      </ReadingPane>
    );
  }

  if (selected === "prd") {
    const prd = results?.prd;
    return (
      <ReadingPane
        eyebrow={`${streaming ? "Streaming · " : ""}Artifact ${String(idx).padStart(2, "0")} · Product requirements`}
        title={`PRD — ${prd?.productName ?? data.recording.title}`}
        actions={
          <Button variant="outline" className="min-h-9 px-3 text-sm">
            ↓ Download .md
          </Button>
        }
      >
        {prd ? (
          <div className="space-y-8">
            {prd.oneLiner ? (
              <section>
                <p className="text-[11px] font-medium tracking-[0.16em] text-gold uppercase">
                  One-liner
                </p>
                <p className="mt-2 font-serif text-2xl leading-snug text-text">
                  {prd.oneLiner}
                  {streaming ? (
                    <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-gold align-middle" />
                  ) : null}
                </p>
              </section>
            ) : null}
            {prd.problem ? (
              <section>
                <p className="text-[11px] font-medium tracking-[0.16em] text-gold uppercase">
                  Problem
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
                  {prd.problem}
                </p>
              </section>
            ) : null}
            {prd.targetUser ? (
              <section>
                <p className="text-[11px] font-medium tracking-[0.16em] text-gold uppercase">
                  Target user
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-text-secondary">
                  {prd.targetUser}
                </p>
              </section>
            ) : null}
            {prd.features?.must_have?.length ? (
              <section>
                <p className="text-[11px] font-medium tracking-[0.16em] text-gold uppercase">
                  Must-have features
                </p>
                <ol className="mt-4 space-y-5">
                  {prd.features.must_have.map((f, i) => (
                    <li key={i} className="flex gap-4">
                      <span className="font-serif text-2xl text-gold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-serif text-lg text-text">
                          {f.title ?? "Feature"}
                        </p>
                        {f.description ? (
                          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                            {f.description}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
            {streaming && !prd.features?.must_have?.length ? (
              <div className="space-y-2 pt-2">
                <div className="h-3 w-full animate-skeleton-shimmer rounded bg-border/40" />
                <div className="h-3 w-5/6 animate-skeleton-shimmer rounded bg-border/40" />
                <div className="h-3 w-4/6 animate-skeleton-shimmer rounded bg-border/40" />
              </div>
            ) : null}
          </div>
        ) : streaming ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Streaming · waiting for run_results.prd
            </p>
            <div className="h-3 w-full animate-skeleton-shimmer rounded bg-border/40" />
            <div className="h-3 w-5/6 animate-skeleton-shimmer rounded bg-border/40" />
          </div>
        ) : (
          <p className="text-sm text-muted">No PRD in run_results yet.</p>
        )}
      </ReadingPane>
    );
  }

  return (
    <ReadingPane
      eyebrow={`Artifact ${String(idx).padStart(2, "0")} · ${meta.title}`}
      title={meta.title}
    >
      <p className="text-sm leading-relaxed text-text-secondary">
        TODO: render <code className="text-xs text-muted">run_results</code> for{" "}
        <strong>{selected}</strong> via{" "}
        <code className="text-xs text-muted">
          lib/ideas/run-results-content.ts
        </code>
        .
      </p>
    </ReadingPane>
  );
};

export default DesktopIdeaView;
