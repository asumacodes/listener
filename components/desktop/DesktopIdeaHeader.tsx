"use client";

import AudioPlayer from "@/components/AudioPlayer";
import DesktopIdeaOverflowMenu from "@/components/desktop/DesktopIdeaOverflowMenu";
import DesktopProjectPicker from "@/components/desktop/DesktopProjectPicker";
import StageTracker from "@/components/desktop/StageTracker";
import CostHaltSheet from "@/components/confirm/CostHaltSheet";
import DeleteRunSheet from "@/components/confirm/DeleteRunSheet";
import OutOfQuotaSheet from "@/components/confirm/OutOfQuotaSheet";
import RunInProgressSheet from "@/components/confirm/RunInProgressSheet";
import Button from "@/components/ui/Button";
import useProjectPicker from "@/hooks/useProjectPicker";
import { formatShortDate } from "@/lib/format-date";
import {
  downloadAllDocs,
  withRecordingTranscript,
} from "@/lib/ideas/document-download";
import { resumePipelineRun, startPipelineRun } from "@/lib/murmur/client";
import { colorHex, isProjectColor } from "@/lib/palette";
import { deleteRun } from "@/lib/runs/client";
import {
  getStepperMeta,
  normalizeStepperStage,
} from "@/lib/pipeline/stage-copy";
import type { IdeaDetailData } from "@/types/ideas";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SurfaceFill = "queued" | "running" | "failed" | "done" | "idle";

type DesktopIdeaHeaderProps = {
  data: IdeaDetailData;
  fill: SurfaceFill;
  canKickoff?: boolean;
};

type PipelineStartResult = Awaited<ReturnType<typeof startPipelineRun>>;
type PipelineResumeResult = Awaited<ReturnType<typeof resumePipelineRun>>;

