import SkeletonProjectRow from "@/components/ui/skeleton/SkeletonProjectRow";

const ROW_COUNT = 3;

const SkeletonProjectList = () => (
  <ul
    className="flex flex-1 flex-col gap-3 pt-2"
    aria-busy="true"
    aria-label="Loading projects"
  >
    {Array.from({ length: ROW_COUNT }, (_, i) => (
      <li key={i}>
        <SkeletonProjectRow />
      </li>
    ))}
  </ul>
);

export default SkeletonProjectList;
