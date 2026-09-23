import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import SkeletonProjectRow from "@/components/ui/skeleton/SkeletonProjectRow";
import SkeletonRegion from "@/components/ui/skeleton/SkeletonRegion";
import { copy } from "@/lib/design/copy";

/** Mobile project detail while the server loads it — header + idea rows. */
const SkeletonProjectDetail = () => (
  <SkeletonRegion
    label={copy.loading.project}
    className="flex min-h-0 flex-1 flex-col gap-3 pt-3"
  >
    <div className="flex flex-col items-center gap-2 pb-3">
      <div className="flex h-11 w-full items-center justify-between">
        <SkeletonBar className="h-6 w-6 rounded-md" />
        <SkeletonBar className="h-5 w-36" />
        <span className="w-6" />
      </div>
      <SkeletonBar className="h-3 w-24" />
    </div>
    {Array.from({ length: 4 }, (_, i) => (
      <SkeletonProjectRow key={i} />
    ))}
  </SkeletonRegion>
);

export default SkeletonProjectDetail;
