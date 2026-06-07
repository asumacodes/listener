import AppShellHeader from "@/components/layout/AppShellHeader";
import ScrollBody from "@/components/layout/ScrollBody";
import ProjectListScreen from "@/screens/ProjectListScreen";
import { appShellClass } from "@/lib/layout/shell";

export const dynamic = "force-dynamic";

const ProjectsPage = () => (
  <main className={`${appShellClass} min-h-[calc(100dvh-4.5rem)]`}>
    <AppShellHeader title="Projects" />
    <ScrollBody>
      <ProjectListScreen />
    </ScrollBody>
  </main>
);

export default ProjectsPage;
