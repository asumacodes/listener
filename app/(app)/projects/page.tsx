import ProjectsShellHeader from "@/components/layout/ProjectsShellHeader";
import ProjectListScreen from "@/screens/ProjectListScreen";
import { appShellClass } from "@/lib/layout/shell";

export const dynamic = "force-dynamic";

const ProjectsPage = () => (
  <main className={`${appShellClass} flex min-h-0 flex-1 flex-col`}>
    <ProjectsShellHeader />
    <ProjectListScreen />
  </main>
);

export default ProjectsPage;
