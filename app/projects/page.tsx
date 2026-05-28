import ProjectListScreen from "@/screens/ProjectListScreen";
import Link from "next/link";

export const dynamic = "force-dynamic";

const ProjectsPage = () => {
  return (
    <main className="mx-auto w-full max-w-[640px] px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-text">Projects</h1>
        <Link href="/" className="text-sm text-text-secondary underline">
          Record
        </Link>
      </div>
      <ProjectListScreen />
    </main>
  );
};

export default ProjectsPage;
