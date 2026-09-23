import SkeletonProjectDetail from "@/components/ui/skeleton/SkeletonProjectDetail";
import { appShellClass } from "@/lib/layout/shell";

/** Streams while getProjectWithRecordings runs on the server. */
const ProjectDetailLoading = () => (
  <main className={`${appShellClass} flex min-h-0 flex-1 flex-col`}>
    <SkeletonProjectDetail />
  </main>
);

export default ProjectDetailLoading;
