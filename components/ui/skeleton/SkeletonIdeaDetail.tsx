import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard";
import SkeletonRegion from "@/components/ui/skeleton/SkeletonRegion";
import { copy } from "@/lib/design/copy";

/**
 * Mobile idea detail (IdeaDetailView) while the server loads it — header,
 * recording strip, project chip, run eyebrow, and the artifact card stack.
 */
const SkeletonIdeaDetail = () => (
  <SkeletonRegion
    label={copy.loading.idea}
    className="flex min-h-0 flex-1 flex-col gap-4 pt-3"
  >
    <div className="flex h-11 items-center justify-between">
      <SkeletonBar className="h-6 w-6 rounded-md" />
      <SkeletonBar className="h-5 w-40" />
      <SkeletonBar className="h-6 w-6 rounded-md" />
    </div>
    <SkeletonCard className="flex items-center gap-3 p-3.5">
      <SkeletonBar className="h-10 w-10 shrink-0 rounded-full" />
      <SkeletonBar className="h-2 flex-1 rounded-full" />
      <SkeletonBar className="h-3 w-10" />
    </SkeletonCard>
    <SkeletonBar className="h-9 w-36 rounded-full" />
    <SkeletonBar className="mt-2 h-2.5 w-32" />
    {Array.from({ length: 4 }, (_, i) => (
      <SkeletonCard key={i} className="flex items-center gap-3 px-4 py-4">
        <SkeletonBar className="h-8 w-8 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-2">
          <SkeletonBar className="h-4 w-[45%]" />
          <SkeletonBar className="h-3 w-[70%]" />
        </div>
      </SkeletonCard>
    ))}
  </SkeletonRegion>
);

export default SkeletonIdeaDetail;
