"use client";

import RecordingStrip from "@/components/cards/RecordingStrip";
import ExpiredResultsCard from "@/components/ideas/ExpiredResultsCard";
import LatestRunDashboard from "@/components/ideas/LatestRunDashboard";
import RunHistory from "@/components/ideas/RunHistory";
import ExpiryBanner from "@/components/pipeline/run/ExpiryBanner";
import { getRetentionPhase, graceDaysRemaining } from "@/lib/ideas/run-expiry";
import AppShellHeader, {
  BackButton,
  MoreButton,
} from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import ProjectChip from "@/components/projects/ProjectChip";
import DeleteRecordingSheet from "@/components/confirm/DeleteRecordingSheet";
import DeleteRunSheet from "@/components/confirm/DeleteRunSheet";
import OutOfQuotaSheet from "@/components/confirm/OutOfQuotaSheet";
import RunInProgressSheet from "@/components/confirm/RunInProgressSheet";
import useProjectPicker from "@/hooks/useProjectPicker";
import { formatShortDate } from "@/lib/format-date";
import { ui } from "@/lib/design/ui";
import { deleteRecording } from "@/lib/recordings/client";
import { deleteRun } from "@/lib/runs/client";
import { resumePipelineRun, startPipelineRun } from "@/lib/murmur/client";
import type { IdeaDetailData, IdeaRunSummary } from "@/types/ideas";
import { useRouter } from "next/navigation";
import { useState } from "react";

type IdeaDetailViewProps = {
  data: IdeaDetailData;
};

type PipelineStartResult = Awaited<ReturnType<typeof startPipelineRun>>;
type PipelineResumeResult = Awaited<ReturnType<typeof resumePipelineRun>>;

const IdeaDetailView = ({ data }: IdeaDetailViewProps) => {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRunTarget, setDeleteRunTarget] = useState<IdeaRunSummary | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [deletingRun, setDeletingRun] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [rerunning, setRerunning] = useState(false);
  const [concurrentActiveRunId, setConcurrentActiveRunId] = useState<
    string | null
  >(null);
  const [outOfQuotaOpen, setOutOfQuotaOpen] = useState(false);

  const picker = useProjectPicker({
    recordingId: data.recording.id,
    currentProjectId: data.project.id,
    enabled: true,
  });

  const newestRunId = data.runs[0]?.id ?? null;
  const runEyebrow = data.latestRun
    ? `${data.latestRun.id === newestRunId ? "Latest run" : "Selected run"} · ${formatShortDate(data.latestRun.createdAt)}`
    : "No pipeline runs yet";

  const retentionPhase = getRetentionPhase(
    data.latestRun,
    data.latestRunRetention
  );
  const graceDays = graceDaysRemaining(data.latestRunRetention);

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
    }
  };

  const handlePipelineStart = async (
    setBusy: (busy: boolean) => void
  ): Promise<void> => {
    setBusy(true);
    try {
      const result = await startPipelineRun(data.recording.id);
      applyPipelineResult(result);
    } finally {
      setBusy(false);
    }
  };

  const handleRerun = () => handlePipelineStart(setRerunning);

  // KAN-54: failed runs resume via /api/murmur/resume (no balance gate, linked
  // row). Fresh kickoff only for non-resumable failures (no stage started) or
  // when /resume returns not_resumable (server fromStage race).
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
          const kickoffResult = await startPipelineRun(data.recording.id);
          applyPipelineResult(kickoffResult);
          return;
        }
        applyPipelineResult(resumeResult);
        return;
      }

      const kickoffResult = await startPipelineRun(data.recording.id);
      applyPipelineResult(kickoffResult);
    } finally {
      setRetrying(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteRecording(data.recording.id);
      router.push("/projects");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteRun = async () => {
    if (!deleteRunTarget) return;
    setDeletingRun(true);
    try {
      await deleteRun(deleteRunTarget.id);
      setDeleteRunTarget(null);
      router.refresh();
    } finally {
      setDeletingRun(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <AppShellHeader
        left={<BackButton onClick={() => router.back()} />}
        title={data.recording.title}
        right={<MoreButton onClick={() => setDeleteOpen(true)} />}
      />

      <ScrollBody className="gap-4 pb-24">
        <div className="flex flex-col gap-2.5">
          <RecordingStrip
            signedUrl={data.recording.signedUrl}
            durationSeconds={data.recording.durationSeconds}
            recordedAt={data.recording.createdAt}
          />

          <ProjectChip {...picker} suggestedName={null} />
        </div>

        <div>
          <p className={`${ui.eyebrow} mb-2`}>{runEyebrow}</p>
          {data.resultsExpired ? (
            <ExpiredResultsCard onRerun={handleRerun} busy={rerunning} />
          ) : (
            <div className="space-y-3">
              {retentionPhase === "grace" ? (
                <ExpiryBanner daysRemaining={graceDays} />
              ) : null}
              <LatestRunDashboard
                latestRun={data.latestRun}
                runResults={data.latestRunResults}
                transcription={data.recording.transcription}
                onRetry={retrying ? undefined : handleRetry}
              />
            </div>
          )}
        </div>

        <RunHistory
          runs={data.runs}
          recordingId={data.recording.id}
          selectedRunId={data.selectedRunId}
          onRequestDeleteRun={(run) => setDeleteRunTarget(run)}
        />
      </ScrollBody>

      <DeleteRecordingSheet
        open={deleteOpen}
        runCount={data.runs.length}
        busy={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />

      <DeleteRunSheet
        open={deleteRunTarget !== null}
        busy={deletingRun}
        onClose={() => {
          if (!deletingRun) setDeleteRunTarget(null);
        }}
        onConfirm={handleDeleteRun}
      />

      <RunInProgressSheet
        open={concurrentActiveRunId !== null}
        onClose={() => setConcurrentActiveRunId(null)}
        onGoToPipeline={() => {
          setConcurrentActiveRunId(null);
          // Home Record flow rehydrates the live run via session restore.
          router.push("/");
        }}
      />

      <OutOfQuotaSheet
        open={outOfQuotaOpen}
        onClose={() => setOutOfQuotaOpen(false)}
      />
    </div>
  );
};

export default IdeaDetailView;
