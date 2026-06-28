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
import useProjectPicker from "@/hooks/useProjectPicker";
import { formatShortDate } from "@/lib/format-date";
import { ui } from "@/lib/design/ui";
import { deleteRecording } from "@/lib/recordings/client";
import { deleteRun } from "@/lib/runs/client";
import { retryPipelineRun, startPipelineRun } from "@/lib/murmur/client";
import type { IdeaDetailData, IdeaRunSummary } from "@/types/ideas";
import { useRouter } from "next/navigation";
import { useState } from "react";

type IdeaDetailViewProps = {
  data: IdeaDetailData;
};

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

  const picker = useProjectPicker({
    recordingId: data.recording.id,
    currentProjectId: data.project.id,
    enabled: true,
  });

  const latestEyebrow = data.latestRun
    ? `Latest run · ${formatShortDate(data.latestRun.createdAt)}`
    : "No pipeline runs yet";

  const retentionPhase = getRetentionPhase(
    data.latestRun,
    data.latestRunRetention
  );
  const graceDays = graceDaysRemaining(data.latestRunRetention);

  const handleRerun = async () => {
    setRerunning(true);
    try {
      const result = await startPipelineRun(data.recording.id);
      if (result.ok) {
        router.refresh();
      }
    } finally {
      setRerunning(false);
    }
  };

  const handleRetry = async () => {
    if (!data.latestRun) return;
    setRetrying(true);
    try {
      await retryPipelineRun(data.latestRun.id);
      router.refresh();
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
          <p className={`${ui.eyebrow} mb-2`}>{latestEyebrow}</p>
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
    </div>
  );
};

export default IdeaDetailView;
