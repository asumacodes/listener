"use client";

import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";

const DesktopIdeaSkeleton = () => (
  <div
    className="flex min-h-0 flex-1"
    aria-busy="true"
    aria-label="Loading idea"
  >
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
);

export default DesktopIdeaSkeleton;
