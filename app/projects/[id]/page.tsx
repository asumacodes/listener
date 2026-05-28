import ProjectDetailView from "@/components/projects/ProjectDetailView";
import { getProjectWithRecordings } from "@/lib/projects/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

const ProjectDetailPage = async ({ params }: PageProps) => {
  const { id } = await params;
  const { project, recordings } = await getProjectWithRecordings(id);

  if (!project) notFound();

  return <ProjectDetailView project={project} recordings={recordings} />;
};

export default ProjectDetailPage;
