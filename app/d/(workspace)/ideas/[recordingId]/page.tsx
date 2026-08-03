import DesktopIdeaView from "@/components/desktop/DesktopIdeaView";
import DesktopIdeaSkeleton from "@/components/desktop/DesktopIdeaSkeleton";
import { getIdeaDetail } from "@/lib/ideas/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ recordingId: string }>;
  searchParams: Promise<{ run?: string | string[] }>;
};

const selectedRunParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const DesktopIdeaPage = async ({ params, searchParams }: PageProps) => {
  const { recordingId } = await params;
  const query = await searchParams;
  const data = await getIdeaDetail(recordingId, selectedRunParam(query.run));

  if (!data) notFound();

  return (
    <Suspense fallback={<DesktopIdeaSkeleton />}>
      <DesktopIdeaView data={data} />
    </Suspense>
  );
};

export default DesktopIdeaPage;
