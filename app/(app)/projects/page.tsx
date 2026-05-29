import Wordmark from "@/components/Wordmark";
import ProjectListScreen from "@/screens/ProjectListScreen";

export const dynamic = "force-dynamic";

const ProjectsPage = () => (
  <main className="mx-auto w-full max-w-[640px] px-6 pt-4">
    <Wordmark />
    <h2 className="mt-6 font-serif text-3xl text-text">Projects</h2>
    <ProjectListScreen />
  </main>
);

export default ProjectsPage;
