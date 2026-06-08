import ProjectDetailView from "@/components/projects/ProjectDetailView";
import { getProjectWithRecordings } from "@/lib/projects/server";
import { appShellClass } from "@/lib/layout/shell";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

const ProjectDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const { project, recordings } = await getProjectWithRecordings(id);

  if (!project) notFound();

  return (
    <main className={`${appShellClass} flex min-h-0 flex-1 flex-col`}>
      <ProjectDetailView project={project} recordings={recordings} />
    </main>
  );
};

export default ProjectDetailPage;
