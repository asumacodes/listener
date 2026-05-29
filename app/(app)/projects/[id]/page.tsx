import ProjectDetailView from "@/components/projects/ProjectDetailView";
import Wordmark from "@/components/Wordmark";
import { getProjectWithRecordings } from "@/lib/projects/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

const ProjectDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const { project, recordings } = await getProjectWithRecordings(id);

  if (!project) notFound();

  return (
    <main className="mx-auto w-full max-w-[640px] px-6 pt-4">
      <Wordmark />
      <ProjectDetailView project={project} recordings={recordings} />
    </main>
  );
};

export default ProjectDetailPage;
