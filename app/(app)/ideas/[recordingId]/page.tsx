import IdeaDetailView from "@/components/ideas/IdeaDetailView";
import { getIdeaDetail } from "@/lib/ideas/server";
import { appShellClass } from "@/lib/layout/shell";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ recordingId: string }>;
  searchParams: Promise<{ run?: string | string[] }>;
};

const selectedRunParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const IdeaDetailPage = async ({ params, searchParams }: PageProps) => {
  const { recordingId } = await params;
  const query = await searchParams;
  const data = await getIdeaDetail(recordingId, selectedRunParam(query.run));

  if (!data) notFound();

  return (
    <main className={`${appShellClass} flex min-h-0 flex-1 flex-col`}>
      <IdeaDetailView data={data} />
    </main>
  );
};

export default IdeaDetailPage;
