import IdeaDetailView from "@/components/ideas/IdeaDetailView";
import { getIdeaDetail } from "@/lib/ideas/server";
import { appShellClass } from "@/lib/layout/shell";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ recordingId: string }> };

const IdeaDetailPage = async ({ params }: PageProps) => {
  const { recordingId } = await params;
  const data = await getIdeaDetail(recordingId);

  if (!data) notFound();

  return (
    <main className={`${appShellClass} flex min-h-0 flex-1 flex-col`}>
      <IdeaDetailView data={data} />
    </main>
  );
};

export default IdeaDetailPage;
