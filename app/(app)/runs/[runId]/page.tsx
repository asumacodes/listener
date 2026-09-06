import { getRecordingIdForRun } from "@/lib/ideas/server";
import { redirect } from "next/navigation";

type PageProps = { params: Promise<{ runId: string }> };

export default async function RunDashboardPage({ params }: PageProps) {
  const { runId } = await params;
  const recordingId = await getRecordingIdForRun(runId);

  if (recordingId) {
    redirect(`/ideas/${recordingId}?run=${runId}`);
  }

  redirect("/projects");
}
