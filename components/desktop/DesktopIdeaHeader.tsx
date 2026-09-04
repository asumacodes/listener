"use client";

import AudioPlayer from "@/components/AudioPlayer";
import DesktopIdeaOverflowMenu from "@/components/desktop/DesktopIdeaOverflowMenu";
import DesktopProjectPicker from "@/components/desktop/DesktopProjectPicker";
import StageTracker from "@/components/desktop/StageTracker";
import CostHaltSheet from "@/components/confirm/CostHaltSheet";
import DeleteRecordingSheet from "@/components/confirm/DeleteRecordingSheet";
import OutOfQuotaSheet from "@/components/confirm/OutOfQuotaSheet";
import RunInProgressDialog from "@/components/desktop/RunInProgressDialog";
import Button from "@/components/ui/Button";
import useProjectPicker from "@/hooks/useProjectPicker";
import { copy } from "@/lib/design/copy";
import { trackPaneAction } from "@/lib/analytics/events";
import { formatShortDate } from "@/lib/format-date";
import {
  downloadAllDocs,
  withRecordingTranscript,
} from "@/lib/ideas/document-download";
import { colorHex, isProjectColor } from "@/lib/palette";
import { deleteRecording } from "@/lib/recordings/client";
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
  retrying?: boolean;
  rerunning?: boolean;
  onRetry?: () => void;
  onRunAgain?: () => void;
  concurrentActiveRunId?: string | null;
  onCloseConcurrentRun?: () => void;
  outOfQuotaOpen?: boolean;
  onCloseOutOfQuota?: () => void;
  costHaltOpen?: boolean;
  onCloseCostHalt?: () => void;
  waitingOnConnect?: boolean;
  onConnectAndBuild?: () => void;
};

const DesktopIdeaHeader = ({
  data,
  fill,
  canKickoff = true,
  retrying = false,
  rerunning = false,
  onRetry,
  onRunAgain,
  concurrentActiveRunId = null,
  onCloseConcurrentRun,
  outOfQuotaOpen = false,
  onCloseOutOfQuota,
  costHaltOpen = false,
  onCloseCostHalt,
  waitingOnConnect = false,
  onConnectAndBuild,
}: DesktopIdeaHeaderProps) => {
  const router = useRouter();
  const [projectPickerOpen, setProjectPickerOpen] = useState(false);
  const [deleteIdeaOpen, setDeleteIdeaOpen] = useState(false);
  const [deletingIdea, setDeletingIdea] = useState(false);

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

  const handleDownloadAll = () => {
    const patched = withRecordingTranscript(
      data.latestRunResults,
      data.recording.transcription
    );
    if (!patched) return;
    downloadAllDocs(patched);
    trackPaneAction("download_all", "desktop");
  };

  const handleDeleteIdea = async () => {
    setDeletingIdea(true);
    try {
      await deleteRecording(data.recording.id);
      setDeleteIdeaOpen(false);
      router.push("/projects");
      router.refresh();
    } finally {
      setDeletingIdea(false);
    }
  };

  const showUseActions =
    fill === "done" || fill === "idle" || fill === "failed";
  const showOverflow = showUseActions;

  // Blocking run is THIS idea when it matches latestRun — no extra query.
  const sameIdeaConflict =
    concurrentActiveRunId != null &&
    concurrentActiveRunId === data.latestRun?.id;

  const sameIdeaStageMeta =
    sameIdeaConflict && data.latestRun?.currentStage
      ? getStepperMeta(normalizeStepperStage(data.latestRun.currentStage))
      : null;

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
          {fill === "idle" && waitingOnConnect ? (
            <span className="rounded-full bg-gold-10 px-2.5 py-0.5 text-[10px] font-medium tracking-[0.1em] text-gold-deep">
              {copy.atlassianGate.cardWaiting}
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-end gap-7">
          <h1 className="max-w-[380px] shrink-0 break-normal font-serif text-[42px] leading-[1.05] tracking-[-0.01em] text-text [overflow-wrap:normal]">
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

            {fill === "idle" && waitingOnConnect && onConnectAndBuild ? (
              <Button
                className="!min-h-9 rounded-full px-4 text-xs"
                onClick={onConnectAndBuild}
              >
                {copy.atlassianGate.connect}
              </Button>
            ) : null}

            {fill === "failed" && onRetry ? (
              <Button
                className="!min-h-9 rounded-full px-4 text-xs"
                disabled={retrying}
                onClick={() => void onRetry()}
              >
                {retrying ? "Re-running…" : "Re-run everything"}
              </Button>
            ) : null}

            {showOverflow ? (
              <DesktopIdeaOverflowMenu
                onRunAgain={() => void onRunAgain?.()}
                onMoveToProject={() => setProjectPickerOpen(true)}
                onDeleteIdea={() => setDeleteIdeaOpen(true)}
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

      <DeleteRecordingSheet
        open={deleteIdeaOpen}
        busy={deletingIdea}
        runCount={data.latestRun ? 1 : 0}
        onClose={() => setDeleteIdeaOpen(false)}
        onConfirm={handleDeleteIdea}
      />
      <OutOfQuotaSheet
        open={outOfQuotaOpen}
        onClose={() => onCloseOutOfQuota?.()}
      />
      <CostHaltSheet open={costHaltOpen} onClose={() => onCloseCostHalt?.()} />
      <RunInProgressDialog
        open={concurrentActiveRunId != null}
        sameIdea={sameIdeaConflict}
        activeIdeaTitle={sameIdeaConflict ? data.recording.title : null}
        activeStageLabel={
          sameIdeaStageMeta
            ? `Stage ${sameIdeaStageMeta.index} of ${sameIdeaStageMeta.total}`
            : null
        }
        watchHref={
          sameIdeaConflict ? `/ideas/${data.recording.id}` : "/projects"
        }
        onClose={() => onCloseConcurrentRun?.()}
      />
    </>
  );
};

export default DesktopIdeaHeader;
