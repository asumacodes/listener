import DesktopIdeaView from "@/components/desktop/DesktopIdeaView";
import { getIdeaDetail } from "@/lib/ideas/server";
import { notFound } from "next/navigation";

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

  // Loading UI lives in ./loading.tsx — it streams while getIdeaDetail runs.
  return <DesktopIdeaView data={data} />;
};

export default DesktopIdeaPage;
