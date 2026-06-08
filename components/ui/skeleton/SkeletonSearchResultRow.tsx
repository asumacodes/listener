import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard";

/** Mirrors search result cards — title, snippet, project dot. */
const SkeletonSearchResultRow = () => (
  <SkeletonCard className="relative py-4 pr-[30px] pl-4">
    <SkeletonBar className="h-[18px] w-[52%] max-w-[220px]" />
    <SkeletonBar className="mt-2.5 h-3 w-[88%] max-w-[280px]" />
    <SkeletonBar className="absolute top-[18px] right-4 h-3 w-3 rounded-full" />
  </SkeletonCard>
);

export default SkeletonSearchResultRow;
