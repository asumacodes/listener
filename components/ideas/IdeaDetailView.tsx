"use client";

import RecordingStrip from "@/components/cards/RecordingStrip";
import ExpiredResultsCard from "@/components/ideas/ExpiredResultsCard";
import LatestRunDashboard from "@/components/ideas/LatestRunDashboard";
import RunHistory from "@/components/ideas/RunHistory";
import AppShellHeader, {
  BackButton,
  MoreButton,
} from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import ProjectChip from "@/components/projects/ProjectChip";
import DeleteRecordingSheet from "@/components/confirm/DeleteRecordingSheet";
import useProjectPicker from "@/hooks/useProjectPicker";
import { formatShortDate } from "@/lib/format-date";
import { ui } from "@/lib/design/ui";
import { deleteRecording } from "@/lib/recordings/client";
import { retryPipelineRun, startPipelineRun } from "@/lib/murmur/client";
import type { IdeaDetailData } from "@/types/ideas";
import { useRouter } from "next/navigation";
import { useState } from "react";

type IdeaDetailViewProps = {
  data: IdeaDetailData;
};

const IdeaDetailView = ({ data }: IdeaDetailViewProps) => {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
            <LatestRunDashboard
              latestRun={data.latestRun}
              runResults={data.latestRunResults}
              transcription={data.recording.transcription}
              onRetry={retrying ? undefined : handleRetry}
            />
          )}
        </div>

        <RunHistory
          runs={data.runs}
          recordingId={data.recording.id}
          projectIsDefault={data.project.isDefault}
        />
      </ScrollBody>

      <DeleteRecordingSheet
        open={deleteOpen}
        busy={deleting}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default IdeaDetailView;
