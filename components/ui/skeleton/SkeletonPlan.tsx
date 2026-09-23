import SkeletonBar from "@/components/ui/skeleton/SkeletonBar";
import SkeletonCard from "@/components/ui/skeleton/SkeletonCard";
import SkeletonRegion from "@/components/ui/skeleton/SkeletonRegion";
import { copy } from "@/lib/design/copy";

/** Mirrors the AllowanceCard — eyebrow, big number, meter, reset line. */
const AllowanceSkeleton = ({ desktop }: { desktop: boolean }) => (
  <SkeletonCard
    className={`flex flex-col gap-3 ${desktop ? "px-[26px] py-6" : "px-4 py-4"}`}
  >
    <SkeletonBar className="h-2.5 w-28" />
    <SkeletonBar className={desktop ? "h-12 w-20" : "h-9 w-16"} />
    <SkeletonBar className="h-2 w-full rounded-full" />
    <SkeletonBar className="h-3 w-44" />
  </SkeletonCard>
);

/**
 * Plan & usage body while the balance loads — plan card + allowance card, in
 * the mobile (PlanUsageScreen) or desktop (DesktopPlanScreen) layout.
 */
const SkeletonPlan = ({ variant }: { variant: "mobile" | "desktop" }) => {
  if (variant === "desktop") {
    return (
      <SkeletonRegion label={copy.loading.plan} className="flex flex-col gap-5">
        <SkeletonCard className="flex items-start gap-6 px-[26px] py-6">
          <div className="min-w-0 flex-1 space-y-3">
            <SkeletonBar className="h-2.5 w-24" />
            <SkeletonBar className="h-8 w-40" />
            <SkeletonBar className="h-4 w-64" />
          </div>
          <div className="flex shrink-0 gap-2.5">
            <SkeletonBar className="h-9 w-28 rounded-full" />
            <SkeletonBar className="h-9 w-24 rounded-full" />
          </div>
        </SkeletonCard>
        <AllowanceSkeleton desktop />
      </SkeletonRegion>
    );
  }

  return (
    <SkeletonRegion label={copy.loading.plan} className="flex flex-col gap-4">
      <section>
        <SkeletonBar className="mb-2.5 h-2.5 w-24" />
        <SkeletonCard className="flex flex-col gap-3 px-4 py-3.5">
          <SkeletonBar className="h-7 w-32" />
          <SkeletonBar className="h-4 w-48" />
          <div className="grid grid-cols-2 gap-2.5">
            <SkeletonBar className="h-12 rounded-xl" />
            <SkeletonBar className="h-12 rounded-xl" />
          </div>
        </SkeletonCard>
      </section>
      <section>
        <SkeletonBar className="mb-2.5 h-2.5 w-16" />
        <AllowanceSkeleton desktop={false} />
      </section>
    </SkeletonRegion>
  );
};

export default SkeletonPlan;
