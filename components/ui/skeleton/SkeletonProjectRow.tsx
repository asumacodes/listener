import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard";

/** Mirrors `ProjectCard` — colour dot, name bar, meta bar. */
const SkeletonProjectRow = () => (
  <SkeletonCard className="flex items-center gap-4 p-[18px]">
    <SkeletonBar className="h-8 w-8 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2.5">
      <SkeletonBar className="h-5 w-[58%] max-w-[200px]" />
      <SkeletonBar className="h-3 w-[38%] max-w-[120px]" />
    </div>
  </SkeletonCard>
);

export default SkeletonProjectRow;
