import SkeletonIdeaDetail from "@/components/ui/skeleton/SkeletonIdeaDetail";
import { appShellClass } from "@/lib/layout/shell";

/** Streams while getIdeaDetail runs on the server (the page awaits it). */
const IdeaDetailLoading = () => (
  <main className={`${appShellClass} flex min-h-0 flex-1 flex-col`}>
    <SkeletonIdeaDetail />
  </main>
);

export default IdeaDetailLoading;
