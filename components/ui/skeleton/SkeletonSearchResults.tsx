import SkeletonSearchResultRow from "@/components/ui/skeleton/SkeletonSearchResultRow";

const ROW_COUNT = 4;

const SkeletonSearchResults = () => (
  <div className="flex flex-col gap-3" aria-busy="true" aria-label="Searching">
    {Array.from({ length: ROW_COUNT }, (_, i) => (
      <SkeletonSearchResultRow key={i} />
    ))}
  </div>
);

export default SkeletonSearchResults;
