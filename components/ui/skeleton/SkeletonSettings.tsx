import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard";
import SkeletonRegion from "@/components/ui/skeleton/SkeletonRegion";
import { copy } from "@/lib/design/copy";
import { appShellClass } from "@/lib/layout/shell";

/** Profile card — avatar + change-photo, a field or two, save button. */
const ProfileCardSkeleton = ({ desktop }: { desktop: boolean }) => (
  <SkeletonCard className={`space-y-5 ${desktop ? "p-5" : "p-4"}`}>
    <div className="flex items-center gap-4">
      <SkeletonBar className="h-16 w-16 shrink-0 rounded-full" />
      <SkeletonBar className="h-10 w-32 rounded-xl" />
    </div>
    <div className={desktop ? "grid grid-cols-2 gap-4" : "space-y-5"}>
      <SkeletonBar className="h-12 w-full rounded-xl" />
      <SkeletonBar className="h-12 w-full rounded-xl" />
    </div>
    <SkeletonBar className={`h-12 rounded-xl ${desktop ? "w-36" : "w-full"}`} />
  </SkeletonCard>
);

const SmallCardSkeleton = () => (
  <SkeletonCard className="space-y-3 p-4">
    <SkeletonBar className="h-3 w-3/4" />
    <SkeletonBar className="h-12 w-full rounded-xl" />
  </SkeletonCard>
);

/**
 * Settings route fallback (Suspense) — mirrors the mobile stacked sections or
 * the desktop header + side nav + card grid, instead of a blank page or text.
 */
const SkeletonSettings = ({ variant }: { variant: "mobile" | "desktop" }) => {
  if (variant === "desktop") {
    return (
      <SkeletonRegion
        label={copy.loading.settings}
        className="flex min-h-0 flex-1 flex-col bg-canvas"
      >
        <div className="flex h-[78px] shrink-0 items-center gap-4 border-b border-border px-11">
          <SkeletonBar className="h-3 w-16" />
          <SkeletonBar className="h-7 w-32" />
        </div>
        <div className="flex min-h-0 flex-1">
          <div className="w-56 shrink-0 space-y-3 border-r border-border bg-surface px-4 py-[30px]">
            {Array.from({ length: 6 }, (_, i) => (
              <SkeletonBar key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
          <div className="min-w-0 flex-1 px-11 py-[34px]">
            <div className="grid grid-cols-[1.35fr_1fr] gap-5">
              <ProfileCardSkeleton desktop />
              <SmallCardSkeleton />
            </div>
          </div>
        </div>
      </SkeletonRegion>
    );
  }

  return (
    <SkeletonRegion
      label={copy.loading.settings}
      className={`${appShellClass} flex min-h-0 flex-1 flex-col gap-6 pt-4`}
    >
      <SkeletonBar className="mx-auto h-6 w-28" />
      <section className="space-y-3">
        <SkeletonBar className="h-2.5 w-16" />
        <ProfileCardSkeleton desktop={false} />
      </section>
      <section className="space-y-3">
        <SkeletonBar className="h-2.5 w-28" />
        <SmallCardSkeleton />
      </section>
    </SkeletonRegion>
  );
};

export default SkeletonSettings;
