import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import SkeletonRegion from "@/components/ui/skeleton/SkeletonRegion";
import { copy } from "@/lib/design/copy";

/**
 * Desktop idea route fallback (loading.tsx) — header, 260px artifact rail,
 * reading pane. Mirrors DesktopIdeaHeader + DesktopIdeaView.
 */
const DesktopIdeaSkeleton = () => (
  <SkeletonRegion
    label={copy.loading.idea}
    className="flex min-h-0 flex-1 flex-col bg-canvas"
  >
    <div className="shrink-0 border-b border-border px-11 pt-[26px] pb-[22px]">
      <SkeletonBar className="h-3 w-56" />
      <div className="mt-4 flex items-end gap-7">
        <SkeletonBar className="h-10 w-80" />
        <SkeletonBar className="h-9 w-56 rounded-full" />
        <SkeletonBar className="ml-auto h-9 w-32 rounded-full" />
      </div>
    </div>
    <div className="flex min-h-0 flex-1">
      <div className="w-[260px] shrink-0 border-r border-border p-5">
        <SkeletonBar className="mb-4 h-3 w-24" />
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonBar key={i} className="mb-2 h-10 w-full" />
        ))}
      </div>
      <div className="flex-1 p-8">
        <SkeletonBar className="h-3 w-40" />
        <SkeletonBar className="mt-4 h-8 w-2/3" />
        <SkeletonBar className="mt-8 h-4 w-full" />
        <SkeletonBar className="mt-3 h-4 w-5/6" />
        <SkeletonBar className="mt-3 h-4 w-4/6" />
      </div>
    </div>
  </SkeletonRegion>
);

export default DesktopIdeaSkeleton;