const DesktopIdeaHeader = ({
  data,
  fill,
  canKickoff = true,
}: DesktopIdeaHeaderProps) => {
  const router = useRouter();
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [deleteRunOpen, setDeleteRunOpen] = useState(false);
  const [deletingRun, setDeletingRun] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [concurrentActiveRunId, setConcurrentActiveRunId] = useState<
    string | null
  >(null);
  const [outOfQuotaOpen, setOutOfQuotaOpen] = useState(false);
  const [costHaltOpen, setCostHaltOpen] = useState(false);

  const picker = useProjectPicker({
    recordingId: data.recording.id,
    currentProjectId: data.project.id,
    enabled: true,
    onAssigned: () => router.refresh(),
  });

  const selectedProject = useMemo(
    () => picker.projects.find((p) => p.id === picker.selectedId) ?? null,
    [picker.projects, picker.selectedId]
  );
  const projectLabel =
    selectedProject?.name ?? data.project.name ?? "Uncategorised";
  const projectDot = selectedProject
    ? colorHex(selectedProject.color)
    : isProjectColor(data.project.color)
      ? colorHex(data.project.color)
      : "#D8D5CE";

  const runMeta =
    fill === "running"
      ? `Live run · ${formatShortDate(data.latestRun?.createdAt ?? data.recording.createdAt)}`
      : fill === "queued"
        ? `Submitted · ${formatShortDate(data.latestRun?.createdAt ?? data.recording.createdAt)}`
        : `Latest run · ${formatShortDate(data.latestRun?.createdAt ?? data.recording.createdAt)}`;

  const applyPipelineResult = (
    result: PipelineStartResult | PipelineResumeResult
  ): void => {
    if (result.ok) {
      router.refresh();
      return;
    }
    if (
      result.reason === "run_in_progress" &&
      "activeRunId" in result &&
      typeof result.activeRunId === "string"
    ) {
      setConcurrentActiveRunId(result.activeRunId);
      return;
    }
    if (result.reason === "out_of_quota") {
      setOutOfQuotaOpen(true);
      return;
    }
    if (result.reason === "cost_halt") {
      setCostHaltOpen(true);
    }
  };

  const handleRunAgain = async () => {
    if (!canKickoff) {
      setOutOfQuotaOpen(true);
      return;
    }
    setRerunning(true);
    try {
      applyPipelineResult(await startPipelineRun(data.recording.id));
    } finally {
      setRerunning(false);
    }
  };

  const handleDownloadAll = () => {
    const patched = withRecordingTranscript(
      data.latestRunResults,
      data.recording.transcription
    );
    if (!patched) return;
    downloadAllDocs(patched);
  };

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const latest = data.latestRun;
      const isResumable =
        latest?.status === "failed" && latest.currentStage != null;

      if (isResumable) {
        const resumeResult = await resumePipelineRun(latest.id);
        if (resumeResult.ok) {
          router.refresh();
          return;
        }
        if (resumeResult.reason === "not_resumable") {
          applyPipelineResult(await startPipelineRun(data.recording.id));
          return;
        }
        applyPipelineResult(resumeResult);
        return;
      }

      applyPipelineResult(await startPipelineRun(data.recording.id));
    } finally {
      setRetrying(false);
    }
  };

  const handleDeleteRun = async () => {
    if (!data.latestRun) return;
    setDeletingRun(true);
    try {
      await deleteRun(data.latestRun.id);
      setDeleteRunOpen(false);
      router.refresh();
    } finally {
      setDeletingRun(false);
    }
  };

  const showUseActions =
    fill === "done" || fill === "idle" || fill === "failed";
  const showOverflow = showUseActions;

  return (
    <>
      <header className="shrink-0 border-b border-border bg-canvas px-11 pt-[26px] pb-[22px]">
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 text-[11px] font-medium tracking-[0.14em] text-muted uppercase">
          <Link href="/projects" className="hover:text-gold">
            ← Projects
          </Link>

          <DesktopProjectPicker
            open={projectPickerOpen}
            onOpenChange={setProjectPickerOpen}
            label={projectLabel}
            dotColor={projectDot}
            projects={picker.projects}
            selectedId={picker.selectedId}
            isSaving={picker.isSaving}
            onSelect={(id) => void picker.onSelect(id)}
            onCreateAndAssign={picker.onCreateAndAssign}
            startInCreate={picker.createSheetOpen}
          />

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

        <div className="mt-4 flex items-end gap-7">
          <h1 className="max-w-[380px] min-w-0 shrink font-serif text-[42px] leading-[1.05] tracking-[-0.01em] text-text">
            {data.recording.title}
          </h1>

          {data.recording.signedUrl ? (
            <AudioPlayer
              audioUrl={data.recording.signedUrl}
              durationSeconds={data.recording.durationSeconds}
              variant="compact"
            />
          ) : null}

          <div className="mb-0.5 ml-auto flex shrink-0 items-center gap-2.5">
            {showUseActions ? (
              <Button
                variant={fill === "failed" ? "outline" : "primary"}
                className="!min-h-9 rounded-full px-4 text-xs"
                onClick={handleDownloadAll}
              >
                ↓ Download all
              </Button>
            ) : null}

            {fill === "failed" ? (
              <Button
                className="!min-h-9 rounded-full px-4 text-xs"
                disabled={retrying}
                onClick={() => void handleRetry()}
              >
                {retrying ? "Re-running…" : "Re-run everything"}
              </Button>
            ) : null}

            {showOverflow ? (
              <DesktopIdeaOverflowMenu
                onRunAgain={() => void handleRunAgain()}
                onMoveToProject={() => setProjectPickerOpen(true)}
                onDeleteRun={
                  data.latestRun ? () => setDeleteRunOpen(true) : null
                }
                runAgainBusy={rerunning}
                runAgainDisabled={!canKickoff}
              />
            ) : null}
          </div>
        </div>

        {picker.error ? (
          <p className="mt-2 text-xs text-red">{picker.error}</p>
        ) : null}
        {picker.savedTo ? (
          <p className="mt-2 text-xs text-text-secondary">
            Saved to {picker.savedTo}
          </p>
        ) : null}

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

      <DeleteRunSheet
        open={deleteRunOpen}
        busy={deletingRun}
        onClose={() => setDeleteRunOpen(false)}
        onConfirm={handleDeleteRun}
      />
      <OutOfQuotaSheet
        open={outOfQuotaOpen}
        onClose={() => setOutOfQuotaOpen(false)}
      />
      <CostHaltSheet
        open={costHaltOpen}
        onClose={() => setCostHaltOpen(false)}
      />
      <RunInProgressSheet
        open={concurrentActiveRunId != null}
        onClose={() => setConcurrentActiveRunId(null)}
        onGoToPipeline={() => {
          setConcurrentActiveRunId(null);
          router.push("/");
        }}
      />
    </>
  );
};

export default DesktopIdeaHeader;
