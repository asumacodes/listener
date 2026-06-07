"use client";

import RecordingStrip from "@/components/cards/RecordingStrip";
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
import { ui } from "@/lib/design/ui";
import { deleteRecording } from "@/lib/recordings/client";
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

  const picker = useProjectPicker({
    recordingId: data.recording.id,
    currentProjectId: data.project.id,
    enabled: true,
  });

  const latestEyebrow = data.latestRun
    ? `Latest run · ${new Date(data.latestRun.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${data.latestRun.status}`
    : "No pipeline runs yet";

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
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-col">
      <AppShellHeader
        left={<BackButton onClick={() => router.back()} />}
        title={data.recording.title}
        right={<MoreButton onClick={() => setDeleteOpen(true)} />}
      />

      <ScrollBody className="pb-8">
        <RecordingStrip
          signedUrl={data.recording.signedUrl}
          durationSeconds={data.recording.durationSeconds}
          recordedAt={data.recording.createdAt}
        />

        <ProjectChip {...picker} suggestedName={null} />

        <div className="mt-6">
          <p className={`${ui.eyebrow} mb-3`}>{latestEyebrow}</p>
          <LatestRunDashboard latestRun={data.latestRun} />
        </div>

        <RunHistory runs={data.runs} recordingId={data.recording.id} />
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
